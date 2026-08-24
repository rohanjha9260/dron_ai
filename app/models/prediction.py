"""
ML_Predictions Model

Caches machine learning inference outputs to minimize redundant computation.
Each prediction is timestamped and linked to the student who requested it.

Schema:
    inference_id (PK) | student_id (FK) | placement_probability |
    target_career_path | career_matches_json | roadmap_json | timestamp
"""

from datetime import datetime
from app.extensions import db


class MLPrediction(db.Model):
    """SQLAlchemy model for the ML_Predictions table."""

    __tablename__ = "ml_predictions"

    inference_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("users_master.student_id"), nullable=False
    )

    # XGBoost output
    placement_probability = db.Column(db.Float, nullable=True)
    readiness_tier = db.Column(db.String(50), nullable=True)  # e.g., "Highly Prepared"

    # Cosine Similarity output (stored as JSON string)
    career_matches_json = db.Column(db.Text, nullable=True)

    # Selected career and roadmap (stored as JSON string)
    target_career_path = db.Column(db.String(200), nullable=True)
    roadmap_json = db.Column(db.Text, nullable=True)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Serialize prediction to dictionary."""
        return {
            "inference_id": self.inference_id,
            "student_id": self.student_id,
            "placement_probability": self.placement_probability,
            "readiness_tier": self.readiness_tier,
            "career_matches_json": self.career_matches_json,
            "target_career_path": self.target_career_path,
            "roadmap_json": self.roadmap_json,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

    def __repr__(self):
        return f"<MLPrediction student={self.student_id} @ {self.timestamp}>"
