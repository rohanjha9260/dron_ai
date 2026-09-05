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


def _get_config_paths(app=None):
    """Extract model directory and career vectors path from Flask app config or defaults."""
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
    return model_dir, career_vectors_path


def _load_placement_model_locked(model_dir: Optional[str] = None):
    """Load placement model while holding _lock without replacing if already live."""
    global _placement_model
    if _placement_model is not None:
        return

    if model_dir is None:
        model_dir, _ = _get_config_paths()

    xgb_path = os.path.join(model_dir, "xgboost_placement.pkl")
    if not os.path.exists(xgb_path):
        _placement_model = None
        logger.warning(
            f"XGBoost model not found at: {xgb_path} -- predictions will fail until model is trained"
        )
        return

    from ml_engine.xgboost_model import PlacementPredictor

    predictor = PlacementPredictor()
    try:
        predictor.load(xgb_path)
        _placement_model = predictor
        logger.info(f"Loaded XGBoost model from: {xgb_path}")
    except FileNotFoundError as e:
        _placement_model = None
        # If missing sidecar was raised as ChecksumNotFoundError (inheriting from ValueError), re-raise
        if isinstance(e, ValueError):
            raise
        logger.warning(f"XGBoost model file not found at: {xgb_path}")
    except ValueError:
        _placement_model = None
        raise
    except Exception as e:
        _placement_model = None
        logger.error(f"Failed to load XGBoost model from {xgb_path}: {e}")


def _load_career_recommender_locked(career_vectors_path: Optional[str] = None):
    """Load career recommender while holding _lock without replacing if already live."""
    global _career_recommender
    if _career_recommender is not None:
        return

    if career_vectors_path is None:
        _, career_vectors_path = _get_config_paths()

    from ml_engine.cosine_recommender import CareerRecommender

    recommender = CareerRecommender(path=career_vectors_path)
    try:
        recommender.load_career_vectors(career_vectors_path)
        _career_recommender = recommender
        logger.info("Loaded career vectors for Cosine Similarity recommender")
    except Exception as e:
        _career_recommender = None
        logger.error(f"Failed to load career vectors: {e}")


def load_models(app=None):
    """
    Load all ML models into memory. Called once during create_app().

    Models are stored in global singletons and accessed via
    get_placement_model() and get_career_recommender().

    Args:
        app: Optional Flask application instance (for config access)
    """
    model_dir, career_vectors_path = _get_config_paths(app)

    with _lock:
        if _placement_model is None:
            _load_placement_model_locked(model_dir)
        if _career_recommender is None:
            _load_career_recommender_locked(career_vectors_path)


def get_placement_model():
    """Get the singleton PlacementPredictor instance using double-checked locking."""
    global _placement_model
    if _placement_model is None:
        with _lock:
            if _placement_model is None:
                _load_placement_model_locked()
    return _placement_model


def get_career_recommender():
    """Get the singleton CareerRecommender instance using double-checked locking."""
    global _career_recommender
    if _career_recommender is None:
        with _lock:
            if _career_recommender is None:
                _load_career_recommender_locked()
    return _career_recommender


def reset_models():
    """Reset the singleton model references (primarily for testing)."""
    global _placement_model, _career_recommender
    with _lock:
        _placement_model = None
        _career_recommender = None
