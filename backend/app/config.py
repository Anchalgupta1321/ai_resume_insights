import os
from typing import List
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "AI Resume Insights & Analyzer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    @property
    def GROQ_API_KEY(self) -> str:
        return os.getenv("GROQ_API_KEY", "")

    @property
    def GEMINI_API_KEY(self) -> str:
        return os.getenv("GEMINI_API_KEY", "")

    @property
    def DEFAULT_AI_PROVIDER(self) -> str:
        return os.getenv("DEFAULT_AI_PROVIDER", "groq")

    DEFAULT_GROQ_MODEL: str = os.getenv("DEFAULT_GROQ_MODEL", "llama-3.3-70b-versatile")
    DEFAULT_GEMINI_MODEL: str = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-1.5-flash")
    
    # Uploads & temporary file storage
    TEMP_UPLOAD_DIR: str = os.getenv("TEMP_UPLOAD_DIR", "temp_uploads")
    TEMP_EXPORT_DIR: str = os.getenv("TEMP_EXPORT_DIR", "temp_exports")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()

os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEMP_EXPORT_DIR, exist_ok=True)
