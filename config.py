"""
Dron-AI Configuration Module

Provides environment-specific configuration classes for the Flask application.
The active configuration is selected via the FLASK_ENV environment variable.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-fallback-secret-key")

    # Database
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "dron_ai")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-fallback-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))

    # GitHub
    GITHUB_PAT = os.getenv("GITHUB_PAT", "")

    # ML Model Paths
    ML_MODEL_DIR = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "ml_engine", "saved_models"
    )


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""

    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    """Testing environment configuration."""

    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(BaseConfig):
    """Production environment configuration."""

    DEBUG = False
    TESTING = False


# Configuration selector
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
