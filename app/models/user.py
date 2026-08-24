"""
Users_Master Model

Core identity management table. Each row represents a registered student.
Stores authentication credentials and basic profile information.

Schema:
    student_id (PK) | full_name | email | password_hash | cohort_year | academic_branch
"""

from datetime import datetime
from app.extensions import db


class User(db.Model):
    """SQLAlchemy model for the Users_Master table."""

    __tablename__ = "users_master"

    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    cohort_year = db.Column(db.Integer, nullable=True)
    academic_branch = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    academic_records = db.relationship("AcademicHistory", backref="student", lazy=True)
    platform_links = db.relationship("PlatformLink", backref="student", uselist=False, lazy=True)
    skill_vectors = db.relationship("SkillVector", backref="student", uselist=False, lazy=True)
    predictions = db.relationship("MLPrediction", backref="student", lazy=True)

    def to_dict(self):
        """Serialize user to dictionary (excludes password_hash)."""
        return {
            "student_id": self.student_id,
            "full_name": self.full_name,
            "email": self.email,
            "cohort_year": self.cohort_year,
            "academic_branch": self.academic_branch,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.student_id}: {self.full_name}>"
