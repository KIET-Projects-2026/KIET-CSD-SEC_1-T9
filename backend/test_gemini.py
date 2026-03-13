import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(".env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def test_model(name):
    try:
        m = genai.GenerativeModel(name)
        r = await m.generate_content_async("hi")
        print(f"{name} success:", r.text.strip())
    except Exception as e:
        print(f"{name} error:", str(e))

async def main():
    await test_model("gemini-1.5-flash")
    await test_model("gemini-2.5-flash")
    await test_model("gemini-1.5-flash-latest")

if __name__ == "__main__":
    asyncio.run(main())
