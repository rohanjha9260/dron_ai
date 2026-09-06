"""
Metrics Blueprint

Endpoints:
    POST /api/metrics/fetch  — Fetch GitHub + LeetCode data for the student

This endpoint is called synchronously when the student submits their
profile URLs. No background workers — data is fetched during the request.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests

from app.services import metrics_service

metrics_bp = Blueprint("metrics", __name__)


@metrics_bp.route("/fetch", methods=["POST"])
@jwt_required()
def fetch_metrics():
    """
    Fetch public profile data from GitHub and LeetCode.

    The student provides their profile URLs/handles, and the backend
    fetches commit stats, problem-solving data, etc. synchronously.

    Expected JSON payload:
        {
            "github_handle": "string" (optional),
            "leetcode_username": "string" (optional)
        }

    Returns:
        200: {
            "github": { "total_commits": int, "repos": int, "languages": [...] },
            "leetcode": { "problems_solved": int, "easy": int, "medium": int, "hard": int, "rating": float }
        }
        400: { "error": "At least one handle/username is required" }
        502: { "error": "Failed to fetch from external API" }
    """
    student_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    github_handle = data.get("github_handle") or data.get("github_username")
    leetcode_username = data.get("leetcode_username")

    try:
        results = metrics_service.fetch_and_update_metrics(
            student_id=student_id,
            github_handle=github_handle,
            leetcode_username=leetcode_username,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except (requests.RequestException, ConnectionError):
        return jsonify({"error": "Failed to fetch from external API"}), 502
    except Exception as exc:
        return jsonify({"error": f"Internal server error: {str(exc)}"}), 500

    return jsonify(results), 200
