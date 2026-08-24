"""
Metrics Blueprint

Endpoints:
    POST /api/metrics/fetch  — Fetch GitHub + LeetCode data for the student

This endpoint is called synchronously when the student submits their
profile URLs. No background workers — data is fetched during the request.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

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
    # TODO: Implement using metrics_service (calls github_fetcher + leetcode_fetcher)
    student_id = get_jwt_identity()
    return jsonify({"message": "fetch metrics - not yet implemented"}), 501
