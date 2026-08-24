"""
Career Service

Handles:
    - Building student skill vector for cosine similarity
    - Running career recommendation against predefined career vectors
    - Returning ranked career matches with confidence percentages
"""

from app.extensions import db
from app.models import SkillVector, MLPrediction


def recommend_careers(student_id: int) -> dict:
    """
    Generate career recommendations using Cosine Similarity.

    Transforms the student's skill vector into the career feature space,
    then calculates similarity against all predefined ideal career vectors.

    Args:
        student_id: The student's primary key

    Returns:
        Dict with ranked list of career recommendations and match percentages

    Raises:
        ValueError: If student profile is incomplete
    """
    # TODO: Implement
    # 1. Fetch student's SkillVector
    # 2. Convert to feature vector
    # 3. Load career vectors from career_vectors.json
    # 4. Calculate cosine similarity for each career
    # 5. Sort by similarity score (descending)
    # 6. Cache results in ML_Predictions table
    # 7. Return ranked recommendations
    pass
