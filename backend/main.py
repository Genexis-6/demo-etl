import sys
from pathlib import Path

# Ensure backend directory and project root are in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
ROOT_DIR = BACKEND_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import asyncio
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.store import db_session_manager, WarehouseQueries
from core.utils.logger import get_logger
try:
    from orchestrator import orchestrator
except ImportError:
    from backend.orchestrator import orchestrator

logger = get_logger("api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    await db_session_manager.init_db()
    logger.info("ETL Warehouse SQLite database initialized successfully.")
    yield

app = FastAPI(title="ETL Pipeline Studio API", lifespan=lifespan)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartETLRequest(BaseModel):
    query: str = "phone"
    pages: int = 1
    semaphore_limit: int = 8
    batch_size: int = 10
    batch_delay: float = 1.2

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "etl_backend"}

@app.get("/api/etl/status")
async def get_etl_status():
    return orchestrator.stats

@app.post("/api/etl/start")
async def start_etl(req: StartETLRequest):
    return await orchestrator.start_etl(
        query=req.query,
        pages=req.pages,
        semaphore_limit=req.semaphore_limit,
        batch_size=req.batch_size,
        batch_delay=req.batch_delay
    )

@app.post("/api/etl/stop")
async def stop_etl():
    return await orchestrator.stop_etl()

@app.get("/api/warehouse/products")
async def get_products(
    query: Optional[str] = None,
    platform: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    async with db_session_manager.session() as session:
        warehouse = WarehouseQueries(session)
        return await warehouse.get_products(query=query, platform=platform, limit=limit, offset=offset)

@app.get("/api/warehouse/metrics")
async def get_warehouse_metrics():
    async with db_session_manager.session() as session:
        warehouse = WarehouseQueries(session)
        return await warehouse.get_metrics()

@app.delete("/api/warehouse/clear")
async def clear_warehouse():
    async with db_session_manager.session() as session:
        warehouse = WarehouseQueries(session)
        deleted = await warehouse.clear_all()
        return {"status": "cleared", "deleted_rows": deleted}

@app.websocket("/ws/etl")
async def websocket_etl_endpoint(websocket: WebSocket):
    await websocket.accept()
    subscriber_queue = orchestrator.register_subscriber()
    logger.info("New WebSocket client connected to /ws/etl")

    # Send initial state snapshot
    await websocket.send_json({
        "type": "init_state",
        "data": orchestrator.stats
    })

    async def _client_receiver():
        try:
            while True:
                msg = await websocket.receive_json()
                action = msg.get("action")
                if action == "start":
                    await orchestrator.start_etl(
                        query=msg.get("query", "phone"),
                        pages=int(msg.get("pages", 1)),
                        semaphore_limit=int(msg.get("semaphore_limit", 8)),
                        batch_size=int(msg.get("batch_size", 10)),
                        batch_delay=float(msg.get("batch_delay", 1.2))
                    )
                elif action == "stop":
                    await orchestrator.stop_etl()
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.debug(f"Client receiver error: {e}")

    async def _server_broadcaster():
        try:
            while True:
                payload = await subscriber_queue.get()
                await websocket.send_json(payload)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.debug(f"Broadcaster disconnect: {e}")

    receiver_task = asyncio.create_task(_client_receiver())
    broadcaster_task = asyncio.create_task(_server_broadcaster())

    done, pending = await asyncio.wait(
        [receiver_task, broadcaster_task],
        return_when=asyncio.FIRST_COMPLETED
    )

    for task in pending:
        task.cancel()

    orchestrator.unregister_subscriber(subscriber_queue)
    logger.info("WebSocket client disconnected from /ws/etl")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
