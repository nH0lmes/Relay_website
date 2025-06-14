import psycopg2
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math
import aiohttp
import asyncio
import asyncpg
import time



semaphore = asyncio.Semaphore(25)
async def get_data(asa_number,session):
    async with semaphore:
        url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
        headers = {"User-Agent": "Mozilla/5.0"}
        async with session.get(url,headers=headers) as response:
            page = await response.text()
            if "No information found for this individual." in page:
                return None, None, None, None
            soup = BeautifulSoup(page,'lxml')
            info = soup.find('p', class_ = 'rnk_sj')
            if not info:
                return None, None, None, None
        
            values = info.text.strip().split(" - ")
            name, asa_num, club = (values + [None])[:3]
            name_parts = name.split(" ")
            if len(name_parts) > 1:
                first_name = " ".join(name_parts[:-1])
                last_name = name_parts[-1]
            else:
                first_name = name_parts[0]
                last_name = None
            return first_name,last_name, asa_number,club

async def process_batch(start, end, conn, session):
    print(f"Processing ASA numbers {start} to {end - 1}")
    tasks = [get_data(i, session) for i in range(start, end)]
    results = await asyncio.gather(*tasks)
    valid = [res for res in results if res[0] is not None]
    await conn.executemany("""
        INSERT INTO swimmers (first_name, last_name, asa_number, club)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (asa_number) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            club = EXCLUDED.club;
    """, valid
    )
    


async def main():
    conn = await asyncpg.connect(
    database = "relay_website",
    user = "postgres",
    password = "Holmesy0804!",
    host = "localhost",
    port=5432
    )
    async with aiohttp.ClientSession() as session:
        for batch_start in range(1,10000,1000):
            batch_end = batch_start + 1000
            await process_batch(batch_start,batch_end,conn,session)
    await conn.close()




if __name__ == "__main__":
    start = time.time()
    asyncio.run(main())
    print(f"Completed in {time.time() - start:.2f} seconds")

