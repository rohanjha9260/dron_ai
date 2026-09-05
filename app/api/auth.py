"""
Authentication Blueprint

Endpoints:
    POST /api/auth/register  — Register a new student account
    POST /api/auth/login     — Authenticate and receive JWT access token
    GET  /api/auth/me        — Get current authenticated user info
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.services import auth_service

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
        400: { "error": "Missing required fields: email, password, full_name" }
        409: { "error": "Email already registered" }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        result = auth_service.register_student(data)
    except ValueError as exc:
        reason = str(exc)
        if reason == "email_taken":
            return jsonify({"error": "Email already registered"}), 409
        # missing_fields or any other validation error
        return jsonify({"error": "Missing required fields: email, password, full_name"}), 400

    return jsonify(result), 201


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
        400: { "error": "email and password are required" }
        401: { "error": "Invalid credentials" }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    try:
        result = auth_service.authenticate_student(email, password)
    except ValueError:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify(result), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Get the profile of the currently authenticated user.

    Requires:
        Authorization: Bearer <JWT access token>

    Returns:
        200: User profile dictionary (password_hash excluded)
        401: Unauthorized (missing or invalid token — handled by flask-jwt-extended)
        404: { "error": "User not found" }
    """
    # get_jwt_identity() returns the string we encoded at login time
    student_id = int(get_jwt_identity())

    user = db.session.get(User, student_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict()), 200
