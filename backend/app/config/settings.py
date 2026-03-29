"""
config/settings.py
Centralised environment config using Pydantic Settings (syllabus: Modules & Packages, OOPs)
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "hotel_booking"
    JWT_SECRET: str = "change_me_to_something_long_and_secret_32chars"
    JWT_EXPIRE_MINUTES: int = 10080          # 7 days
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
