import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv('.env')
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
