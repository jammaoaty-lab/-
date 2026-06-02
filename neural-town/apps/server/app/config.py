"""
Neural Town 配置管理 - 从环境变量加载配置
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # 数据库
    database_url: str = "postgresql+asyncpg://neural_town:neural_town_password@localhost:5432/neural_town"
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    # JWT
    jwt_secret_key: str = "change-this-to-a-secure-random-string-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    # CORS
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # AI
    openai_api_key: str = ""
    # 环境
    environment: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()