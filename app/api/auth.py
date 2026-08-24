"""
Authentication Blueprint

Endpoints:
    POST /api/auth/register  — Register a new student account
    POST /api/auth/login     — Authenticate and receive JWT access token
    GET  /api/auth/me        — Get current authenticated user info
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new student.

    Expected JSON payload:
        {
            "full_name": "string",
            "email": "string",
            "password": "string",
            "cohort_year": int (optional),
            "academic_branch": "string" (optional)
        }

    Returns:
        201: { "message": "Registration successful", "student_id": int }
        400: { "error": "Validation error message" }
        409: { "error": "Email already registered" }
    """
    # TODO: Implement registration logic using auth_service
    return jsonify({"message": "register endpoint - not yet implemented"}), 501


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate student and issue JWT.

    Expected JSON payload:
        {
            "email": "string",
            "password": "string"
        }

    Returns:
        200: { "access_token": "string", "student_id": int }
        401: { "error": "Invalid credentials" }
    """
    # TODO: Implement login logic using auth_service
    return jsonify({"message": "login endpoint - not yet implemented"}), 501


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Get the profile of the currently authenticated user.

    Returns:
        200: User profile dictionary
        401: Unauthorized
    """
    # TODO: Implement using get_jwt_identity() to fetch user
    return jsonify({"message": "me endpoint - not yet implemented"}), 501
