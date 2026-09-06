"""
Users Blueprint

Endpoints:
    GET  /api/users/profile  — Get full student profile (profile + academics + skills)
    PUT  /api/users/profile  — Update student profile information
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import profile_service

users_bp = Blueprint("users", __name__)


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get the complete profile of the authenticated student.

    Aggregates data from Users_Master, Academic_History,
    Platform_Links, and Skill_Vectors tables.

    Returns:
        200: { "user": {...}, "academics": [...], "links": {...}, "skills": {...} }
        404: { "error": "Profile not found" }
    """
    student_id = int(get_jwt_identity())
    profile = profile_service.get_student_profile(student_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify(profile), 200


@users_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update student profile information.

    Expected JSON payload (all fields optional):
        {
            "full_name": "string",
            "cohort_year": int,
            "academic_branch": "string",
            "academics": [
                { "semester": int, "cgpa": float, "active_backlogs": int, "attendance_pct": float }
            ],
            "platform_links": {
                "github_handle": "string",
                "leetcode_username": "string",
                "linkedin_url": "string"
            },
            "skills": {
                "dsa_score": float,
                "python_prof": float,
                "cpp_prof": float,
                ...
            }
        }

    Returns:
        200: { "message": "Profile updated successfully", "profile": {...} }
        400: { "error": "Validation error" }
        404: { "error": "Profile not found" }
    """
    student_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON object"}), 400

    try:
        updated_profile = profile_service.update_student_profile(student_id, data)
    except ValueError as exc:
        msg = str(exc)
        if msg == "Profile not found":
            return jsonify({"error": msg}), 404
        return jsonify({"error": f"Validation error: {msg}"}), 400

    return (
        jsonify(
            {
                "message": "Profile updated successfully",
                "profile": updated_profile,
            }
        ),
        200,
    )
