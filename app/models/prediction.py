"""
ML_Predictions Model

Caches machine learning inference outputs to minimize redundant computation.
Each prediction is timestamped and linked to the student who triggered it.

Schema:
    prediction_id (PK) | student_id (FK → users_master) |
    placement_probability | readiness_tier |
    feature_importance (JSON) | career_matches_json (JSON) |
    target_career_path | roadmap_json (JSON) | created_at

JSON Columns:
    feature_importance   : SHAP / feature weight dict from XGBoost inference
                           e.g. {"dsa_score": 0.32, "cgpa": 0.28, ...}
    career_matches_json  : cosine-similarity ranked career list
                           e.g. [{"career": "SDE", "score": 0.91}, ...]
    roadmap_json         : structured learning roadmap for the selected career path
"""

import json
from datetime import datetime
from app.extensions import db


class MLPrediction(db.Model):
    """SQLAlchemy model for the ml_predictions table."""

    __tablename__ = "ml_predictions"

    # ── Primary Key ────────────────────────────────────────────────────────────
    prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Foreign Key ────────────────────────────────────────────────────────────
    # index=True adds a B-tree index so queries filtering by student_id are fast.
    # ondelete="CASCADE" → rows auto-deleted when the parent user is removed.
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── XGBoost Outputs ────────────────────────────────────────────────────────
    placement_probability = db.Column(db.Float, nullable=True)          # 0.0 – 1.0
    readiness_tier = db.Column(db.String(50), nullable=True)            # e.g. "Highly Prepared"

    # SHAP feature importance dict, stored as a JSON string in the DB.
    # Use .feature_importance_dict property for a parsed Python dict.
    feature_importance = db.Column(db.Text, nullable=True)

    # ── Career Matching Outputs ────────────────────────────────────────────────
    # Cosine-similarity ranked career matches (JSON string).
    career_matches_json = db.Column(db.Text, nullable=True)

    # Student's selected career target and its detailed roadmap (JSON string).
    target_career_path = db.Column(db.String(200), nullable=True)
    roadmap_json = db.Column(db.Text, nullable=True)

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ── Computed Properties ────────────────────────────────────────────────────
    @property
    def feature_importance_dict(self):
        """Return feature_importance as a parsed Python dict (or None)."""
        if self.feature_importance:
            return json.loads(self.feature_importance)
        return None

    @property
    def career_matches(self):
        """Return career_matches_json as a parsed Python list (or None)."""
        if self.career_matches_json:
            return json.loads(self.career_matches_json)
        return None

    @property
    def roadmap(self):
        """Return roadmap_json as a parsed Python dict/list (or None)."""
        if self.roadmap_json:
            return json.loads(self.roadmap_json)
        return None

    # ── Serialization ──────────────────────────────────────────────────────────
    def to_dict(self):
        """
        Serialize prediction to a fully JSON-safe dictionary.

        All JSON text columns are parsed into native Python structures so
        the API response can be consumed directly without double-decoding.
        """
        return {
            "prediction_id": self.prediction_id,
            "student_id": self.student_id,
            "placement_probability": self.placement_probability,
            "readiness_tier": self.readiness_tier,
            # Parse stored JSON strings → native Python objects
            "feature_importance": self.feature_importance_dict,
            "career_matches": self.career_matches,
            "target_career_path": self.target_career_path,
            "roadmap": self.roadmap,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<MLPrediction {self.prediction_id} student={self.student_id} @ {self.created_at}>"
