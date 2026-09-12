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
from app.models.platform_link import PlatformLink
from app.models.skill_vector import SkillVector


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt with an auto-generated salt.

    Returns:
        A UTF-8 decoded bcrypt hash string suitable for VARCHAR(255) storage.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plaintext password against a stored bcrypt hash.

    Args:
        password:      Plaintext password provided by the user at login.
        password_hash: bcrypt hash string retrieved from the database.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def register_student(data: dict) -> dict:
    """
    Register a new student account.

    Steps:
        1. Validate required fields are present.
        2. Check email uniqueness.
        3. Hash the plaintext password.
        4. Persist the User record and flush to obtain student_id.
        5. Create default PlatformLink and SkillVector records.
        6. Commit the transaction.

    Args:
        data: Dict containing at minimum ``email``, ``password``, ``full_name``.
              Optional keys: ``cohort_year``, ``academic_branch``.

    Returns:
        Dict with ``student_id`` (int) and ``message`` (str).

    Raises:
        ValueError: ``"missing_fields"``  — if any required field is absent/empty.
        ValueError: ``"email_taken"``     — if the email is already registered.
    """
    # 1. Validate required fields
    required = ("email", "password", "full_name")
    missing = [f for f in required if not data.get(f)]
    if missing:
        raise ValueError("missing_fields")

    email = data["email"].strip().lower()
    password = data["password"]
    full_name = data["full_name"].strip()

    # 2. Check email uniqueness
    if User.query.filter_by(email=email).first():
        raise ValueError("email_taken")

    # 3. Hash password
    hashed = hash_password(password)

    # 4. Create User record
    user = User(
        full_name=full_name,
        email=email,
        password_hash=hashed,
        cohort_year=data.get("cohort_year"),
        academic_branch=data.get("academic_branch"),
    )
    db.session.add(user)
    # flush() writes the INSERT to the DB transaction without committing,
    # which populates user.student_id so child records can reference it.
    db.session.flush()

    # 5. Create associated default records
    platform_link = PlatformLink(student_id=user.student_id)
    skill_vector = SkillVector(student_id=user.student_id)
    db.session.add(platform_link)
    db.session.add(skill_vector)

    # 6. Commit all three inserts atomically
    db.session.commit()

    return {
        "student_id": user.student_id,
        "message": "Registration successful",
    }


def authenticate_student(email: str, password: str) -> dict:
    """
    Authenticate a student and issue a JWT access token.

    Steps:
        1. Locate the user by email.
        2. Verify the provided password against the stored hash.
        3. Issue a JWT with student_id as the string identity.

    Args:
        email:    Student's registered email address.
        password: Plaintext password provided at login.

    Returns:
        Dict with ``access_token`` (str) and ``student_id`` (int).

    Raises:
        ValueError: ``"invalid_credentials"`` — if email not found or password wrong.
    """
    # 1. Find user by email (case-insensitive)
    user = User.query.filter_by(email=email.strip().lower()).first()
    if not user:
        raise ValueError("invalid_credentials")

    # 2. Verify password
    if not verify_password(password, user.password_hash):
        raise ValueError("invalid_credentials")

    # 3. Issue JWT — flask-jwt-extended >= 4.x requires identity to be a string
    access_token = create_access_token(identity=str(user.student_id))

    return {
        "access_token": access_token,
        "student_id": user.student_id,
    }
