from fastapi import FastAPI, HTTPException,Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import traceback
from contextlib import asynccontextmanager
import asyncpg
import os
from python.relay import your_function
from python.sql_search import fetch_clubs, fetch_swimmers, fetch_filtered_swimmers
from dotenv import load_dotenv
from python.db import init_pool, close_pool

async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  
    allow_credentials=True,
    allow_methods=['*'], 
    allow_headers=['*'], 
)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse("index.html")
@app.get("/health")
async def health_check():
    return {"status": "ok"}
class InputData(BaseModel):
    array: list[list[str]]
    courseType: str
    pool_length: str
    target_gender: str
@app.get("/test")
async def test_file():
    return FileResponse("static/js/config.js")

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



@app.get("/search")
async def search_swimmers(q: str = Query( ..., min_length=1),club: str = Query(None)):
    return await fetch_swimmers(q, club)

@app.get("/search-clubs")
async def search_clubs(q: str = Query(..., min_length=1)):
    return await fetch_clubs(q)

@app.get("/filter-swimmers")
async def filter_swimmers(
    club: Optional[str] = None,
    gender: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None
):
   return await fetch_filtered_swimmers(club,gender,min_age,max_age)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000,log_level="info")