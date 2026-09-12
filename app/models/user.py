"""
Users_Master Model

Core identity management table. Each row represents a registered student.
Stores authentication credentials and basic profile information.

Schema:
    student_id (PK) | full_name | email | password_hash | cohort_year | academic_branch
    created_at | updated_at

Relationships:
    - academic_records : one-to-many  → AcademicHistory
    - platform_link    : one-to-one   → PlatformLink
    - skill_vector     : one-to-one   → SkillVector
    - predictions      : one-to-many  → MLPrediction

Cascade:
    Deleting a User cascades deletes to all 4 child tables via
    cascade="all, delete-orphan" + passive_deletes=True (defers to DB ON DELETE CASCADE).
"""

from datetime import datetime
from app.extensions import db


class User(db.Model):
    """SQLAlchemy model for the users_master table."""

    __tablename__ = "users_master"

    # ── Primary Key ────────────────────────────────────────────────────────────
    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Profile Fields ─────────────────────────────────────────────────────────
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    cohort_year = db.Column(db.Integer, nullable=True)
    academic_branch = db.Column(db.String(100), nullable=True)

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    # cascade="all, delete-orphan" tells SQLAlchemy's ORM layer to delete child
    # objects when the parent is deleted.
    # passive_deletes=True tells SQLAlchemy to defer to the DB-level ON DELETE CASCADE
    # rather than loading child rows into memory before deleting them (more efficient).
    academic_records = db.relationship(
        "AcademicHistory",
        backref="student",
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    platform_link = db.relationship(
        "PlatformLink",
        backref="student",
        uselist=False,  # one-to-one
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    skill_vector = db.relationship(
        "SkillVector",
        backref="student",
        uselist=False,  # one-to-one
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    predictions = db.relationship(
        "MLPrediction",
        backref="student",
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # ── Serialization ──────────────────────────────────────────────────────────
    def to_dict(self):
        """
        Serialize user to a JSON-safe dictionary.

        password_hash is intentionally excluded — never expose credentials.
        """
        return {
            "student_id": self.student_id,
            "full_name": self.full_name,
            "email": self.email,
            "cohort_year": self.cohort_year,
            "academic_branch": self.academic_branch,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<User {self.student_id}: {self.full_name}>"
