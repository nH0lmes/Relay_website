import psycopg2
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math

conn = psycopg2.connect(
    dbname = "relay_website",
    user = "postgres",
    password = "Holmesy0804!",
    host = "localhost",
    port=5432
)
db = []
cursor = conn.cursor()
def get_data(asa_number):
    url = f'https://www.swimmingresults.org/individualbest/personal_best.php?mode=A&tiref={asa_number}'
    headers1 = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    page = requests.get(url)
    soup = BeautifulSoup(page.text,'lxml')
    info = soup.find('p', {'class' : 'rnk_sj'})
    if info is None:
        return None,None,None,None
    info = info.text.strip()
    values = info.split(" - ")
    if len(values) ==3:
        name, asa_num, club = values
    elif len(values) == 2:
        name,asa_num = values
        club = None
    name_parts = name.split(" ")
    if len(name_parts) > 1:
        first_name = " ".join(name_parts[:-1])
        last_name = name_parts[-1]
    else:
        first_name = name_parts[0]
        last_name = None
    return first_name,last_name, asa_number,club

# first_name,last_name, asa_number,club = get_data(1772352)
# print(first_name)
# print(last_name)
# print(club)
# print(asa_number)

skipped = 0
for i in range(1,1000):
    first_name, last_name,asa_num,club= get_data(i)
    if i%100 ==0:
        print (i)
    if first_name == None:
        skipped+=1
        continue
    else:
        db.append((first_name,last_name,asa_num))
        
# cursor.execute("""
        #             INSERT INTO swimmers (first_name,last_name, ASA_number,club)
        #             VALUES(%s, %s, %s, %s);
        # """, (first_name,last_name,asa_num,club))
print(skipped)
conn.commit()
cursor.close()
conn.close()