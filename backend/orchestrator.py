import asyncio
import time
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
import json

from core.config import settings
from core.utils.logger import get_logger, register_log_listener
from core.store import (
    db_session_manager,
    ProductSchemas,
    JumiaQueries,
    KongaQueries,
    JijiQueries,
    WarehouseQueries,
)
from etl.filter_product import filter_products, _build_filter_regex
from etl.jumia.extractor import extract_jumia
from etl.konga.extractor import extract_konga
from etl.jiji.extractor import extract_jiji
from etl.jumia.transformer import transform_jumia
from etl.konga.transformer import transform_konga
from etl.jiji.transformer import transform_jiji
from etl.http_client import set_sem_listener

logger = get_logger("orchestrator")


class ETLOrchestrator:
    def __init__(self):
        self.is_running = False
        self.current_task: Optional[asyncio.Task] = None
        self.subscribers: Set[asyncio.Queue] = set()

        # Stats state
        self.stats = {
            "status": "idle",
            "query": "tecno phone",
            "pages": 1,
            "semaphore_limit": settings.SEMAPHORE_LIMIT,
            "batch_size": settings.BATCH_SIZE,
            "batch_delay": settings.BATCH_DELAY,
            "used_slots": 0,
            "total_extracted": 0,
            "total_filtered": 0,
            "total_loaded": 0,
            "total_retries": 0,
            "elapsed_seconds": 0.0,
            "platforms": {
                "jumia": {"stage": "idle", "progress": 0, "extracted": 0, "filtered": 0, "loaded": 0, "retries": 0},
                "konga": {"stage": "idle", "progress": 0, "extracted": 0, "filtered": 0, "loaded": 0, "retries": 0},
                "jiji":  {"stage": "idle", "progress": 0, "extracted": 0, "filtered": 0, "loaded": 0, "retries": 0},
            }
        }

        # Hook logger callback to WebSocket dispatch
        register_log_listener(self._on_log_emitted)

        # Hook semaphore listener from real http_client
        set_sem_listener(self._on_semaphore_change)

    def _on_log_emitted(self, log_record: dict):
        self.broadcast_sync({
            "type": "log_event",
            "data": log_record
        })

    def register_subscriber(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=300)
        self.subscribers.add(q)
        return q

    def unregister_subscriber(self, q: asyncio.Queue):
        if q in self.subscribers:
            self.subscribers.remove(q)

    def broadcast_sync(self, payload: dict):
        if self.subscribers:
            for q in list(self.subscribers):
                try:
                    q.put_nowait(payload)
                except asyncio.QueueFull:
                    try:
                        q.get_nowait()
                        q.put_nowait(payload)
                    except Exception:
                        pass

    async def broadcast(self, payload: dict):
        self.broadcast_sync(payload)

    def _on_semaphore_change(self, used: int, total: int):
        self.stats["used_slots"] = used
        self.broadcast_sync({
            "type": "semaphore_event",
            "data": {"used": used, "total": total}
        })

    async def _run_real_platform_pipeline(
        self,
        platform: str,
        query: str,
        pages: int = 1,
        batch_delay: float = 1.2,
        batch_size: int = 10
    ):
        p_stats = self.stats["platforms"][platform]
        p_stats["stage"] = "scraping_catalog"
        p_stats["progress"] = 10
        logger.info(f"[{platform.upper()}] Starting LIVE web extraction for query='{query}' (pages={pages}, delay={batch_delay}s, batch={batch_size})")

        t0 = time.perf_counter()
        raw_items: List[Dict[str, Any]] = []

        try:
            if platform == "jumia":
                raw_items = await extract_jumia(query, pages=pages, batch_delay=batch_delay, batch_size=batch_size)
            elif platform == "konga":
                raw_items = await extract_konga(query, pages=pages, batch_delay=batch_delay, batch_size=batch_size)
            elif platform == "jiji":
                raw_items = await extract_jiji(query, max_pages=pages, batch_delay=batch_delay, batch_size=batch_size)
        except Exception as e:
            logger.error(f"[{platform.upper()}] Real scraper error: {e}", exc_info=True)
            p_stats["stage"] = f"error: {str(e)[:40]}"
            return

        extraction_latency_ms = (time.perf_counter() - t0) * 1000
        p_stats["extracted"] = len(raw_items)
        self.stats["total_extracted"] += len(raw_items)
        p_stats["progress"] = 50
        logger.info(f"[{platform.upper()}] Live Extraction complete: {len(raw_items)} items fetched in {extraction_latency_ms:.1f}ms")

        await self.broadcast({
            "type": "batch_latency_event",
            "data": {"platform": platform, "batch": f"{platform[:3]}-scrape", "duration_ms": round(extraction_latency_ms, 2)}
        })

        if not raw_items:
            p_stats["stage"] = "no_items_found"
            p_stats["progress"] = 100
            return

        if not self.is_running:
            return

        # 2. Transformation Phase (Clean text, parse currency, regex filter)
        p_stats["stage"] = "transforming"
        logger.info(f"[{platform.upper()}] Transforming {len(raw_items)} live items & applying query-aware regex filter")

        if platform == "jumia":
            cleaned_products = transform_jumia(raw_items, query)
        elif platform == "konga":
            cleaned_products = transform_konga(raw_items, query)
        else:
            cleaned_products = transform_jiji(raw_items, query)

        filter_re = _build_filter_regex(query)
        cleaned_urls = {p.get("product_url") for p in cleaned_products if p.get("product_url")}

        for raw_item in raw_items:
            name_raw = raw_item.get("product_name") or ""
            clean_name = " ".join(name_raw.split()) if name_raw else "Unknown Product"
            product_url = raw_item.get("product_url")
            image_url = raw_item.get("image_url")

            is_kept = product_url in cleaned_urls if product_url else False
            filter_reason = None
            if not is_kept and filter_re and clean_name:
                match = filter_re.search(clean_name)
                filter_reason = match.group(0) if match else "accessory/noise"

            price_raw = str(raw_item.get("price") or "0")
            try:
                numeric_price = float("".join(c for c in price_raw if c.isdigit() or c == "."))
            except Exception:
                numeric_price = 0.0

            if is_kept:
                p_stats["filtered"] = p_stats.get("filtered", 0)
            else:
                p_stats["filtered"] = p_stats.get("filtered", 0) + 1
                self.stats["total_filtered"] += 1

            # Emit real item event to dashboard table
            await self.broadcast({
                "type": "item_event",
                "data": {
                    "platform": platform,
                    "raw_name": name_raw.strip(),
                    "clean_name": clean_name,
                    "raw_price": price_raw,
                    "clean_price": numeric_price,
                    "is_kept": is_kept,
                    "filter_reason": filter_reason,
                    "image_url": image_url,
                    "product_url": product_url,
                    "status": "loaded" if is_kept else "filtered",
                    "timestamp": datetime.utcnow().strftime("%H:%M:%S")
                }
            })
            await asyncio.sleep(0.02)

        p_stats["progress"] = 80
        logger.info(f"[{platform.upper()}] Transformed: {len(raw_items)} raw → {len(cleaned_products)} clean valid products")

        # 3. Load Phase (Bulk SQLite insert via SQLAlchemy Queries)
        p_stats["stage"] = "loading_db"
        t_load_start = time.perf_counter()

        rows = [ProductSchemas(**p) for p in cleaned_products]
        async with db_session_manager.session() as session:
            if platform == "jumia":
                q_handler = JumiaQueries(session)
            elif platform == "konga":
                q_handler = KongaQueries(session)
            else:
                q_handler = JijiQueries(session)

            res = await q_handler.save_bulk_data(rows)
            inserted = res.get("inserted", len(rows))

        p_stats["loaded"] = inserted
        self.stats["total_loaded"] += inserted
        p_stats["progress"] = 100
        p_stats["stage"] = f"completed ({inserted} loaded)"

        load_duration_ms = (time.perf_counter() - t_load_start) * 1000
        logger.info(f"[{platform.upper()}] Successfully bulk-loaded {inserted} real products into SQLite database in {load_duration_ms:.1f}ms")

    async def _throughput_monitor(self):
        prev_ex = 0
        prev_fl = 0
        prev_ld = 0
        t0 = time.time()

        while self.is_running:
            await asyncio.sleep(1.0)
            elapsed = time.time() - t0
            self.stats["elapsed_seconds"] = round(elapsed, 1)

            delta_ex = self.stats["total_extracted"] - prev_ex
            delta_fl = self.stats["total_filtered"] - prev_fl
            delta_ld = self.stats["total_loaded"] - prev_ld

            prev_ex = self.stats["total_extracted"]
            prev_fl = self.stats["total_filtered"]
            prev_ld = self.stats["total_loaded"]

            await self.broadcast({
                "type": "throughput_event",
                "data": {
                    "time": round(elapsed, 1),
                    "extract_rate": delta_ex,
                    "transform_rate": max(0, delta_ex - delta_fl),
                    "load_rate": delta_ld,
                }
            })

            await self.broadcast({
                "type": "stats_event",
                "data": self.stats
            })

    async def start_etl(
        self,
        query: str = "tecno phone",
        pages: int = 1,
        semaphore_limit: int = 8,
        batch_size: int = 10,
        batch_delay: float = 1.2,
        **kwargs
    ) -> Dict[str, Any]:
        if self.is_running:
            return {"status": "already_running", "message": "ETL pipeline is already running."}

        self.is_running = True
        self.stats["status"] = "running"
        self.stats["query"] = query
        self.stats["pages"] = pages
        self.stats["semaphore_limit"] = semaphore_limit
        self.stats["batch_size"] = batch_size
        self.stats["batch_delay"] = batch_delay
        self.stats["total_extracted"] = 0
        self.stats["total_filtered"] = 0
        self.stats["total_loaded"] = 0
        self.stats["total_retries"] = 0
        self.stats["used_slots"] = 0
        self.stats["elapsed_seconds"] = 0.0

        for p in self.stats["platforms"].values():
            p["stage"] = "queued"
            p["progress"] = 0
            p["extracted"] = 0
            p["filtered"] = 0
            p["loaded"] = 0
            p["retries"] = 0

        logger.info(f"=== Starting Real Concurrent ETL Scraper: Query='{query}', Depth={pages} page(s), Delay={batch_delay}s ===")
        await self.broadcast({
            "type": "pipeline_event",
            "event": "started",
            "data": self.stats
        })

        async def _run_all():
            monitor_task = asyncio.create_task(self._throughput_monitor())

            try:
                # Concurrently execute real scrapers across all 3 platforms
                await asyncio.gather(
                    self._run_real_platform_pipeline("jumia", query, pages=pages, batch_delay=batch_delay, batch_size=batch_size),
                    self._run_real_platform_pipeline("konga", query, pages=pages, batch_delay=batch_delay, batch_size=batch_size),
                    self._run_real_platform_pipeline("jiji", query, pages=pages, batch_delay=batch_delay, batch_size=batch_size),
                    return_exceptions=True
                )
                self.stats["status"] = "completed"
                logger.info(f"=== ETL Scraper Finished Successfully · {self.stats['total_loaded']} real products loaded into SQLite warehouse ===")
            except asyncio.CancelledError:
                self.stats["status"] = "stopped"
                logger.warning("=== ETL Scraper Stopped by User ===")
            except Exception as e:
                self.stats["status"] = "error"
                logger.error(f"ETL Pipeline Error: {e}", exc_info=True)
            finally:
                self.is_running = False
                monitor_task.cancel()
                self._on_semaphore_change(0, semaphore_limit)
                await self.broadcast({
                    "type": "pipeline_event",
                    "event": self.stats["status"],
                    "data": self.stats
                })

        self.current_task = asyncio.create_task(_run_all())
        return {"status": "started", "query": query}

    async def stop_etl(self) -> Dict[str, Any]:
        if not self.is_running or not self.current_task:
            return {"status": "not_running", "message": "No active ETL pipeline."}

        self.is_running = False
        self.current_task.cancel()
        self.stats["status"] = "stopped"
        await self.broadcast({
            "type": "pipeline_event",
            "event": "stopped",
            "data": self.stats
        })
        return {"status": "stopped", "message": "ETL pipeline cancelled."}

orchestrator = ETLOrchestrator()
