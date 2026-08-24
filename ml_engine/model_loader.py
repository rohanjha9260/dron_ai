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

logger = logging.getLogger(__name__)

# Global singleton references
_placement_model = None
_career_recommender = None


def load_models(app):
    """
    Load all ML models into memory. Called once during create_app().

    Models are stored in global singletons and accessed via
    get_placement_model() and get_career_recommender().

    Args:
        app: Flask application instance (for config access)
    """
    global _placement_model, _career_recommender

    model_dir = app.config.get("ML_MODEL_DIR", "ml_engine/saved_models")

    # Load XGBoost placement model
    from ml_engine.xgboost_model import PlacementPredictor

    _placement_model = PlacementPredictor()
    xgb_path = os.path.join(model_dir, "xgboost_placement.pkl")
    if os.path.exists(xgb_path):
        _placement_model.load(xgb_path)
        logger.info(f"Loaded XGBoost model from: {xgb_path}")
    else:
        logger.warning(f"XGBoost model not found at: {xgb_path} — predictions will fail until model is trained")

    # Load Cosine Similarity career recommender
    from ml_engine.cosine_recommender import CareerRecommender

    _career_recommender = CareerRecommender()
    _career_recommender.load_career_vectors()
    logger.info("Loaded career vectors for Cosine Similarity recommender")


def get_placement_model():
    """Get the singleton PlacementPredictor instance."""
    return _placement_model


def get_career_recommender():
    """Get the singleton CareerRecommender instance."""
    return _career_recommender
