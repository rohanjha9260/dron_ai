"""
Career Blueprint

Endpoints:
    POST /api/career/recommend  — Get top-K career recommendations via Cosine Similarity
"""

import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import career_service

logger = logging.getLogger(__name__)

career_bp = Blueprint("career", __name__)


@career_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend_career():
    """
    Run Cosine Similarity to match student profile against ideal career vectors.

    Transforms the student's skill vector into the same dimensional space
    as predefined career vectors and returns ranked matches with confidence scores.

    Optional JSON payload:
        {
            "top_k": 5   // Number of top careers to return (default: 5, max: 20)
        }

    Returns:
        200: {
            "prediction_id": int,
            "recommendations": [
                { "career": "Software Engineer", "match_pct": 92.3, "description": "..." },
                { "career": "Data Analyst",      "match_pct": 85.1, "description": "..." },
                ...
            ]
        }
        400: { "error": "Incomplete profile — cannot recommend careers. Missing: skill vector." }
        404: { "error": "Student not found" }
        503: { "error": "Career recommender not available. Please contact an administrator." }
        500: { "error": "Internal server error" }
    """
    # ── Parse JWT identity ─────────────────────────────────────────────────────
    try:
        student_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token identity"}), 422

    # ── Parse optional top_k from request body ─────────────────────────────────
    top_k = 5
    body = request.get_json(silent=True)
    if body is not None and not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    body = body or {}
    if "top_k" in body:
        try:
            top_k = int(body["top_k"])
            if top_k <= 0 or top_k > 20:
                return jsonify({"error": "top_k must be between 1 and 20"}), 400
        except (TypeError, ValueError):
            return jsonify({"error": "top_k must be an integer"}), 400

    # ── Delegate to service layer ──────────────────────────────────────────────
    try:
        result = career_service.recommend_careers(
            student_id=student_id, top_k=top_k
        )

    except ValueError as exc:
        err_msg = str(exc)
        if "Student not found" in err_msg:
            return jsonify({"error": "Student not found"}), 404
        # Incomplete profile — missing skill vector
        return jsonify({"error": err_msg}), 400

    except RuntimeError as exc:
        logger.error(
            "Career recommender unavailable for student %s: %s", student_id, exc
        )
        return jsonify(
            {"error": "Career recommender not available. Please contact an administrator."}
        ), 503

    except Exception:
        logger.exception(
            "Unexpected error during career recommendation for student %s", student_id
        )
        return jsonify({"error": "Internal server error"}), 500

    return jsonify(result), 200
