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

from flask import Flask, jsonify
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

    # Register system health and ML status endpoint
    _register_health_endpoint(app)

    # Create database tables
    # Models MUST be imported before db.create_all() so that SQLAlchemy's metadata
    # registry knows about every table. Without these imports, create_all() is a no-op.
    with app.app_context():
        from app.models import (  # noqa: F401
            User,
            AcademicHistory,
            PlatformLink,
            SkillVector,
            MLPrediction,
        )
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


def _register_health_endpoint(app):
    """Register public system health and ML engine status endpoint."""

    @app.route("/api/health", methods=["GET"])
    @limiter.exempt
    def health_check():
        try:
            from ml_engine.model_loader import (
                get_placement_model,
                get_career_recommender,
            )

            placement_model = get_placement_model()
            career_recommender = get_career_recommender()

            placement_active = bool(
                placement_model is not None
                and getattr(placement_model, "is_trained", False)
                and placement_model.model is not None
            )
            career_active = bool(
                career_recommender is not None
                and bool(getattr(career_recommender, "career_vectors", None))
            )

            all_models_active = placement_active and career_active
            status = "online" if all_models_active else "offline"

            response_data = {
                "status": status,
                "backend": True,
                "models_active": all_models_active,
                "models": {
                    "placement_model": placement_active,
                    "career_recommender": career_active,
                },
            }
            status_code = 200 if all_models_active else 503
            return jsonify(response_data), status_code
        except Exception as e:
            app.logger.error("Health check failed: %s", e, exc_info=True)
            return jsonify({
                "status": "offline",
                "backend": True,
                "models_active": False,
                "error": "Internal health check error",
            }), 500

