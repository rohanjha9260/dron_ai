"""
Prediction Service

Handles:
    - Building feature vectors from student academic + skill data
    - Calling XGBoost model for placement readiness inference
    - Mapping raw probability to readiness tiers
    - Persisting prediction audit rows in ml_predictions table
"""

import json
import logging
from typing import Dict, Any

from app.extensions import db
from app.models import User, AcademicHistory, SkillVector, MLPrediction

logger = logging.getLogger(__name__)


# ── Readiness tier thresholds (as per issue spec) ─────────────────────────────
# Boundaries: ≥0.80 → Highly Prepared | ≥0.60 → Prepared |
#             ≥0.40 → Needs Improvement | <0.40 → High Risk / Action Required
def get_readiness_tier(probability: float) -> str:
    """Map a raw probability score (0.0–1.0) to a human-readable readiness tier."""
    if probability >= 0.80:
        return "Highly Prepared"
    if probability >= 0.60:
        return "Prepared"
    if probability >= 0.40:
        return "Needs Improvement"
    return "High Risk / Action Required"


def predict_placement(student_id: int) -> Dict[str, Any]:
    """
    Run placement readiness prediction for a student.

    Steps:
        1. Validate student exists in the database.
        2. Fetch the latest academic record (highest semester) and skill vector.
        3. Raise ValueError if either is missing — insufficient data to predict.
        4. Build a 13-dimensional feature vector via preprocessing.
        5. Load the singleton XGBoost model and run inference.
        6. Raise RuntimeError if the model is not loaded.
        7. Assign a human-readable readiness tier.
        8. Persist the prediction row in ml_predictions (audit trail).
        9. Return placement_probability, readiness_tier, and feature_importance.

    Args:
        student_id: The student's primary key in users_master.

    Returns:
        Dict with:
            - placement_probability (float, 0.0–1.0)
            - readiness_tier        (str)
            - feature_importance    (dict[str, float])
            - top_factors           (list[str])
            - prediction_id         (int)

    Raises:
        ValueError:   If the student is not found or has incomplete profile data.
        RuntimeError: If the XGBoost model singleton is not loaded.
    """
    # ── 1. Validate student ────────────────────────────────────────────────────
    user = db.session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    # ── 2. Fetch latest academic record (highest semester number) ──────────────
    latest_academic = (
        AcademicHistory.query
        .filter_by(student_id=student_id)
        .order_by(AcademicHistory.semester.desc())
        .first()
    )

    # ── 3. Fetch skill vector (one-to-one) ─────────────────────────────────────
    skill_vector = SkillVector.query.filter_by(student_id=student_id).first()

    # ── 4. Guard — both records must exist ────────────────────────────────────
    missing = []
    if latest_academic is None:
        missing.append("academic records")
    if skill_vector is None:
        missing.append("skill vector")

    if missing:
        raise ValueError(
            f"Incomplete profile — cannot predict. Missing: {', '.join(missing)}."
        )

    # ── 5. Build 13-dimensional feature vector ─────────────────────────────────
    from ml_engine.preprocessing import build_feature_vector

    academic_data: Dict[str, Any] = {
        "cgpa": latest_academic.cgpa,
        "attendance_pct": latest_academic.attendance_pct,
        "active_backlogs": latest_academic.active_backlogs,
    }

    skill_data: Dict[str, Any] = {
        "dsa_score": skill_vector.dsa_score,
        "python_prof": skill_vector.python_prof,
        "cpp_prof": skill_vector.cpp_prof,
        "aiml_knowledge": skill_vector.aiml_knowledge,
        "total_commits": skill_vector.total_commits,
        "problems_solved": skill_vector.problems_solved,
        "contest_rating": skill_vector.contest_rating,
        "project_count": skill_vector.project_count,
        "communication_score": skill_vector.communication_score,
        "internship_exp": skill_vector.internship_exp,
    }

    features = build_feature_vector(
        academic_data=academic_data,
        skill_data=skill_data,
    )
    logger.debug("Built feature vector for student %s: %s", student_id, features)

    # ── 6. Load singleton model and run inference ──────────────────────────────
    from ml_engine.model_loader import get_placement_model

    model = get_placement_model()
    if model is None:
        raise RuntimeError(
            "XGBoost model is not loaded. Run scripts/train_model.py to train and "
            "serialize the model before calling the prediction endpoint."
        )

    inference_result = model.predict(features)

    placement_probability: float = inference_result["placement_probability"]
    feature_importance: Dict[str, float] = inference_result.get("feature_importance", {})
    top_factors = inference_result.get("top_factors", [])

    # ── 7. Assign readiness tier ───────────────────────────────────────────────
    readiness_tier = get_readiness_tier(placement_probability)

    logger.info(
        "Placement prediction for student %s: probability=%.4f tier=%s",
        student_id,
        placement_probability,
        readiness_tier,
    )

    # ── 8. Persist prediction audit row ───────────────────────────────────────
    prediction_row = MLPrediction(
        student_id=student_id,
        placement_probability=placement_probability,
        readiness_tier=readiness_tier,
        feature_importance=json.dumps(feature_importance),
    )
    db.session.add(prediction_row)
    db.session.commit()

    # ── 9. Return response payload ─────────────────────────────────────────────
    return {
        "prediction_id": prediction_row.prediction_id,
        "placement_probability": placement_probability,
        "readiness_tier": readiness_tier,
        "feature_importance": feature_importance,
        "top_factors": top_factors,
    }
