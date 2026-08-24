"""
Users Blueprint

Endpoints:
    GET  /api/users/profile  — Get full student profile (profile + academics + skills)
    PUT  /api/users/profile  — Update student profile information
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

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
    # TODO: Implement using profile_service
    student_id = get_jwt_identity()
    return jsonify({"message": "get profile - not yet implemented"}), 501


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
                { "semester_index": int, "cgpa": float, "active_backlogs": int, "attendance_pct": float }
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
        200: { "message": "Profile updated successfully" }
        400: { "error": "Validation error" }
    """
    # TODO: Implement using profile_service
    student_id = get_jwt_identity()
    return jsonify({"message": "update profile - not yet implemented"}), 501
