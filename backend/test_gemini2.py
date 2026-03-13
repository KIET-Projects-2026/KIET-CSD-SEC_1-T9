import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(".env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def test_model(name, f):
    try:
        m = genai.GenerativeModel(name)
        r = await m.generate_content_async("hi")
        f.write(f"{name} success: {r.text.strip()}\n")
    except Exception as e:
        f.write(f"{name} error: {str(e)}\n")

async def main():
    with open("gemini_test_out.txt", "w", encoding="utf-8") as f:
        await test_model("gemini-1.5-flash", f)
        await test_model("gemini-2.5-flash", f)
        await test_model("gemini-1.5-pro", f)

if __name__ == "__main__":
    asyncio.run(main())
