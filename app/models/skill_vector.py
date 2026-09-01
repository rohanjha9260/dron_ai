"""
Skill_Vectors Model

Aggregates quantitative skill metrics extracted from external platforms
and manual student input. One-to-one relationship with users_master.

Design — Shared Primary Key (PK/FK Pattern):
    student_id serves as BOTH the primary key AND the foreign key.
    This is the correct design for a strict one-to-one extension table because:
      1. It eliminates the need for a separate surrogate key (no wasted storage).
      2. It makes the join trivial: WHERE skill_vectors.student_id = :id
      3. It enforces the one-to-one constraint purely at the PK level — you
         physically cannot insert two rows for the same student.

Schema:
    student_id (PK / FK → users_master) |
    dsa_score | python_prof | cpp_prof | aiml_knowledge |
    total_commits | problems_solved | contest_rating |
    project_count | communication_score | internship_exp |
    updated_at
"""

from datetime import datetime
from app.extensions import db


class SkillVector(db.Model):
    """SQLAlchemy model for the skill_vectors table."""

    __tablename__ = "skill_vectors"

    # ── Primary Key + Foreign Key (shared PK/FK pattern) ──────────────────────
    # student_id IS the primary key — no separate surrogate key needed.
    # ondelete="CASCADE" → row deleted automatically when parent user is removed.
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id", ondelete="CASCADE"),
        primary_key=True,
    )

    # ── Technical Skills (0–100 scale) ────────────────────────────────────────
    dsa_score = db.Column(db.Float, default=0.0)          # Data Structures & Algorithms
    python_prof = db.Column(db.Float, default=0.0)        # Python proficiency
    cpp_prof = db.Column(db.Float, default=0.0)           # C++ proficiency
    aiml_knowledge = db.Column(db.Float, default=0.0)     # AI/ML conceptual knowledge

    # ── Platform Metrics (extracted from GitHub / LeetCode) ───────────────────
    total_commits = db.Column(db.Integer, default=0)      # GitHub commit count
    problems_solved = db.Column(db.Integer, default=0)   # LeetCode problems solved
    contest_rating = db.Column(db.Float, default=0.0)    # LeetCode contest rating

    # ── Soft Skills & Experience ───────────────────────────────────────────────
    project_count = db.Column(db.Integer, default=0)      # number of projects
    communication_score = db.Column(db.Float, default=0.0)
    internship_exp = db.Column(db.Integer, default=0)    # internship duration in months

    # ── Timestamps ─────────────────────────────────────────────────────────────
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # ── Serialization ──────────────────────────────────────────────────────────
    def to_dict(self):
        """Serialize skill vector to a JSON-safe dictionary."""
        return {
            "student_id": self.student_id,
            "dsa_score": self.dsa_score,
            "python_prof": self.python_prof,
            "cpp_prof": self.cpp_prof,
            "aiml_knowledge": self.aiml_knowledge,
            "total_commits": self.total_commits,
            "problems_solved": self.problems_solved,
            "contest_rating": self.contest_rating,
            "project_count": self.project_count,
            "communication_score": self.communication_score,
            "internship_exp": self.internship_exp,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_feature_vector(self):
        """
        Convert skill metrics to an ordered list of floats for ML model input.

        Order must match the feature columns the XGBoost model was trained on.
        """
        return [
            self.dsa_score,
            self.python_prof,
            self.cpp_prof,
            self.aiml_knowledge,
            float(self.total_commits),
            float(self.problems_solved),
            self.contest_rating,
            float(self.project_count),
            self.communication_score,
            float(self.internship_exp),
        ]

    def __repr__(self):
        return f"<SkillVector student={self.student_id}>"
