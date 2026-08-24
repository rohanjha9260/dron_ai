"""
Skill-Gap Analyzer

Performs vector subtraction between the Ideal Career Vector and
the Student Vector to identify skill deficiencies.

    Gap = Ideal Career Vector - Student Vector

Dimensions with the highest positive delta represent the student's
primary weaknesses relative to their target career.
"""

import numpy as np
import logging

from ml_engine.preprocessing import FEATURE_NAMES

logger = logging.getLogger(__name__)


def analyze_gaps(student_vector: np.ndarray, career_vector: np.ndarray) -> list:
    """
    Calculate the skill gap between a student and their target career.

    Performs dimensional subtraction and returns gaps sorted by severity.

    Args:
        student_vector: 1D numpy array of student's current skills
        career_vector: 1D numpy array of the ideal career requirements

    Returns:
        List of dicts sorted by gap (descending):
        [
            {
                "skill": "dsa_score",
                "current": 40.0,
                "required": 90.0,
                "gap": 50.0,
                "gap_pct": 55.6
            },
            ...
        ]
    """
    # TODO: Implement
    # 1. Compute gap = career_vector - student_vector
    # 2. Pair each gap with its feature name
    # 3. Filter to only positive gaps (weaknesses)
    # 4. Sort by gap magnitude (descending)
    # 5. Calculate gap percentage
    # 6. Return structured list
    pass
