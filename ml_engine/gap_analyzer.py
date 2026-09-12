"""
Skill-Gap Analyzer

Performs vector subtraction between the Ideal Career Vector and
the Student Vector to identify skill deficiencies.

    Gap = Ideal Career Vector - Student Vector

Dimensions with the highest positive delta represent the student's
primary weaknesses relative to their target career.
"""

from typing import List, Dict, Any, Union
import numpy as np
import logging

from ml_engine.preprocessing import FEATURE_NAMES

logger = logging.getLogger(__name__)

# The 10 skill feature names corresponding to career vector dimensions
SKILL_FEATURE_NAMES = [
    "dsa_score",
    "python_prof",
    "cpp_prof",
    "aiml_knowledge",
    "total_commits",
    "problems_solved",
    "contest_rating",
    "project_count",
    "communication_score",
    "internship_exp",
]


def _format_vector(vec: Union[np.ndarray, list, Any]) -> np.ndarray:
    """Format and sanitize input vector to a 1D float64 numpy array."""
    if isinstance(vec, list):
        arr = np.array(vec, dtype=np.float64)
    elif isinstance(vec, np.ndarray):
        arr = vec.astype(np.float64)
    else:
        arr = np.asarray(vec, dtype=np.float64)

    if arr.ndim == 2:
        if arr.shape[0] == 1 or arr.shape[1] == 1:
            arr = arr.flatten()
        else:
            raise ValueError(f"Expected 1D vector or single-row 2D array, got shape {arr.shape}")
    elif arr.ndim != 1:
        raise ValueError(f"Expected 1D vector, got ndim={arr.ndim}")

    return np.nan_to_num(arr, nan=0.0, posinf=0.0, neginf=0.0)


def analyze_gaps(student_vector: Union[np.ndarray, list], career_vector: Union[np.ndarray, list]) -> List[Dict[str, Any]]:
    """
    Calculate the skill gap between a student and their target career.

    Performs dimensional subtraction and returns gaps sorted by severity.

    Args:
        student_vector: 1D numpy array or list of student's current skills (10-D or 13-D)
        career_vector: 1D numpy array or list of the ideal career requirements (10-D or 13-D)

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
    s_vec = _format_vector(student_vector)
    c_vec = _format_vector(career_vector)

    # If student vector is 13-D and career vector is 10-D, slice off academic features
    if s_vec.shape[0] == 13 and c_vec.shape[0] == 10:
        s_vec = s_vec[3:]
        feature_labels = SKILL_FEATURE_NAMES
    elif s_vec.shape[0] == 10 and c_vec.shape[0] == 13:
        c_vec = c_vec[3:]
        feature_labels = SKILL_FEATURE_NAMES
    elif s_vec.shape[0] == 10 and c_vec.shape[0] == 10:
        feature_labels = SKILL_FEATURE_NAMES
    elif s_vec.shape[0] == 13 and c_vec.shape[0] == 13:
        feature_labels = FEATURE_NAMES
    else:
        raise ValueError(
            f"Incompatible vector dimensions: student_vector ({s_vec.shape[0]}) vs "
            f"career_vector ({c_vec.shape[0]}). Expected either 10 or 13 dimensions."
        )

    gaps = []
    for skill_name, current_val, req_val in zip(feature_labels, s_vec, c_vec):
        delta = req_val - current_val
        # Filter to only positive gaps (areas where required exceeds current)
        if delta > 0:
            if req_val > 0:
                gap_pct = round((delta / req_val) * 100.0, 1)
            else:
                gap_pct = 0.0

            gaps.append({
                "skill": skill_name,
                "current": round(float(current_val), 1),
                "required": round(float(req_val), 1),
                "gap": round(float(delta), 1),
                "gap_pct": gap_pct,
            })

    # Sort descending by gap magnitude
    gaps.sort(key=lambda item: item["gap"], reverse=True)
    return gaps
