"""
Singleton Model Loader

Loads all ML models into memory exactly once during Flask app startup
(inside create_app()). Models are then held in the application context
for instant access when prediction endpoints are triggered.

This prevents catastrophic latency from loading heavy model files
from disk on every HTTP request.
"""

import os
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)

# Global singleton references and lock
_placement_model = None
_career_recommender = None
_lock = threading.Lock()


def load_models(app=None):
    """
    Load all ML models into memory. Called once during create_app().

    Models are stored in global singletons and accessed via
    get_placement_model() and get_career_recommender().

    Args:
        app: Optional Flask application instance (for config access)
    """
    global _placement_model, _career_recommender

    with _lock:
        if app is not None and hasattr(app, "config"):
            model_dir = app.config.get("ML_MODEL_DIR", "ml_engine/saved_models")
            career_vectors_path = app.config.get("CAREER_VECTORS_PATH", None)
        else:
            try:
                from flask import current_app
                model_dir = current_app.config.get("ML_MODEL_DIR", "ml_engine/saved_models")
                career_vectors_path = current_app.config.get("CAREER_VECTORS_PATH", None)
            except Exception:
                model_dir = "ml_engine/saved_models"
                career_vectors_path = None

        # Load XGBoost placement model
        from ml_engine.xgboost_model import PlacementPredictor

        _placement_model = PlacementPredictor()
        xgb_path = os.path.join(model_dir, "xgboost_placement.pkl")
        if os.path.exists(xgb_path):
            try:
                _placement_model.load(xgb_path)
                logger.info(f"Loaded XGBoost model from: {xgb_path}")
            except Exception as e:
                logger.error(f"Failed to load XGBoost model from {xgb_path}: {e}")
        else:
            logger.warning(
                f"XGBoost model not found at: {xgb_path} — predictions will fail until model is trained"
            )

        # Load Cosine Similarity career recommender
        from ml_engine.cosine_recommender import CareerRecommender

        _career_recommender = CareerRecommender(path=career_vectors_path)
        try:
            _career_recommender.load_career_vectors(career_vectors_path)
            logger.info("Loaded career vectors for Cosine Similarity recommender")
        except Exception as e:
            logger.error(f"Failed to load career vectors: {e}")


def get_placement_model():
    """Get the singleton PlacementPredictor instance, initializing if needed."""
    global _placement_model
    if _placement_model is None:
        load_models()
    return _placement_model


def get_career_recommender():
    """Get the singleton CareerRecommender instance, initializing if needed."""
    global _career_recommender
    if _career_recommender is None:
        load_models()
    return _career_recommender


def reset_models():
    """Reset the singleton model references (primarily for testing)."""
    global _placement_model, _career_recommender
    with _lock:
        _placement_model = None
        _career_recommender = None
