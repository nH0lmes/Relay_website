from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncpg

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/search")
async def search_swimmers(q: str = Query( ..., min_length=1)):
    conn = await asyncpg.connect(
    database = "relay_website",
    user = "postgres",
    password = "Holmesy0804!",
    host = "localhost",
    port=5432
    )
    rows = await conn.fetch(
        """
        SELECT first_name, last_name, asa_number, club
        FROM swimmers
        WHERE lower(first_name || ' ' || last_name) like lower ($1)
        LIMIT 5
        """,
        f"%{q}%"
    )
    await conn.close()
    return [dict(row) for row in rows]