"""
Skill_Vectors Model

Aggregates quantitative skill metrics extracted from external platforms
and manual student input. One-to-one relationship with Users_Master.

Schema:
    vector_id (PK) | student_id (FK) | dsa_score | python_prof | cpp_prof |
    total_commits | problems_solved | contest_rating | project_count |
    communication_score | internship_exp | aiml_knowledge
"""

from datetime import datetime
from app.extensions import db


class SkillVector(db.Model):
    """SQLAlchemy model for the Skill_Vectors table."""

    __tablename__ = "skill_vectors"

    vector_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id"),
        unique=True,
        nullable=False,
    )

    # Technical Skills (0-100 scale)
    dsa_score = db.Column(db.Float, default=0.0)
    python_prof = db.Column(db.Float, default=0.0)
    cpp_prof = db.Column(db.Float, default=0.0)
    aiml_knowledge = db.Column(db.Float, default=0.0)

    # Platform Metrics (extracted from GitHub/LeetCode)
    total_commits = db.Column(db.Integer, default=0)
    problems_solved = db.Column(db.Integer, default=0)
    contest_rating = db.Column(db.Float, default=0.0)

    # Soft Skills & Experience
    project_count = db.Column(db.Integer, default=0)
    communication_score = db.Column(db.Float, default=0.0)
    internship_exp = db.Column(db.Integer, default=0)  # months

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Serialize skill vector to dictionary."""
        return {
            "vector_id": self.vector_id,
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
        }

    def to_feature_vector(self):
        """Convert to a list of numerical features for ML input."""
        return [
            self.dsa_score,
            self.python_prof,
            self.cpp_prof,
            self.aiml_knowledge,
            self.total_commits,
            self.problems_solved,
            self.contest_rating,
            self.project_count,
            self.communication_score,
            self.internship_exp,
        ]

    def __repr__(self):
        return f"<SkillVector student={self.student_id}>"
