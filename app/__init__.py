"""
Dron-AI Flask Application Factory

This module implements the Application Factory pattern to avoid circular imports
and support multiple configuration environments (dev/test/prod).

The create_app() function:
1. Instantiates the Flask application
2. Loads environment-specific configuration
3. Initializes extensions (SQLAlchemy, JWT, Rate Limiter)
4. Loads ML models into memory (singleton, loaded once)
5. Registers all API blueprints
"""

from flask import Flask
from flask_cors import CORS

from config import config_by_name
from app.extensions import db, jwt, limiter


def create_app(config_name="development"):
    """
    Factory function that creates and configures the Flask application.

    Args:
        config_name: One of 'development', 'testing', 'production'

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__, static_folder=None)

    # Load configuration
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    CORS(app)

    # Load ML models into memory (singleton pattern)
    with app.app_context():
        from ml_engine.model_loader import load_models
        load_models(app)

    # Register API blueprints
    _register_blueprints(app)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app


def _register_blueprints(app):
    """Register all Flask API blueprints with the application."""
    from app.api.auth import auth_bp
    from app.api.users import users_bp
    from app.api.metrics import metrics_bp
    from app.api.predictions import predictions_bp
    from app.api.career import career_bp
    from app.api.roadmap import roadmap_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    app.register_blueprint(career_bp, url_prefix="/api/career")
    app.register_blueprint(roadmap_bp, url_prefix="/api/roadmap")
