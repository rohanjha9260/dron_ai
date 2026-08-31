"""
Data Preprocessing Module

Handles:
    - Data cleaning (NaN handling, outlier clipping, deduplication)
    - Feature engineering (combining raw inputs into standard 13D feature vectors)
    - Normalization and scaling (StandardScaler fit, transform, serialization)

Feature Vector (ordered 13 dimensions):
    [cgpa, attendance_pct, active_backlogs, dsa_score, python_prof, cpp_prof,
     aiml_knowledge, total_commits, problems_solved, contest_rating,
     project_count, communication_score, internship_exp]
"""

import os
import logging
from typing import Dict, Any, Optional, Tuple, Union
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

# Ordered feature names matching the XGBoost and Cosine Recommender training schema
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

# Value bounds for clamping/clipping features
FEATURE_BOUNDS = {
    "cgpa": (0.0, 10.0),
    "attendance_pct": (0.0, 100.0),
    "Attendance_Percentage": (0.0, 100.0),
    "active_backlogs": (0, None),
    "dsa_score": (0.0, 100.0),
    "python_prof": (0.0, 100.0),
    "cpp_prof": (0.0, 100.0),
    "aiml_knowledge": (0.0, 100.0),
    "total_commits": (0, None),
    "problems_solved": (0, None),
    "contest_rating": (0.0, None),
    "project_count": (0, None),
    "Projects_Completed": (0, None),
    "communication_score": (0.0, 100.0),
    "Communication_Skills": (0.0, 10.0),
    "internship_exp": (0, None),
    "Internships": (0, None),
}


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw student data DataFrame.

    - Removes duplicate rows (or duplicate Student_IDs if column exists)
    - Fills NaN values: column medians for numeric columns, column modes for categoricals
    - Clips numeric values to valid domain boundaries

    Args:
        df: Raw DataFrame with student records

    Returns:
        Cleaned pd.DataFrame
    """
    if df is None or df.empty:
        return pd.DataFrame()

    cleaned_df = df.copy()

    # 1. Remove duplicate records
    if "Student_ID" in cleaned_df.columns:
        cleaned_df = cleaned_df.drop_duplicates(subset=["Student_ID"])
    else:
        cleaned_df = cleaned_df.drop_duplicates()

    # 2. Fill missing values (NaN)
    for col in cleaned_df.columns:
        if pd.api.types.is_numeric_dtype(cleaned_df[col]):
            median_val = cleaned_df[col].median()
            if pd.isna(median_val):
                median_val = 0.0
            cleaned_df[col] = cleaned_df[col].fillna(median_val)
        else:
            mode_series = cleaned_df[col].mode(dropna=True)
            mode_val = mode_series.iloc[0] if not mode_series.empty else "Unknown"
            cleaned_df[col] = cleaned_df[col].fillna(mode_val)

    # 3. Clip bounds for known features
    for col, (min_val, max_val) in FEATURE_BOUNDS.items():
        if col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
            cleaned_df[col] = cleaned_df[col].clip(lower=min_val, upper=max_val)

    return cleaned_df


def build_feature_vector(
    academic_data: Optional[Dict[str, Any]] = None,
    skill_data: Optional[Dict[str, Any]] = None,
) -> np.ndarray:
    """
    Construct a single 13-dimensional feature vector from a student's data.

    Combines academic history metrics and skill vector metrics into the
    exact order expected by downstream models.

    Args:
        academic_data: Dict with academic metrics (cgpa, attendance_pct, active_backlogs)
        skill_data: Dict with skill metrics (dsa_score, python_prof, cpp_prof, etc.)

    Returns:
        1D numpy array of shape (13,) and dtype float64 in FEATURE_NAMES order
    """
    merged: Dict[str, Any] = {}
    if skill_data:
        merged.update(skill_data)
    if academic_data:
        merged.update(academic_data)

    vector = []
    for feature_name in FEATURE_NAMES:
        val = merged.get(feature_name, 0.0)
        try:
            val_float = float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            val_float = 0.0

        # Enforce bounds if defined
        if feature_name in FEATURE_BOUNDS:
            min_val, max_val = FEATURE_BOUNDS[feature_name]
            if min_val is not None and val_float < min_val:
                val_float = float(min_val)
            if max_val is not None and val_float > max_val:
                val_float = float(max_val)

        vector.append(val_float)

    return np.array(vector, dtype=np.float64)


def normalize_features(
    features: np.ndarray, scaler: Optional[StandardScaler] = None
) -> Tuple[np.ndarray, StandardScaler]:
    """
    Normalize feature vectors using StandardScaler.

    Args:
        features: 1D array of shape (n_features,) or 2D array of shape (n_samples, n_features)
        scaler: Pre-fitted StandardScaler instance (None to fit a new one)

    Returns:
        Tuple of (normalized_features, fitted_scaler)
    """
    features_arr = np.asarray(features, dtype=np.float64)
    is_1d = features_arr.ndim == 1

    features_2d = np.atleast_2d(features_arr)

    if scaler is None:
        scaler = StandardScaler()
        scaled_2d = scaler.fit_transform(features_2d)
    else:
        scaled_2d = scaler.transform(features_2d)

    if is_1d:
        scaled_features = scaled_2d.ravel()
    else:
        scaled_features = scaled_2d

    return scaled_features, scaler


def save_scaler(scaler: StandardScaler, save_path: str) -> str:
    """
    Serialize a fitted StandardScaler to disk using joblib.

    Args:
        scaler: Fitted StandardScaler instance
        save_path: Destination path (.pkl)

    Returns:
        Path where the scaler was saved
    """
    os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
    joblib.dump(scaler, save_path)
    logger.info(f"Saved StandardScaler to: {save_path}")
    return save_path


def load_scaler(scaler_path: str) -> StandardScaler:
    """
    Deserialize a StandardScaler from disk.

    Args:
        scaler_path: Path to the serialized scaler file (.pkl)

    Returns:
        Loaded StandardScaler instance

    Raises:
        FileNotFoundError: If the file does not exist
    """
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler file not found at: {scaler_path}")
    scaler = joblib.load(scaler_path)
    logger.info(f"Loaded StandardScaler from: {scaler_path}")
    return scaler


def prepare_dataset_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Map raw Kaggle student career dataset columns into the standardized 13D features
    and binary placement status target.

    Args:
        df: Raw or cleaned Kaggle DataFrame

    Returns:
        Tuple of (X DataFrame with 13 features matching FEATURE_NAMES, y Series with binary target)
    """
    cleaned = clean_data(df)

    # 1. Feature mappings from raw Kaggle dataset columns
    mapped_df = pd.DataFrame()

    # CGPA: Convert 4.0 scale to 10.0 scale if needed
    raw_cgpa = cleaned["CGPA"] if "CGPA" in cleaned.columns else cleaned.get("cgpa", 0.0)
    if pd.api.types.is_numeric_dtype(raw_cgpa) and raw_cgpa.max() <= 4.5:
        mapped_df["cgpa"] = (raw_cgpa * 2.5).clip(0.0, 10.0)
    else:
        mapped_df["cgpa"] = raw_cgpa.clip(0.0, 10.0)

    # Attendance
    if "Attendance_Percentage" in cleaned.columns:
        mapped_df["attendance_pct"] = cleaned["Attendance_Percentage"].clip(0.0, 100.0)
    else:
        mapped_df["attendance_pct"] = cleaned.get("attendance_pct", 75.0)

    # Active backlogs
    mapped_df["active_backlogs"] = cleaned.get("active_backlogs", 0)

    # Programming & Problem Solving
    prog_skill = cleaned.get("Programming_Skill", 5.0)  # 1-10 scale
    prob_solve = cleaned.get("Problem_Solving", 5.0)    # 1-10 scale

    # Scale 1-10 to 0-100
    mapped_df["dsa_score"] = (prob_solve * 10.0).clip(0.0, 100.0)
    mapped_df["python_prof"] = (prog_skill * 10.0).clip(0.0, 100.0)
    mapped_df["cpp_prof"] = (prog_skill * 8.0).clip(0.0, 100.0)

    # AIML Knowledge based on Major / Career_Field
    if "Major" in cleaned.columns:
        mapped_df["aiml_knowledge"] = cleaned["Major"].apply(
            lambda m: 85.0 if "Artificial Intelligence" in str(m) or "Data" in str(m) else 45.0
        )
    else:
        mapped_df["aiml_knowledge"] = 50.0

    # Total Commits & GitHub
    if "GitHub_Profile" in cleaned.columns:
        mapped_df["total_commits"] = cleaned["GitHub_Profile"].apply(
            lambda g: 60 if str(g).strip().lower() == "yes" else 10
        )
    else:
        mapped_df["total_commits"] = cleaned.get("total_commits", 30)

    # Problems Solved
    mapped_df["problems_solved"] = (prob_solve * 25.0).astype(int)

    # Contest Rating
    hackathons = cleaned.get("Hackathons", 0.0)
    mapped_df["contest_rating"] = (hackathons * 20.0 + 50.0).clip(0.0, 100.0)

    # Project Count
    mapped_df["project_count"] = cleaned.get("Projects_Completed", cleaned.get("project_count", 2))

    # Communication Score (1-10 scale to 0-100)
    comm_skill = cleaned.get("Communication_Skills", 5.0)
    mapped_df["communication_score"] = (comm_skill * 10.0).clip(0.0, 100.0)

    # Internship Experience
    mapped_df["internship_exp"] = cleaned.get("Internships", cleaned.get("internship_exp", 0))

    # Ensure all 13 columns are in exact FEATURE_NAMES order
    X = mapped_df[FEATURE_NAMES].astype(np.float64)

    # Binary Target (Placed = 1, Not Placed = 0)
    if "Placement_Status" in cleaned.columns:
        y = (cleaned["Placement_Status"].astype(str).str.strip().str.lower() == "placed").astype(int)
    else:
        y = pd.Series(np.zeros(len(cleaned), dtype=int))

    return X, y
