from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from munkres import Munkres, print_matrix
from bs4 import BeautifulSoup
import requests
import pandas as pd
import math
event_template  = pd.read_csv("D:/Personal/Real Website V2/Events-template.csv")
url = f'https://www.swimcloud.com/swimmer/2361646/'
headers1 = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
page = requests.get(url, headers=headers1)
x = page.text
print(x)
soup = BeautifulSoup(page.text,'html.parser')
print(soup.find_all('table'))