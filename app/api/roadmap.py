"""
Roadmap Blueprint

Endpoints:
    POST /api/roadmap/generate  — Generate personalized preparation roadmap
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

roadmap_bp = Blueprint("roadmap", __name__)


@roadmap_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_roadmap():
    """
    Generate a personalized, sequenced preparation roadmap.

    Takes the student's selected target career, performs vector subtraction
    (Ideal Career Vector - Student Vector) to identify skill gaps, then
    generates a phased action plan.

    Expected JSON payload:
        {
            "target_career": "Software Engineer"
        }

    Returns:
        200: {
            "target_career": "Software Engineer",
            "skill_gaps": [
                { "skill": "DSA", "current": 40, "required": 90, "gap": 50 },
                ...
            ],
            "roadmap": [
                { "phase": 1, "title": "Master Core DSA", "duration": "4 weeks", "tasks": [...] },
                { "phase": 2, "title": "Focus on Trees & Graphs", "duration": "3 weeks", "tasks": [...] },
                ...
            ]
        }
        400: { "error": "target_career is required" }
    """
    # TODO: Implement using roadmap_service (calls gap_analyzer + roadmap_generator)
    student_id = get_jwt_identity()
    return jsonify({"message": "roadmap generation - not yet implemented"}), 501
