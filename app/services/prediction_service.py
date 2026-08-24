"""
Prediction Service

Handles:
    - Building feature vectors from student data
    - Calling XGBoost model for placement readiness inference
    - Mapping raw probability to readiness tiers
    - Caching predictions in ML_Predictions table
"""

from app.extensions import db
from app.models import User, AcademicHistory, SkillVector, MLPrediction


READINESS_TIERS = {
    (0.8, 1.0): "Highly Prepared",
    (0.6, 0.8): "Prepared",
    (0.4, 0.6): "Moderately Prepared",
    (0.2, 0.4): "Needs Improvement",
    (0.0, 0.2): "At Risk",
}


def get_readiness_tier(probability: float) -> str:
    """Map a raw probability score to a human-readable tier."""
    for (low, high), tier in READINESS_TIERS.items():
        if low <= probability < high:
            return tier
    return "Highly Prepared" if probability >= 1.0 else "At Risk"


def predict_placement(student_id: int) -> dict:
    """
    Run placement readiness prediction for a student.

    Args:
        student_id: The student's primary key

    Returns:
        Dict with placement_probability, readiness_tier, and feature details

    Raises:
        ValueError: If student profile is incomplete
    """
    # TODO: Implement
    # 1. Fetch student's academic records and skill vector
    # 2. Build feature vector using preprocessing
    # 3. Load XGBoost model (from app context / singleton)
    # 4. Run inference
    # 5. Map probability to readiness tier
    # 6. Cache result in ML_Predictions table
    # 7. Return results
    pass
