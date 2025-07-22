from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math
from fastapi import FastAPI, Query
#from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from typing import Optional
import datetime
from itertools import combinations
from murtys import murty_top_k_assignments,murty_gender_partitioned_top_k
import traceback
import aiohttp
import asyncio

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  
    allow_credentials=True,
    allow_methods=['*'], 
    allow_headers=['*'], 
)

# Define the request body model
class InputData(BaseModel):
    array: list[list[str]]
    courseType: str
    pool_length: str
    target_gender: str

# Create an endpoint
@app.post("/run-function/")
async def run_function(data: InputData):
    try:
        print("Received data:",data.array)
        print("Gender:",data.target_gender)
        result = await your_function(data.array,data.courseType,data.pool_length,data.target_gender)
        return {"result": result}
    except Exception as e:
        print("Error in processing:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

async def your_function(input_array,course,pool_length,target_gender):
    n=1
    def swim_cloud(sc_number):
        event_template  = pd.read_csv("D:/Personal/Real Website V2/Events-template.csv")
        url = f'https://www.swimcloud.com/swimmer/{sc_number}/'
        headers1 = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        page = requests.get(url,headers=headers1)
        soup = BeautifulSoup(page.text,'lxml')
        table = soup.find_all('table')[1]
        name = soup.find('span', {'class' : 'u-mr-'}).text.strip()

        def extract_table(table):
            headers = [header.text.strip() for header in table.find_all('th')[:2]]
            df = pd.DataFrame(columns = headers)
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                individual_data = [data.text.strip() for data in cols[:2]]
                df.loc[len(df)]=individual_data
            
            return df

        mixed = extract_table(table)
        event_replacements = {
            ' Free': ' Freestyle',
            ' Breast': ' Breaststroke',
            ' Fly': ' Butterfly',
            ' Back': ' Backstroke',
            ' IM': ' Individual Medley'
        }
        for short, full in event_replacements.items():
            mixed['Event'] = mixed['Event'].str.replace(short,full, regex=False)

        lc_df = mixed[mixed['Event'].str.contains(' L')].copy()
        sc_df = mixed[mixed['Event'].str.contains(' S')].copy()

        lc_df['Event'] = lc_df['Event'].str.replace(' L', '', regex=False)
        sc_df['Event'] = sc_df['Event'].str.replace(' S', '', regex=False)

        lc_df.columns = ['Event', 'LC Time']
        sc_df.columns = ['Event', 'SC Time']

        merged_df = pd.merge(event_template,sc_df, on='Event',how = 'outer')
        merged_df = pd.merge(merged_df,lc_df, on='Event',how = 'outer')
        
        return name,sc_number,merged_df
    async def get_times(asa_number,session,event_template):
        url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
        async with session.get(url) as response:
            page = await response.text()
        soup = BeautifulSoup(page,'lxml')
        
        
        def extract_table(table):
            headers = [header.text.strip() for header in table.find_all('th')[:2]]
            if len(headers) < 2:
                return pd.DataFrame()  # Return empty DataFrame if no data
            df = pd.DataFrame(columns = headers)
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 2:
                    continue
                individual_data = [data.text.strip() for data in cols[:2]]
                df.loc[len(df)]=individual_data
            
            return df
        
        tables =  soup.find_all('table')[:-1]
        lc_df = pd.DataFrame(columns = ['Event', 'LC Time'])
        sc_df = pd.DataFrame(columns = ['Event', 'SC Time'])

        if len(tables) >= 1:
            first_table = extract_table(tables[0])
            header = first_table.columns[1]
            if 'LC' in header:
                lc_df = first_table
                lc_df.columns = ['Event', 'LC Time']
            elif 'SC' in header:
                sc_df = first_table
                sc_df.columns = ['Event', 'SC Time']
        if len(tables) >= 2:
            second_table = extract_table(tables[1])
            header = second_table.columns[1]
            if 'LC' in header:
                lc_df = second_table
                lc_df.columns = ['Event', 'LC Time']
            elif 'SC' in header:
                sc_df = second_table
                sc_df.columns = ['Event', 'SC Time']
        
        merged_df = pd.merge(event_template,sc_df, on='Event',how = 'outer')
        merged_df = pd.merge(merged_df,lc_df, on='Event',how = 'outer')
        #for col in ['SC Time', 'LC Time']:
            #merged_df[col] = merged_df[col].fillna(math.inf)
        name = soup.find('p',class_ = 'rnk_sj').text.strip().split(' - ')[0]
        return name,asa_number,merged_df
    
    async def matrix_input(asa_num,events, session, event_template):
        if n == 1:
            name, asa_num, df = await get_times(asa_num,session,event_template)
            print(name)
            # print(asa_num)
            print(df)
            # print(".................")
        elif n == 2:
            name, asa_num, df = swim_cloud(asa_num,session)
            # print(name)
            # print(asa_num)
            # print(df)
            # print("...............")
        else:
            print("Error in choosing website")

        if course == 'short':
            row = [df.loc[df['Event'] == i, 'SC Time'].values[0] for i in events]
        else:
            row = [df.loc[df['Event'] == i, 'LC Time'].values[0] for i in events]
             
        return name,row
    strokes = ['Butterfly','Backstroke','Breaststroke','Freestyle']
    medley = [(pool_length + ' ' + x) for x in strokes]
    numbers = input_array
    genders = []
    names= []
    matrix = []
    async def matrix_creator(gender):
        event_template  = pd.read_csv("Events-template.csv")
        medley = [(pool_length + ' ' + x) for x in strokes]
        async with aiohttp.ClientSession() as session:
            tasks = []
            for number in numbers:
                if gender != "Mixed" and number[1] != gender:
                    continue
                tasks.append(matrix_input(number[0], medley, session, event_template))
            results = await asyncio.gather(*tasks)
        for (name,row), number in zip(results, [num for num in numbers if gender == "Mixed" or num[1] == gender]):
                names.append((name, number[1]))
                genders.append(number[1])
                matrix.append(row)
    
    print(names)
    print(genders)
    def time_conversion(t):
        if isinstance(t, str):
            if ':' in t:
                minutes,rest = t.split(':')
                seconds, milliseconds = rest.split('.')
                return int(minutes) * 60000 + int(seconds) * 1000 + int(milliseconds) * 10
            else:
                seconds, milliseconds = t.split('.')
                return int(seconds) * 1000 + int(milliseconds) * 10
        elif math.isnan(t):
            return float('inf')
        else:
            raise ValueError(f"Unexpected value type: {t}")
    
    def reverse_conversion(ms):
        if ms == float('inf'):
            return 'N/A'
        minutes, ms = divmod(ms,60000)
        seconds,ms = divmod(ms,1000)
        return f'{minutes}:{seconds:02}.{ms // 10:02}' if minutes > 0 else f'{seconds}.{ms // 10:02}'

    converted = [[time_conversion(ti)for ti in row] for row in matrix]
    print(converted)
    print(names)
    async def not_mixed(gender):
        await matrix_creator(gender)
        converted = [[time_conversion(ti)for ti in row] for row in matrix]
        sorted_array = murty_top_k_assignments(converted, names, strokes,k=5,is_for_mixed=False)
        return sorted_array
    async def mixedRelay(gender):
        await matrix_creator(gender)
        converted = [[time_conversion(ti)for ti in row] for row in matrix]
        sorted_array = murty_gender_partitioned_top_k(converted, names, strokes, k=5)
        return sorted_array
    if target_gender == "Mixed":
        sorted_array = await mixedRelay("Mixed")
    elif target_gender == "Open/Male":
        sorted_array = await not_mixed("Open/Male")
    elif target_gender == "Female":
        sorted_array = await not_mixed("Female")
    return(sorted_array)

@app.get("/search")
async def search_swimmers(q: str = Query( ..., min_length=1),club: str = Query(None)):
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

@app.get("/search-clubs")
async def search_clubs(q: str = Query(..., min_length=1)):
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


@app.get("/filter-swimmers")
async def filter_swimmers(
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000,log_level="info")