"""Configuration settings for the authentication module.

Configuration settings are read in the following order:
1. Environment variables
2. .env file
3. /run/secrets directory
4. Hardcoded defaults (this file)
"""

import os

from dotenv import find_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = find_dotenv()
settings = {
    "case_sensitive": False,
    "env_file_encoding": "utf-8",
}
if env_path:
    settings["env_file"] = env_path
if os.path.exists("/run/secrets"):
    settings["secrets_dir"] = "/run/secrets"


class Config(BaseSettings):
    """Application configuration settings."""

    jwt_issuer: str = Field(default="dt-demo")
    jwt_expiration_delta: int = Field(default=86400)  # 1 day
    jwt_secret: bytes = Field(default=b"secret-for-signing-jwt-tokens")
    admin_password: bytes = Field(default=b"super-secret-password")
    db_url: str = Field(default="sqlite+aiosqlite:///./auth.db")

    model_config = SettingsConfigDict(**settings)


config = Config()
