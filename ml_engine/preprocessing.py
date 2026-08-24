"""
Data Preprocessing Module

Handles:
    - Data cleaning (NaN handling, outlier removal)
    - Feature engineering (combining raw inputs into ML-ready features)
    - Normalization and scaling

Feature Vector (ordered):
    [cgpa, attendance_pct, active_backlogs, dsa_score, python_prof, cpp_prof,
     aiml_knowledge, total_commits, problems_solved, contest_rating,
     project_count, communication_score, internship_exp]
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


# Ordered feature names matching the XGBoost training schema
FEATURE_NAMES = [
    "cgpa",
    "attendance_pct",
    "active_backlogs",
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


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw student data.

    - Fill NaN values with column medians for numerical columns
    - Remove duplicate records
    - Clip outlier values to valid ranges

    Args:
        df: Raw DataFrame with student data

    Returns:
        Cleaned DataFrame
    """
    # TODO: Implement
    # 1. Drop duplicate rows
    # 2. Fill NaN with median
    # 3. Clip CGPA to [0, 10], attendance to [0, 100], etc.
    pass


def build_feature_vector(academic_data: dict, skill_data: dict) -> np.ndarray:
    """
    Construct a single feature vector from a student's data.

    Combines academic records and skill vector into the ordered
    format expected by the XGBoost model.

    Args:
        academic_data: Dict with cgpa, attendance_pct, active_backlogs
        skill_data: Dict with dsa_score, python_prof, cpp_prof, etc.

    Returns:
        1D numpy array of shape (13,) with features in FEATURE_NAMES order
    """
    # TODO: Implement
    # 1. Extract latest academic metrics
    # 2. Combine with skill vector values
    # 3. Return as numpy array in FEATURE_NAMES order
    pass


def normalize_features(features: np.ndarray, scaler: StandardScaler = None) -> tuple:
    """
    Normalize feature vectors using StandardScaler.

    Args:
        features: 2D numpy array of shape (n_samples, n_features)
        scaler: Pre-fitted scaler (None to create and fit a new one)

    Returns:
        Tuple of (normalized_features, fitted_scaler)
    """
    # TODO: Implement
    pass
