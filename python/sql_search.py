import asyncpg
from typing import Optional
import datetime

async def fetch_swimmers(q: str,club: str)-> list[dict]:
    conn = await asyncpg.connect(
    database = "relay_website",
    user = "postgres",
    password = "Holmesy0804!",
    host = "localhost",
    port=5432
    )
    print(q)
    print(club)
    query_prefix = f"{q.lower()}%"
    query_loose = f"%{q.lower()}%"
    # Tier 1: Prefix match
    rows = await conn.fetch(
        """
        SELECT first_name, last_name, asa_number, club, gender
        FROM swimmers
        WHERE (lower(first_name) LIKE $1
           OR lower(first_name || ' ' || last_name) LIKE $1)
           AND ($2::text IS NULL OR lower(club) LIKE lower($2))
        LIMIT 5
        """,
        query_prefix,club if club else None
    )

    #Tier 2: Partial match
    if not rows:
        rows = await conn.fetch(
            """
            SELECT first_name, last_name, asa_number, club, gender
            FROM swimmers
            WHERE lower(first_name || ' ' || last_name) LIKE $1
            LIMIT 5
            """,
            query_loose
        )

    # Tier 3: Fuzzy match
    if not rows:
        await conn.execute("SET pg_trgm.similarity_threshold = 0.3;")  # Tweak as needed
        rows = await conn.fetch(
            """
            SELECT first_name, last_name, asa_number, club, gender
            FROM swimmers
            WHERE similarity(lower(first_name || ' ' || last_name), $1) > 0.3
            ORDER BY similarity(lower(first_name || ' ' || last_name), $1) DESC
            LIMIT 5
            """,
            q.lower()
        )

    await conn.close()
    return [dict(row) for row in rows]


async def fetch_clubs(q: str)-> list[dict]:
    conn = await asyncpg.connect(
        database="relay_website",
        user="postgres",
        password="Holmesy0804!",
        host="localhost",
        port=5432
    )

    query_prefix = f"{q.lower()}%"
    query_loose = f"%{q.lower()}%"

    seen = set()
    final_results = []

    # Tier 1: Prefix match
    tier1 = await conn.fetch(
        """
        SELECT DISTINCT club
        FROM swimmers
        WHERE lower(club) LIKE $1
        LIMIT 5
        """,
        query_prefix
    )
    for row in tier1:
        club = row["club"]
        if club not in seen:
            seen.add(club)
            final_results.append(row)

    # Tier 2: Loose/Partial match
    if len(final_results) < 5:
        tier2 = await conn.fetch(
            """
            SELECT DISTINCT club
            FROM swimmers
            WHERE lower(club) LIKE $1
            LIMIT 5
            """,
            query_loose
        )
        for row in tier2:
            club = row["club"]
            if club not in seen:
                seen.add(club)
                final_results.append(row)
            if len(final_results) >= 5:
                break

    # Tier 3: Fuzzy match using pg_trgm
    if len(final_results) < 5:
        await conn.execute("SET pg_trgm.similarity_threshold = 0.3;")  # adjust as needed
        tier3 = await conn.fetch(
            """
            SELECT DISTINCT club, similarity(lower(club), $1) AS sim
            FROM swimmers
            WHERE similarity(lower(club), $1) > 0.5
            ORDER BY sim DESC
            LIMIT 10
            """,
            q.lower()
        )
        for row in tier3:
            club = row["club"]
            if club not in seen:
                seen.add(club)
                final_results.append(row)
            if len(final_results) >= 5:
                break

    await conn.close()
    return [dict(row) for row in final_results]

async def fetch_filtered_swimmers(
    club: Optional[str] = None,
    gender: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None

):
    current_year = datetime.datetime.now().year
    
    min_year = current_year - max_age
    max_year = current_year - min_age
    query = """
        SELECT first_name,last_name,asa_number,club, gender
        FROM swimmers
        WHERE ($1::text IS NULL OR LOWER(club) LIKE LOWER($1))
          AND ($2::text = '' OR gender = $2)
          AND ($3::int IS NULL OR yob >= $3)
          AND ($4::int IS NULL OR yob <= $4)
        LIMIT 100
    """
    conn = await asyncpg.connect(
    database = "relay_website",
    user = "postgres",
    password = "Holmesy0804!",
    host = "localhost",
    port=5432
    )
    rows = await conn.fetch(query, f"%{club}%", gender, min_year, max_year)
    await conn.close()
    swimmers = [dict(row) for row in rows]
    sorted_swimmers = sorted(swimmers, key=lambda x: x['first_name'])
    print(rows)
    return sorted_swimmers
