"""
Roadmap Service

Handles:
    - Skill-gap analysis (vector subtraction)
    - Personalized roadmap generation with phased action plans
    - Caching generated roadmaps
"""

from app.extensions import db
from app.models import SkillVector, MLPrediction


def generate_roadmap(student_id: int, target_career: str) -> dict:
    """
    Generate a personalized preparation roadmap.

    Performs vector subtraction (Ideal Career Vector - Student Vector)
    to identify skill gaps, then generates a sequenced action plan.

    Args:
        student_id: The student's primary key
        target_career: The career path to target (e.g., "Software Engineer")

    Returns:
        Dict with skill_gaps list and phased roadmap

    Raises:
        ValueError: If target_career is invalid or profile is incomplete
    """
    # TODO: Implement
    # 1. Fetch student's SkillVector
    # 2. Load target career's ideal vector
    # 3. Call gap_analyzer to compute dimensional deltas
    # 4. Call roadmap_generator to create phased plan
    # 5. Cache roadmap in ML_Predictions table
    # 6. Return skill gaps and roadmap
    pass
