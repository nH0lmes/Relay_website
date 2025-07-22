from bs4 import BeautifulSoup
import requests
import pandas as pd
import math
from murtys import murty_top_k_assignments,murty_gender_partitioned_top_k
import aiohttp
import asyncio
n=1
def extract_table(table):
            headers = [header.text.strip() for header in table.find_all('th')[:2]]
            df = pd.DataFrame(columns = headers)
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                individual_data = [data.text.strip() for data in cols[:2]]
                df.loc[len(df)]=individual_data
            
            return df
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

def swim_cloud(sc_number):
        event_template  = pd.read_csv("D:/Personal/Real Website V2/Events-template.csv")
        url = f'https://www.swimcloud.com/swimmer/{sc_number}/'
        headers1 = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        page = requests.get(url,headers=headers1)
        soup = BeautifulSoup(page.text,'lxml')
        table = soup.find_all('table')[1]
        name = soup.find('span', {'class' : 'u-mr-'}).text.strip()

        

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
async def ASA_times(asa_number,session,event_template):
        url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
        async with session.get(url) as response:
            page = await response.text()
        soup = BeautifulSoup(page,'lxml')
        
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
async def matrix_input(asa_num,events, session, event_template,course):
        if n == 1:
            name, asa_num, df = await ASA_times(asa_num,session,event_template)
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
async def matrix_creator(gender,pool_length,numbers,strokes,course):
    genders = []
    names= []
    matrix = []
    event_template  = pd.read_csv("Events-template.csv")
    medley = [(pool_length + ' ' + x) for x in strokes]
    async with aiohttp.ClientSession() as session:
        tasks = []
        for number in numbers:
            if gender != "Mixed" and number[1] != gender:
                continue
            tasks.append(matrix_input(number[0], medley, session, event_template,course))
        results = await asyncio.gather(*tasks)
    for (name,row), number in zip(results, [num for num in numbers if gender == "Mixed" or num[1] == gender]):
            names.append((name, number[1]))
            genders.append(number[1])
            matrix.append(row)
    return names,gender,matrix

async def your_function(input_array,course,pool_length,target_gender):
    strokes = ['Butterfly','Backstroke','Breaststroke','Freestyle']
    medley = [(pool_length + ' ' + x) for x in strokes]
    numbers = input_array
    async def not_mixed(gender):
        names,genders,matrix = await matrix_creator(gender,pool_length,numbers,strokes,course)
        converted = [[time_conversion(ti)for ti in row] for row in matrix]
        sorted_array = murty_top_k_assignments(converted, names, strokes,k=5,is_for_mixed=False)
        return sorted_array
    async def mixedRelay(gender):
        names,genders,matrix = await matrix_creator(gender,pool_length,numbers,strokes,course)
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