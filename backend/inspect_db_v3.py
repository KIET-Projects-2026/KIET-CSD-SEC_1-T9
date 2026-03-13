import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ai_study_buddy")

def get_table_info(table_name):
    try:
        conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = conn.cursor()
        cursor.execute(f"DESCRIBE {table_name}")
        out = [f"\n--- Schema for {table_name} ---"]
        columns = cursor.fetchall()
        for col in columns:
            out.append(f"Column: {col[0]}, Type: {col[1]}, Null: {col[2]}, Key: {col[3]}, Default: {col[4]}, Extra: {col[5]}")
        cursor.close()
        conn.close()
        return "\n".join(out)
    except Exception as e:
        return f"Error describing {table_name}: {e}"

with open("full_schema.txt", "w", encoding="utf-8") as f:
    f.write(get_table_info("chat_sessions"))
    f.write("\n")
    f.write(get_table_info("chat_messages"))
    f.write("\n")
    f.write(get_table_info("users"))
