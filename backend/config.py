from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    github_token: str
    github_repo: str

    notion_token: Optional[str] = None
    notion_database_id: Optional[str] = None

    github_notion_id_field: Optional[str] = "notion_id"
    notion_github_id_field: Optional[str] = "GitHub Issue"

    api_host: str = "0.0.0.0"
    api_port: int = 8000

    cors_origins: str = "http://localhost:3000,https://*.vercel.app"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
