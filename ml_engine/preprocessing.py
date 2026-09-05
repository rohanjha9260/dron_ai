"""
Data Preprocessing Module

Handles:
    - Data cleaning (NaN handling, outlier clipping, deduplication)
    - Feature engineering (combining raw inputs into standard 13D feature vectors)
    - Normalization and scaling (StandardScaler fit, transform, serialization, integrity checks)

Feature Vector (ordered 13 dimensions):
    [cgpa, attendance_pct, active_backlogs, dsa_score, python_prof, cpp_prof,
     aiml_knowledge, total_commits, problems_solved, contest_rating,
     project_count, communication_score, internship_exp]
"""

import os
import math
import hashlib
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


def _compute_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


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
    if df is None:
        return pd.DataFrame()
    if df.empty:
        return df.copy()

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

        # Replace non-finite values (NaN, Inf, -Inf) with 0.0
        if not math.isfinite(val_float):
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
    Serialize a fitted StandardScaler to disk with SHA-256 integrity metadata.

    Args:
        scaler: Fitted StandardScaler instance
        save_path: Destination path (.pkl)

    Returns:
        Path where the scaler was saved
    """
    abs_path = os.path.abspath(save_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    joblib.dump(scaler, abs_path)

    # Generate integrity checksum sidecar
    sha256_hash = _compute_sha256(abs_path)
    checksum_path = f"{abs_path}.sha256"
    with open(checksum_path, "w", encoding="utf-8") as f:
        f.write(sha256_hash)

    logger.info(f"Saved StandardScaler to: {abs_path} (SHA-256: {sha256_hash})")
    return abs_path


def load_scaler(
    scaler_path: str,
    allowed_dir: Optional[str] = None,
    expected_hash: Optional[str] = None,
) -> StandardScaler:
    """
    Deserialize an integrity-checked StandardScaler from disk.

    Validates path containment within allowed directories and checks
    SHA-256 checksum against sidecar or expected hash before unpickling.

    Args:
        scaler_path: Path to the serialized scaler file (.pkl)
        allowed_dir: Optional directory to validate path containment against
        expected_hash: Optional expected SHA-256 hash string for verification

    Returns:
        Loaded StandardScaler instance

    Raises:
        FileNotFoundError: If the scaler file or sidecar does not exist
        ValueError: If path containment or integrity check fails
        TypeError: If deserialized object is not a StandardScaler
    """
    resolved_path = os.path.realpath(os.path.abspath(scaler_path))

    if allowed_dir is not None:
        resolved_allowed = os.path.realpath(os.path.abspath(allowed_dir))
        if not (resolved_path == resolved_allowed or resolved_path.startswith(resolved_allowed + os.sep)):
            raise ValueError(f"Security error: path {scaler_path} is outside allowed directory {allowed_dir}")

    if not os.path.exists(resolved_path):
        raise FileNotFoundError(f"Scaler file not found at: {scaler_path}")

    # Integrity verification (fail closed if neither expected_hash nor sidecar is available)
    computed_hash = _compute_sha256(resolved_path)
    if expected_hash is not None:
        if computed_hash.lower() != expected_hash.lower():
            raise ValueError(
                f"Integrity check failed for {scaler_path}: expected {expected_hash}, got {computed_hash}"
            )
    else:
        checksum_path = f"{resolved_path}.sha256"
        if not os.path.exists(checksum_path):
            raise FileNotFoundError(
                f"Integrity check failed: missing checksum sidecar file {checksum_path} for {scaler_path}"
            )
        with open(checksum_path, "r", encoding="utf-8") as f:
            recorded_hash = f.read().strip()
        if not recorded_hash or computed_hash.lower() != recorded_hash.lower():
            raise ValueError(
                f"Integrity check failed for {scaler_path}: recorded hash {recorded_hash} != {computed_hash}"
            )

    scaler = joblib.load(resolved_path)
    if not isinstance(scaler, StandardScaler):
        raise TypeError(f"Loaded artifact is not a valid StandardScaler instance: {type(scaler)}")

    logger.info(f"Loaded StandardScaler from: {scaler_path}")
    return scaler


def _get_column_series(
    df: pd.DataFrame,
    primary_col: str,
    alt_col: Optional[str] = None,
    default_val: float = 0.0,
) -> pd.Series:
    """Helper to return a column as a pandas Series indexed by df.index with zero/default fallback."""
    if primary_col in df.columns:
        return df[primary_col]
    if alt_col and alt_col in df.columns:
        return df[alt_col]
    return pd.Series(default_val, index=df.index, dtype=np.float64)


def prepare_dataset_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Map raw Kaggle student career dataset columns into the standardized 13D features
    and binary placement status target.

    Ensures missing columns produce zero-valued pandas Series indexed by df.index,
    preserving full Series operations on partial and empty DataFrames.

    Args:
        df: Raw or cleaned Kaggle DataFrame

    Returns:
        Tuple of (X DataFrame with 13 features matching FEATURE_NAMES, y Series with binary target)
    """
    cleaned = clean_data(df)

    if cleaned.empty:
        X = pd.DataFrame(columns=FEATURE_NAMES, dtype=np.float64)
        y = pd.Series(dtype=int)
        return X, y

    # 1. Feature mappings from raw Kaggle dataset columns
    mapped_df = pd.DataFrame(index=cleaned.index)

    # CGPA: Convert 4.0 scale to 10.0 scale if needed
    raw_cgpa = _get_column_series(cleaned, "CGPA", "cgpa", default_val=0.0)
    cgpa_numeric = pd.to_numeric(raw_cgpa, errors="coerce").fillna(0.0)
    if (not cgpa_numeric.empty) and (cgpa_numeric.max() <= 4.5):
        mapped_df["cgpa"] = (cgpa_numeric * 2.5).clip(0.0, 10.0)
    else:
        mapped_df["cgpa"] = cgpa_numeric.clip(0.0, 10.0)

    # Attendance
    raw_att = _get_column_series(cleaned, "Attendance_Percentage", "attendance_pct", default_val=75.0)
    mapped_df["attendance_pct"] = pd.to_numeric(raw_att, errors="coerce").fillna(75.0).clip(0.0, 100.0)

    # Active backlogs
    raw_backlogs = _get_column_series(cleaned, "active_backlogs", default_val=0.0)
    mapped_df["active_backlogs"] = pd.to_numeric(raw_backlogs, errors="coerce").fillna(0.0).clip(lower=0.0)

    # Programming & Problem Solving
    prog_skill = _get_column_series(cleaned, "Programming_Skill", "python_prof", default_val=5.0)
    prob_solve = _get_column_series(cleaned, "Problem_Solving", "dsa_score", default_val=5.0)

    prog_num = pd.to_numeric(prog_skill, errors="coerce").fillna(5.0)
    prob_num = pd.to_numeric(prob_solve, errors="coerce").fillna(5.0)

    if "Programming_Skill" in cleaned.columns:
        mapped_df["python_prof"] = (prog_num * 10.0).clip(0.0, 100.0)
        mapped_df["cpp_prof"] = (prog_num * 8.0).clip(0.0, 100.0)
    else:
        mapped_df["python_prof"] = prog_num.clip(0.0, 100.0)
        cpp_raw = _get_column_series(cleaned, "cpp_prof", default_val=0.0)
        mapped_df["cpp_prof"] = pd.to_numeric(cpp_raw, errors="coerce").fillna(0.0).clip(0.0, 100.0)

    if "Problem_Solving" in cleaned.columns:
        mapped_df["dsa_score"] = (prob_num * 10.0).clip(0.0, 100.0)
        mapped_df["problems_solved"] = (prob_num * 35.0).clip(lower=0.0)
    else:
        mapped_df["dsa_score"] = prob_num.clip(0.0, 100.0)
        solved_raw = _get_column_series(cleaned, "problems_solved", default_val=0.0)
        mapped_df["problems_solved"] = pd.to_numeric(solved_raw, errors="coerce").fillna(0.0).clip(lower=0.0)

    # AIML Knowledge based on Major / Career_Field
    if "Major" in cleaned.columns:
        mapped_df["aiml_knowledge"] = cleaned["Major"].apply(
            lambda m: 85.0 if ("Artificial Intelligence" in str(m) or "Data" in str(m)) else 45.0
        )
    elif "aiml_knowledge" in cleaned.columns:
        mapped_df["aiml_knowledge"] = pd.to_numeric(cleaned["aiml_knowledge"], errors="coerce").fillna(50.0).clip(0.0, 100.0)
    else:
        mapped_df["aiml_knowledge"] = pd.Series(50.0, index=cleaned.index, dtype=np.float64)

    # Total Commits & GitHub
    if "GitHub_Profile" in cleaned.columns:
        mapped_df["total_commits"] = cleaned["GitHub_Profile"].apply(
            lambda g: 80.0 if str(g).strip().lower() == "yes" else 15.0
        )
    elif "total_commits" in cleaned.columns:
        mapped_df["total_commits"] = pd.to_numeric(cleaned["total_commits"], errors="coerce").fillna(30.0).clip(lower=0.0)
    else:
        mapped_df["total_commits"] = pd.Series(30.0, index=cleaned.index, dtype=np.float64)

    # Contest Rating (scale aligned with runtime ratings e.g. 1000-1900 or 0-None)
    if "Hackathons" in cleaned.columns:
        hackathons = pd.to_numeric(cleaned["Hackathons"], errors="coerce").fillna(0.0)
        mapped_df["contest_rating"] = (hackathons * 150.0 + 1000.0).clip(lower=0.0)
    elif "contest_rating" in cleaned.columns:
        mapped_df["contest_rating"] = pd.to_numeric(cleaned["contest_rating"], errors="coerce").fillna(1200.0).clip(lower=0.0)
    else:
        mapped_df["contest_rating"] = pd.Series(1200.0, index=cleaned.index, dtype=np.float64)

    # Project Count
    raw_proj = _get_column_series(cleaned, "Projects_Completed", "project_count", default_val=2.0)
    mapped_df["project_count"] = pd.to_numeric(raw_proj, errors="coerce").fillna(2.0).clip(lower=0.0)

    # Communication Score
    if "Communication_Skills" in cleaned.columns:
        comm_skill = pd.to_numeric(cleaned["Communication_Skills"], errors="coerce").fillna(5.0)
        mapped_df["communication_score"] = (comm_skill * 10.0).clip(0.0, 100.0)
    elif "communication_score" in cleaned.columns:
        mapped_df["communication_score"] = pd.to_numeric(cleaned["communication_score"], errors="coerce").fillna(50.0).clip(0.0, 100.0)
    else:
        mapped_df["communication_score"] = pd.Series(50.0, index=cleaned.index, dtype=np.float64)

    # Internship Experience
    raw_intern = _get_column_series(cleaned, "Internships", "internship_exp", default_val=0.0)
    mapped_df["internship_exp"] = pd.to_numeric(raw_intern, errors="coerce").fillna(0.0).clip(lower=0.0)

    # Apply FEATURE_BOUNDS to all columns for consistency with runtime build_feature_vector
    for col in FEATURE_NAMES:
        if col in FEATURE_BOUNDS:
            min_val, max_val = FEATURE_BOUNDS[col]
            mapped_df[col] = mapped_df[col].clip(lower=min_val, upper=max_val)

    # Ensure all 13 columns are in exact FEATURE_NAMES order
    X = mapped_df[FEATURE_NAMES].astype(np.float64)

    # Binary Target (Placed = 1, Not Placed = 0)
    if "Placement_Status" in cleaned.columns:
        y = (cleaned["Placement_Status"].astype(str).str.strip().str.lower() == "placed").astype(int)
    else:
        y = pd.Series(0, index=cleaned.index, dtype=int)

    return X, y
