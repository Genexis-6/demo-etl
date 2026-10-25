from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String(50), index=True, nullable=False)
    query = Column(String(255), index=True, nullable=False)
    product_name = Column(Text, nullable=False)
    category = Column(String(100), default="general")
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="NGN")
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, nullable=True)
    product_url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    reviews_raw = Column(JSON, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    is_available = Column(Boolean, default=True)

class ProductSchemas(BaseModel):
    model_config = ConfigDict(extra="ignore")

    query: str = ""
    product_name: str
    category: Optional[str] = "general"
    price: float
    currency: Optional[str] = "NGN"
    rating: Optional[float] = None
    review_count: Optional[int] = None
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    reviews_raw: Optional[Any] = None
    sentiment_score: Optional[float] = None
    scraped_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    is_available: Optional[bool] = True
