import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ai_study_buddy")

try:
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    cursor = conn.cursor()
    
    # Drop the orphaned 'question' column
    sql = "ALTER TABLE chat_sessions DROP COLUMN question"
    print(f"Executing: {sql}")
    cursor.execute(sql)
    
    conn.commit()
    print("Column 'question' dropped successfully from 'chat_sessions'.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
