import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables from .env file
load_dotenv()

# Get the database URL
db_url = os.getenv("Database_URL")

# Connect to Neon DB
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

# Example query
cursor.execute("SELECT * FROM swimmers LIMIT 5;")
print(cursor.fetchone())

conn.commit()
cursor.close()
conn.close()
