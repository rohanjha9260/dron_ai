"""
Dron-AI Flask Extensions

Centralized initialization of Flask extensions to avoid circular imports.
Extensions are instantiated here without an app instance, then initialized
with the app inside the create_app() factory function.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Database ORM
db = SQLAlchemy()

# JWT Authentication
jwt = JWTManager()

# Rate Limiting (per IP address)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour", "50 per minute"],
)
