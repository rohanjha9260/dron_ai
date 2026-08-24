"""
Authentication Service

Handles:
    - Password hashing and verification (bcrypt)
    - JWT token creation
    - User registration logic
    - Login validation
"""

import bcrypt
from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models.user import User


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    # TODO: Implement bcrypt hashing
    pass


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    # TODO: Implement bcrypt verification
    pass


def register_student(data: dict) -> dict:
    """
    Register a new student account.

    Args:
        data: Dict with full_name, email, password, and optional fields

    Returns:
        Dict with student_id and success message

    Raises:
        ValueError: If email already exists or validation fails
    """
    # TODO: Implement registration
    # 1. Validate input
    # 2. Check if email already exists
    # 3. Hash password
    # 4. Create User record
    # 5. Create empty PlatformLink and SkillVector records
    # 6. Return student_id
    pass


def authenticate_student(email: str, password: str) -> dict:
    """
    Authenticate student and generate JWT access token.

    Args:
        email: Student email
        password: Plaintext password

    Returns:
        Dict with access_token and student_id

    Raises:
        ValueError: If credentials are invalid
    """
    # TODO: Implement authentication
    # 1. Find user by email
    # 2. Verify password
    # 3. Create JWT token with student_id as identity
    # 4. Return token
    pass
