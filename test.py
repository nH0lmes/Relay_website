from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math
def swim_cloud(sc_number):
        event_template  = pd.read_csv("D:/Personal/Real Website V2/Events-template.csv")
        url = f'https://www.swimcloud.com/swimmer/{sc_number}/'
        headers1 = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        page = requests.get(url, headers=headers1)
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
        print(merged_df)
        return name,sc_number,merged_df
swim_cloud(2361646)