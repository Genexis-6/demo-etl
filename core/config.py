from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Pipeline Concurrency & Throttling
    SEMAPHORE_LIMIT: int = 8
    BATCH_SIZE: int = 10
    BATCH_DELAY: float = 1.2
    MAX_RETRIES: int = 3
    MAX_RETIRES: int = 3  # Compatibility alias
    PAGE_TO_SCRAPE: int = 3

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/etl_warehouse.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
