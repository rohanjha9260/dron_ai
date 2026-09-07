"""
Predictions Blueprint

Endpoints:
    POST /api/predictions/placement  — Calculate placement probability & readiness tier
"""

import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import prediction_service

logger = logging.getLogger(__name__)

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/placement", methods=["POST"])
@jwt_required()
def predict_placement():
    """
    Run XGBoost inference to predict placement readiness.

    Uses the student's latest academic record and skill vector to generate
    a placement probability score (0.0–1.0) and a human-readable readiness
    tier. The result is also persisted to the ml_predictions audit table.

    No request body is required — all data is fetched from the student's
    existing profile using the JWT identity.

    Returns:
        200: {
            "prediction_id":         int,
            "placement_probability": float,   // 0.0 – 1.0
            "readiness_tier":        str,     // "Highly Prepared" | "Prepared" |
                                              // "Needs Improvement" |
                                              // "High Risk / Action Required"
            "feature_importance":    dict,    // feature name → relative weight
            "top_factors":           list     // top 3 contributing feature names
        }
        400: { "error": "Incomplete profile — cannot predict. Missing: ..." }
        503: { "error": "ML model not available. Please contact an administrator." }
        500: { "error": "Internal server error" }
    """
    try:
        student_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token identity"}), 422

    try:
        result = prediction_service.predict_placement(student_id=student_id)

    except ValueError as exc:
        err_msg = str(exc)
        if "Student not found" in err_msg:
            return jsonify({"error": "Student not found"}), 404
        # Incomplete profile — missing academic records or skill vector
        return jsonify({"error": err_msg}), 400

    except RuntimeError as exc:
        # XGBoost singleton not loaded (model file missing / not trained yet)
        logger.error("ML model unavailable for student %s: %s", student_id, exc)
        return jsonify(
            {"error": "ML model not available. Please contact an administrator."}
        ), 503

    except Exception:
        logger.exception(
            "Unexpected error during placement prediction for student %s", student_id
        )
        return jsonify({"error": "Internal server error"}), 500

    return jsonify(result), 200
