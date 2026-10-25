from pathlib import Path
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_DB_FILE = DATA_DIR / "etl_warehouse.db"

class Settings(BaseSettings):
    # Pipeline Concurrency & Throttling
    SEMAPHORE_LIMIT: int = 8
    BATCH_SIZE: int = 10
    BATCH_DELAY: float = 1.2
    MAX_RETRIES: int = 3
    MAX_RETIRES: int = 3  # Compatibility alias
    PAGE_TO_SCRAPE: int = 3

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DEFAULT_DB_FILE}"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
