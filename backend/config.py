import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_if_missing")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
FILE_UPLOAD_PATH = os.getenv("FILE_UPLOAD_PATH", "./uploads")

if not os.path.exists(FILE_UPLOAD_PATH):
    os.makedirs(FILE_UPLOAD_PATH, exist_ok=True)
