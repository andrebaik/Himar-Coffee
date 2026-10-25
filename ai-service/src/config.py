import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "himar_internal_2024_secret_key")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")
