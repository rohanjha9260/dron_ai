"""
Career Service

Handles:
    - Building student skill vector for cosine similarity
    - Running career recommendation against predefined career vectors
    - Returning ranked career matches with confidence percentages
    - Persisting results in ml_predictions (career_matches_json column)
"""

import json
import logging
from typing import Dict, Any

from app.extensions import db
from app.models import User, SkillVector, MLPrediction
from ml_engine.model_loader import get_career_recommender

logger = logging.getLogger(__name__)


def recommend_careers(student_id: int, top_k: int = 5) -> Dict[str, Any]:
    """
    Generate career recommendations using Cosine Similarity.

    Transforms the student's skill vector into the career feature space,
    then calculates similarity against all predefined ideal career vectors.

    Args:
        student_id: The student's primary key
        top_k:      Number of top careers to return (default: 5)

    Returns:
        Dict with ranked list of career recommendations and match percentages::

            {
                "recommendations": [
                    {"career": "Software Engineer", "match_pct": 92.3, "description": "..."},
                    ...
                ]
            }

    Raises:
        ValueError:   If student is not found or skill vector is missing.
        RuntimeError: If the CareerRecommender singleton is not loaded.
    """
    # ── 1. Validate student ────────────────────────────────────────────────────
    user = db.session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    # ── 2. Fetch skill vector (one-to-one) ─────────────────────────────────────
    skill_vector = SkillVector.query.filter_by(student_id=student_id).first()
    if skill_vector is None:
        raise ValueError(
            "Incomplete profile — cannot recommend careers. Missing: skill vector."
        )

    # ── 3. Convert SkillVector row → 10-D float list ───────────────────────────
    student_vec = skill_vector.to_feature_vector()
    logger.debug(
        "Built 10-D skill vector for student %s: %s", student_id, student_vec
    )

    # ── 4. Load singleton career recommender ───────────────────────────────────
    recommender = get_career_recommender()
    if recommender is None:
        raise RuntimeError(
            "CareerRecommender is not loaded. Ensure career_vectors.json exists and "
            "the application was started correctly."
        )

    # ── 5. Run cosine similarity and get top-K recommendations ─────────────────
    recommendations = recommender.recommend(student_vec, top_k=top_k)

    logger.info(
        "Career recommendations for student %s: top match = %s (%.2f%%)",
        student_id,
        recommendations[0]["career"] if recommendations else "N/A",
        recommendations[0]["match_pct"] if recommendations else 0.0,
    )

    # ── 6. Persist career matches in ml_predictions (audit trail) ──────────────
    prediction_row = MLPrediction(
        student_id=student_id,
        career_matches_json=json.dumps(recommendations),
    )
    db.session.add(prediction_row)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception(
            "Failed to persist career matches for student %s — rolling back.",
            student_id,
        )
        raise

    # ── 7. Return response payload ─────────────────────────────────────────────
    return {
        "prediction_id": prediction_row.prediction_id,
        "recommendations": recommendations,
    }
