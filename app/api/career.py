"""
Career Blueprint

Endpoints:
    POST /api/career/recommend  — Get career recommendations via Cosine Similarity
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

career_bp = Blueprint("career", __name__)


@career_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend_career():
    """
    Run Cosine Similarity to match student profile against ideal career vectors.

    Transforms the student's skill vector into the same dimensional space
    as predefined career vectors and returns ranked matches with confidence scores.

    Returns:
        200: {
            "recommendations": [
                { "career": "Software Engineer", "match_pct": 92.3 },
                { "career": "Data Analyst", "match_pct": 85.1 },
                ...
            ]
        }
        400: { "error": "Incomplete profile - cannot recommend" }
    """
    # TODO: Implement using career_service (calls cosine_recommender)
    student_id = get_jwt_identity()
    return jsonify({"message": "career recommendation - not yet implemented"}), 501
