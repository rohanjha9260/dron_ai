"""
Dron-AI Configuration Module

Provides environment-specific configuration classes for the Flask application.
The active configuration is selected via the FLASK_ENV environment variable.
"""

import os
import re
import ipaddress
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

# Regex pattern for a strict hostname (domain labels or localhost)
HOSTNAME_LABEL_REGEX = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$")


def is_valid_literal_origin(origin: str) -> bool:
    """
    Validate that an origin string is a strict literal web origin:
      - Scheme must be lowercase http or https
      - Host must be a valid domain name, localhost, valid IPv4 (0-255 octets),
        or bracketed IPv6 (e.g. [::1])
      - Port (if present) must be in valid integer range [1, 65535]
      - Must be in canonical origin form (scheme://netloc) without trailing slash,
        empty port colon, paths, query strings, fragments, or whitespace
    """
    if not isinstance(origin, str) or not origin:
        return False

    # Disallow regex meta-characters or wildcards
    if any(char in origin for char in ("*", "?", "+", "(", ")", "{", "}", "^", "$", "|")):
        return False

    try:
        parsed = urlparse(origin)
    except Exception:
        return False

    # Must be http or https
    if parsed.scheme not in ("http", "https"):
        return False

    # No paths (browsers never send trailing slashes), query, fragments, or credentials
    if parsed.path or parsed.params or parsed.query or parsed.fragment:
        return False
    if parsed.username or parsed.password:
        return False

    # The raw string must already be in canonical origin form
    if origin != f"{parsed.scheme}://{parsed.netloc}" or parsed.netloc.endswith(":"):
        return False

    # Validate port bounds if port is specified
    try:
        port = parsed.port
        if port is not None and not (1 <= port <= 65535):
            return False
        hostname = parsed.hostname
    except ValueError:
        return False

    if not hostname:
        return False

    # Case 1: IPv6 address (hostname is parsed without brackets by urllib.parse)
    if ":" in hostname:
        try:
            ipaddress.IPv6Address(hostname)
            # Ensure it was bracketed in netloc
            netloc_host = parsed.netloc.split(":")[0] if not parsed.netloc.startswith("[") else parsed.netloc[1:].split("]")[0]
            if not parsed.netloc.startswith(f"[{netloc_host}]"):
                return False
            return True
        except ValueError:
            return False

    # Case 2: IPv4 address
    if re.match(r"^\d{1,3}(?:\.\d{1,3}){3}$", hostname):
        try:
            ipaddress.IPv4Address(hostname)
            return True
        except ValueError:
            return False

    # Case 3: localhost
    if hostname.lower() == "localhost":
        return True

    # Case 4: Standard domain name
    labels = hostname.split(".")
    if len(labels) < 2:
        return False
    # TLD must be alphabetic and at least 2 chars
    if not labels[-1].isalpha() or len(labels[-1]) < 2:
        return False
    for label in labels:
        if not HOSTNAME_LABEL_REGEX.match(label):
            return False

    return True


class BaseConfig:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-fallback-secret-key-dron-ai-32-chars-long")

    # Database (SQLite)
    DEFAULT_DB_PATH = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "app", "instance", "dron_ai.db"
    )
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-fallback-secret-key-dron-ai-32-chars")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))

    # GitHub
    GITHUB_PAT = os.getenv("GITHUB_PAT", "")

    # ML Model Paths
    ML_MODEL_DIR = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "ml_engine", "saved_models"
    )

    # CORS Policy
    CORS_ORIGINS = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()
    ]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]

    # Rate Limiting Storage / Configuration
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_STRATEGY = "fixed-window"
    RATELIMIT_DEFAULT = "60 per minute"


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

    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    # In production, do not default to '*'
    CORS_ORIGINS = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
    ]

    @classmethod
    def validate(cls):
        """Validate production configuration parameters."""
        if not cls.SECRET_KEY or cls.SECRET_KEY.startswith("dev-"):
            raise ValueError("SECRET_KEY must be set to a secure, non-default value in production.")
        if not cls.JWT_SECRET_KEY or cls.JWT_SECRET_KEY.startswith("dev-"):
            raise ValueError("JWT_SECRET_KEY must be set to a secure, non-default value in production.")
        if not cls.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must be set to explicit allowed origins in production (no wildcard).")
        for origin in cls.CORS_ORIGINS:
            if not is_valid_literal_origin(origin):
                raise ValueError(
                    f"Invalid production CORS origin '{origin}'. Origins in production must be explicit literal URLs "
                    f"with valid schemes, hosts, and ports (e.g., https://example.com, https://[::1]:8443) "
                    f"and cannot contain out-of-range addresses/ports, wildcards, or regex patterns."
                )


# Configuration selector
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
