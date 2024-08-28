from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Define the request body model
class InputData(BaseModel):
    array: List[str]
    courseType: str

# Create an endpoint
@app.post("/run-function/")
async def run_function(data: InputData):
    try:
        print("Received data:",data.array)
        result = your_function(data.array,data.courseType)
        return {"result": result}
    except Exception as e:
        print("Error in processing:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

def your_function(input_array,course):

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
        name, asa_num, df = get_times(asa_num)
        if course == 'short':
            row = [df.loc[df['Event'] == i, 'SC Time'].values[0] for i in events]
        else:
            row = [df.loc[df['Event'] == i, 'LC Time'].values[0] for i in events]
             
        return name,row
    
    medley = ['100 Butterfly','100 Backstroke','100 Breaststroke', '100 Freestyle']
    numbers = input_array
    names= []
    matrix = []
    
    for number in numbers:
        name,row = matrix_input(number,medley)
        names.append(name)
        matrix.append(row)    
    
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
    strokes = ['Butterfly','Backstroke','Breastroke','Freestyle']
    m = Munkres()
    indexes = m.compute(converted)
    output_array =  []
    total = 0
    for row, column in indexes:
        value = converted[row][column]
        total += value
        original_value = matrix[row][column]
        row_name = names[row]
        column_name = strokes[column]
        output_array.append( [column_name,row_name,original_value])
    sorted_array = sorted(output_array,key = lambda x:x[0])
    sorted_array.append(["Total Time:",reverse_conversion(total)])

    return(sorted_array)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)