"""
Roadmap Service

Handles:
    - Skill-gap analysis (vector subtraction: Ideal Career Vector − Student Vector)
    - Personalized roadmap generation with phased action plans
    - Persisting generated roadmaps in ml_predictions (roadmap_json column)
"""

import json
import logging
from typing import Dict, Any

from app.extensions import db
from app.models import User, SkillVector, MLPrediction
from ml_engine.model_loader import get_career_recommender
from ml_engine import gap_analyzer, roadmap_generator

logger = logging.getLogger(__name__)


def generate_roadmap(student_id: int, target_career: str) -> Dict[str, Any]:
    """
    Generate a personalized preparation roadmap.

    Performs vector subtraction (Ideal Career Vector − Student Vector) to
    identify skill gaps, then generates a sequenced, phased action plan.

    Args:
        student_id:    The student's primary key
        target_career: The career path to target (e.g., "Software Engineer")

    Returns:
        Dict with target_career, skill_gaps, and phased roadmap::

            {
                "prediction_id":  int,
                "target_career":  "Software Engineer",
                "skill_gaps": [
                    {"skill": "dsa_score", "current": 40.0, "required": 90.0,
                     "gap": 50.0, "gap_pct": 55.6},
                    ...
                ],
                "roadmap": [
                    {"phase": 1, "title": "Master Data Structures & Algorithms",
                     "skill": "dsa_score", "duration": "6 weeks",
                     "tasks": [...], "priority": "high", "milestone": "..."},
                    ...
                ]
            }

    Raises:
        ValueError:   If target_career is invalid, student not found, or
                      skill vector is missing.
        RuntimeError: If the CareerRecommender singleton is not loaded.
    """
    # ── 1. Validate inputs ─────────────────────────────────────────────────────
    if not target_career or not target_career.strip():
        raise ValueError("target_career is required")

    target_career = target_career.strip()

    # ── 2. Validate student exists ─────────────────────────────────────────────
    user = db.session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    # ── 3. Fetch skill vector (one-to-one) ─────────────────────────────────────
    skill_vector = SkillVector.query.filter_by(student_id=student_id).first()
    if skill_vector is None:
        raise ValueError(
            "Incomplete profile — cannot generate roadmap. Missing: skill vector."
        )

    # ── 4. Convert SkillVector row → 10-D float list ───────────────────────────
    student_vec = skill_vector.to_feature_vector()
    logger.debug(
        "Built 10-D skill vector for student %s: %s", student_id, student_vec
    )

    # ── 5. Load career recommender singleton to fetch ideal career vector ───────
    recommender = get_career_recommender()
    if recommender is None:
        raise RuntimeError(
            "CareerRecommender is not loaded. Ensure career_vectors.json exists and "
            "the application was started correctly."
        )

    # ── 6. Resolve target career → ideal career vector (raises ValueError if unknown) ──
    try:
        career_vec = recommender.get_career_vector(target_career)
    except ValueError as exc:
        raise ValueError(str(exc)) from exc

    logger.debug(
        "Fetched ideal vector for career '%s': %s", target_career, career_vec
    )

    # ── 7. Compute skill gaps via vector subtraction ────────────────────────────
    skill_gaps = gap_analyzer.analyze_gaps(
        student_vector=student_vec,
        career_vector=career_vec,
    )

    logger.info(
        "Gap analysis for student %s → '%s': %d gaps identified",
        student_id,
        target_career,
        len(skill_gaps),
    )

    # ── 8. Generate phased preparation roadmap ─────────────────────────────────
    roadmap = roadmap_generator.generate_plan(skill_gaps=skill_gaps, max_phases=5)

    logger.info(
        "Roadmap generated for student %s → '%s': %d phases",
        student_id,
        target_career,
        len(roadmap),
    )

    # ── 9. Persist roadmap in ml_predictions (audit trail) ─────────────────────
    prediction_row = MLPrediction(
        student_id=student_id,
        target_career_path=target_career,
        roadmap_json=json.dumps(roadmap),
    )
    db.session.add(prediction_row)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception(
            "Failed to persist roadmap for student %s → '%s' — rolling back.",
            student_id,
            target_career,
        )
        raise

    # ── 10. Return response payload ────────────────────────────────────────────
    return {
        "prediction_id": prediction_row.prediction_id,
        "target_career": target_career,
        "skill_gaps": skill_gaps,
        "roadmap": roadmap,
    }
