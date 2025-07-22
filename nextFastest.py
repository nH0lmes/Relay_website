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
from itertools import combinations, permutations
import copy
import heapq

input_array = [['1117232', 'Open/Male'], ['1110066', 'Female'], ['1176991', 'Female'], ['883467', 'Female'], ['928301', 'Open/Male'], ['1235650', 'Open/Male'], ['1265722', 'Open/Male'], ['1117053', 'Open/Male'], ['1167903', 'Open/Male'], ['1160296', 'Open/Male'], ['930673', 'Open/Male'], ['1165975', 'Open/Male'], ['810206', 'Female'], ['1338910', 'Open/Male']]

def your_function(input_array,course,pool_length):
    n=1
    gender = "Mixed"
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
    def get_times(asa_number):
        event_template  = pd.read_csv("Events-template.csv")
        url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
        page = requests.get(url)
        soup = BeautifulSoup(page.text,'lxml')
        
        
        def extract_table(table):
            headers = [header.text.strip() for header in table.find_all('th')[:2]]
            df = pd.DataFrame(columns = headers)
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                individual_data = [data.text.strip() for data in cols[:2]]
                df.loc[len(df)]=individual_data
            
            return df
        
        lc_table = soup.find_all('table')[0]
        sc_table = soup.find_all('table')[1]
        
        lc_df = extract_table(lc_table)
        sc_df = extract_table(sc_table)
        
        lc_df.columns = ['Event', 'LC Time']
        sc_df.columns = ['Event', 'SC Time']
        
        merged_df = pd.merge(event_template,sc_df, on='Event',how = 'outer')
        merged_df = pd.merge(merged_df,lc_df, on='Event',how = 'outer')
        
        name = soup.find('p',class_ = 'rnk_sj').text.strip().split(' - ')[0]
        return name,asa_number,merged_df
    
    def matrix_input(asa_num,events):
        if n == 1:
            name, asa_num, df = get_times(asa_num)
            print(name)
            print(asa_num)
            print(df)
            print(".................")
        elif n == 2:
            name, asa_num, df = swim_cloud(asa_num)
            print(name)
            print(asa_num)
            print(df)
            print("...............")
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
    
    for number in numbers:
        num = number[0]
        name,row = matrix_input(num,medley)
        names.append((name,number[1]))
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
    
    def murty_top_k_assignments(matrix, names, strokes, k=5):
        def compute_assignment(cost_matrix):
            m = Munkres()
            indexes = m.compute(copy.deepcopy(cost_matrix))
            total_cost = sum(cost_matrix[i][j] for i, j in indexes)
            return total_cost, indexes

        def block_assignment(cost_matrix, row, col):
            new_matrix = copy.deepcopy(cost_matrix)
            new_matrix[row][col] = float('inf')
            return new_matrix

        # Convert to cost matrix
        cost_matrix = [[time_conversion(cell) for cell in row] for row in matrix]
        initial_cost, initial_assignment = compute_assignment(cost_matrix)

        # Priority queue: (total_cost, assignment, blocked_set, cost_matrix)
        heap = [(initial_cost, initial_assignment, set(), cost_matrix)]
        seen = set()
        results = []

        while heap and len(results) < k:
            total_cost, assignment, blocked, current_matrix = heapq.heappop(heap)
            key = tuple(sorted(assignment))
            if key in seen:
                continue
            seen.add(key)
            results.append((total_cost, assignment))

            # Generate new subproblems by blocking one assignment
            for i, (row, col) in enumerate(assignment):
                if (row, col) in blocked:
                    continue
                new_blocked = blocked | {(row, col)}
                new_matrix = block_assignment(current_matrix, row, col)
                try:
                    new_cost, new_assignment = compute_assignment(new_matrix)
                    heapq.heappush(heap, (new_cost, new_assignment, new_blocked, new_matrix))
                except:
                    continue  # infeasible assignment

        # Format results
        formatted = []
        for total_cost, assignment in results:
            relay = []
            for row, col in assignment:
                swimmer = names[row][0]
                stroke = strokes[col]
                original_time = matrix[row][col]
                relay.append((stroke, swimmer, original_time))
            relay = sorted(relay, key=lambda x: x[0])
            relay.append(["Total Time:", reverse_conversion(total_cost)])
            formatted.append(relay)

        return formatted

    top_assignments = murty_top_k_assignments(matrix, names, strokes, k=5)
    print("Top Assignments:", top_assignments)

your_function(input_array, course='long', pool_length='50')
 