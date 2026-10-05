"""
Dron-AI Flask Extensions

Centralized initialization of Flask extensions to avoid circular imports.
Extensions are instantiated here without an app instance, then initialized
with the app inside the create_app() factory function.
"""

from datetime import datetime, timezone
from sqlalchemy import types
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Database ORM
db = SQLAlchemy()


class UTCDateTime(types.TypeDecorator):
    """
    Custom SQLAlchemy DateTime type that ensures all datetimes are stored
    normalized to UTC and restored with UTC timezone awareness upon retrieval.
    """
    impl = types.DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if isinstance(value, str):
                return value
            if isinstance(value, datetime):
                if value.tzinfo is not None:
                    return value.astimezone(timezone.utc).replace(tzinfo=None)
                return value
        return value

    def process_result_value(self, value, dialect):
        if value is not None and isinstance(value, datetime):
            if value.tzinfo is None:
                return value.replace(tzinfo=timezone.utc)
        return value


# JWT Authentication
jwt = JWTManager()

# Rate Limiting (per IP address)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour", "50 per minute"],
)
