"""
Roadmap Blueprint

Endpoints:
    POST /api/roadmap/generate  — Generate personalized preparation roadmap
"""

import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import roadmap_service

logger = logging.getLogger(__name__)

roadmap_bp = Blueprint("roadmap", __name__)


@roadmap_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_roadmap():
    """
    Generate a personalized, sequenced preparation roadmap.

    Takes the student's selected target career, performs vector subtraction
    (Ideal Career Vector − Student Vector) to identify skill gaps, then
    generates a phased action plan.

    Expected JSON payload:
        {
            "target_career": "Software Engineer"
        }

    Returns:
        200: {
            "prediction_id":  int,
            "target_career":  "Software Engineer",
            "skill_gaps": [
                { "skill": "dsa_score", "current": 40.0, "required": 90.0,
                  "gap": 50.0, "gap_pct": 55.6 },
                ...
            ],
            "roadmap": [
                { "phase": 1, "title": "Master Data Structures & Algorithms",
                  "skill": "dsa_score", "duration": "6 weeks",
                  "tasks": [...], "priority": "high",
                  "milestone": "Achieve target dsa score of 90.0 (current: 40.0, gap: 50.0)",
                  "current": 40.0, "required": 90.0, "gap": 50.0, "gap_pct": 55.6 },
                ...
            ]
        }
        400: { "error": "target_career is required" }
        400: { "error": "Incomplete profile — cannot generate roadmap. Missing: skill vector." }
        404: { "error": "Student not found" }
        422: { "error": "target_career must be a non-empty string" }
        503: { "error": "Career recommender not available. Please contact an administrator." }
        500: { "error": "Internal server error" }
    """
    # ── Parse JWT identity ─────────────────────────────────────────────────────
    try:
        student_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token identity"}), 422

    # ── Parse and validate request payload ────────────────────────────────────
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "JSON payload required with 'target_career' field"}), 400

    target_career = body.get("target_career", "")
    if not target_career or not isinstance(target_career, str):
        return jsonify({"error": "target_career must be a non-empty string"}), 422

    target_career = target_career.strip()
    if not target_career:
        return jsonify({"error": "target_career is required"}), 400

    # ── Delegate to service layer ──────────────────────────────────────────────
    try:
        result = roadmap_service.generate_roadmap(
            student_id=student_id,
            target_career=target_career,
        )

    except ValueError as exc:
        err_msg = str(exc)
        if "Student not found" in err_msg:
            return jsonify({"error": "Student not found"}), 404
        # target_career not found in career vectors or incomplete profile
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
            "Unexpected error during roadmap generation for student %s → '%s'",
            student_id,
            target_career,
        )
        return jsonify({"error": "Internal server error"}), 500

    return jsonify(result), 200
