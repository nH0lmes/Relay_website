import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("Database URL:", DATABASE_URL)
_pool: asyncpg.Pool | None = None  # private variable

async def init_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            ssl="require" if "neon.tech" in DATABASE_URL else None
        )
        print("✅ Database pool created")
    return _pool

async def get_pool() -> asyncpg.Pool:
    """Always return an initialized pool, raise error if not ready."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialized. Did you forget init_pool() in lifespan?")
    return _pool

async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        print("🛑 Database pool closed")
