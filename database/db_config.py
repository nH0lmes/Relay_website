import asyncpg
from bs4 import BeautifulSoup
import aiohttp
import asyncio
import time
import os
from dotenv import load_dotenv


def get_cell_by_label(table, label):
    for row in table.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) >= 2 and cells[0].text.strip() == label:
            return cells[1].text.strip()
    return None
semaphore = asyncio.Semaphore(25)

async def get_data(asa_number, session):
    async with semaphore:
        url = f'https://www.swimmingresults.org/biogs/biogs_details.php?tiref={asa_number}'
        backup_url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
        headers = {"User-Agent": "Mozilla/5.0"}

        async with session.get(url, headers=headers) as response:
            page = await response.text()
            if ("We do not recognise this membership number" in page) or ("This members data has not been released for viewing" in page):
                async with session.get(backup_url, headers=headers) as backup_response:
                    page = await backup_response.text()
                    if "No competitive member matching the provided British Swimming Membership Number." in page:
                        return None, None, None, None, None, None
                    else:
                        soup = BeautifulSoup(page, 'lxml')
                        info = soup.find("p", class_="rnk_sj")
                        full_text = info.text.strip()  
                        name_part,junk, club = full_text.split(" - ", 2)
                        # junk, club = club_part.split()
                        first_name, last_name = name_part.split(" ", 1)
                        final_url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={last_name}'
                        async with session.get(final_url, headers=headers) as final_response:
                            page2 = await final_response.text()
                            soup2 = BeautifulSoup(page2, 'lxml')
                            for row in soup2.find_all("tr")[1:]:
                                cells = row.find_all("td")
                                if cells[0].text.strip() == str(asa_number):
                                    try:
                                        yob = int(cells[4].text.strip())
                                    except ValueError:
                                        yob = None
                                    try:
                                        gender = cells[5].text.strip()
                                    except ValueError:
                                        gender = None
                                    return first_name, last_name, asa_number, club, yob, gender
            else:
                soup = BeautifulSoup(page, 'lxml')
                tables = soup.select("table")[:2]
                
                if len(tables) < 2:
                    return None, None, None, None, None,None

                table1, table2 = tables
                club = get_cell_by_label(table2, "Ranked Club")
                yob = get_cell_by_label(table1, "Year of Birth")
                if yob is not None:
                    yob = int(yob)
                gender = get_cell_by_label(table1, "Eligibility Category")
                name = get_cell_by_label(table1, "Name") 
                name_parts = name.split(" ")
                if len(name_parts) > 1:
                    first_name = " ".join(name_parts[:-1])
                    last_name = name_parts[-1]
                else:
                    first_name = name_parts[0]
                    last_name = None
                return first_name,last_name, asa_number,club,yob,gender
        

async def process_batch(start, end, conn, session):
    print(f"Processing ASA numbers {start} to {end - 1}")
    tasks = [get_data(i, session) for i in range(start, end)]
    results = await asyncio.gather(*tasks)
    valid = [res for res in results if res and all(res)]
    await conn.executemany("""
        INSERT INTO swimmers (first_name, last_name, asa_number, club, yob, gender)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (asa_number) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            club = EXCLUDED.club,
            yob = EXCLUDED.yob,
            gender = EXCLUDED.gender;            
    """, valid
    )
    
async def main():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    async with aiohttp.ClientSession() as session:
        for batch_start in range(1155000,2000000,1000):
            batch_end = batch_start + 1000
            await process_batch(batch_start,batch_end,conn,session)
    await conn.close()




if __name__ == "__main__":
    start = time.time()
    asyncio.run(main())
    print(f"Completed in {time.time() - start:.2f} seconds")

