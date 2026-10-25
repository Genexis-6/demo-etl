from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from .models import ProductModel, ProductSchemas

class BaseQueries:
    def __init__(self, session: AsyncSession, platform: str):
        self.session = session
        self.platform = platform

    async def save_bulk_data(self, rows: List[ProductSchemas]) -> Dict[str, int]:
        if not rows:
            return {"inserted": 0}

        count = 0
        for p in rows:
            data = p.model_dump()
            model = ProductModel(
                platform=self.platform,
                query=data.get("query", ""),
                product_name=data.get("product_name", ""),
                category=data.get("category", "general"),
                price=data.get("price", 0.0),
                currency=data.get("currency", "NGN"),
                rating=data.get("rating"),
                review_count=data.get("review_count"),
                product_url=data.get("product_url"),
                image_url=data.get("image_url"),
                reviews_raw=data.get("reviews_raw"),
                sentiment_score=data.get("sentiment_score"),
                scraped_at=data.get("scraped_at"),
                is_available=data.get("is_available", True),
            )
            self.session.add(model)
            count += 1

        await self.session.flush()
        return {"inserted": count}

class JumiaQueries(BaseQueries):
    def __init__(self, session: AsyncSession):
        super().__init__(session, "jumia")

class KongaQueries(BaseQueries):
    def __init__(self, session: AsyncSession):
        super().__init__(session, "konga")

class JijiQueries(BaseQueries):
    def __init__(self, session: AsyncSession):
        super().__init__(session, "jiji")

class WarehouseQueries:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_products(
        self,
        query: Optional[str] = None,
        platform: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        stmt = select(ProductModel)
        count_stmt = select(func.count(ProductModel.id))

        if platform and platform.lower() != "all":
            stmt = stmt.where(ProductModel.platform == platform.lower())
            count_stmt = count_stmt.where(ProductModel.platform == platform.lower())

        if query:
            like_pattern = f"%{query}%"
            stmt = stmt.where(ProductModel.product_name.ilike(like_pattern) | ProductModel.query.ilike(like_pattern))
            count_stmt = count_stmt.where(ProductModel.product_name.ilike(like_pattern) | ProductModel.query.ilike(like_pattern))

        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(ProductModel.scraped_at.desc(), ProductModel.id.desc()).limit(limit).offset(offset)
        res = await self.session.execute(stmt)
        products = res.scalars().all()

        items = []
        for p in products:
            items.append({
                "id": p.id,
                "platform": p.platform,
                "query": p.query,
                "product_name": p.product_name,
                "category": p.category,
                "price": p.price,
                "currency": p.currency,
                "rating": p.rating,
                "review_count": p.review_count,
                "product_url": p.product_url,
                "image_url": p.image_url,
                "scraped_at": p.scraped_at.isoformat() if p.scraped_at else None,
                "is_available": p.is_available,
            })

        return {"total": total, "items": items}

    async def get_metrics(self) -> Dict[str, Any]:
        total_stmt = select(func.count(ProductModel.id))
        total_res = await self.session.execute(total_stmt)
        total = total_res.scalar() or 0

        # Platform counts
        platform_stmt = select(ProductModel.platform, func.count(ProductModel.id), func.avg(ProductModel.price)).group_by(ProductModel.platform)
        platform_res = await self.session.execute(platform_stmt)
        platforms = {}
        for row in platform_res.all():
            platforms[row[0]] = {
                "count": row[1],
                "avg_price": round(float(row[2] or 0), 2)
            }

        return {
            "total_products": total,
            "platform_breakdown": platforms
        }

    async def clear_all(self) -> int:
        res = await self.session.execute(delete(ProductModel))
        return res.rowcount
