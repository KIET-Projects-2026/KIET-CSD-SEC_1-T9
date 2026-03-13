import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ai_study_buddy")

def print_table_info(table_name):
    try:
        conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = conn.cursor()
        cursor.execute(f"DESCRIBE {table_name}")
        print(f"\n--- Schema for {table_name} ---")
        columns = cursor.fetchall()
        for col in columns:
            print(f"Column: {col[0]}, Type: {col[1]}, Null: {col[2]}, Key: {col[3]}, Default: {col[4]}, Extra: {col[5]}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error describing {table_name}: {e}")

print_table_info("chat_sessions")
print_table_info("chat_messages")
print_table_info("users")
