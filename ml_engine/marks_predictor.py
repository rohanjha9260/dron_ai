"""
Marks Predictor Module

Uses RandomForestRegressor to predict a student's CGPA based on academic engagement metrics.
"""

import os
import hashlib
import logging
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

from ml_engine.preprocessing import clean_data

logger = logging.getLogger(__name__)

# Features we'll extract from the raw dataset to predict CGPA
MARKS_FEATURES = [
    "Attendance_Percentage",
    "Study_Hours_Per_Week",
    "Projects_Completed",
]


def _compute_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


class ChecksumNotFoundError(FileNotFoundError, ValueError):
    """Raised when the SHA-256 checksum sidecar is absent."""
    pass


class MarksPredictor:
    """
    RandomForest-based CGPA predictor.
    """

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: Optional[int] = 10,
        random_state: int = 42,
    ):
        self.model: Optional[RandomForestRegressor] = None
        self.is_trained: bool = False
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state

    def train(self, data_path: str, save_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Train the model on the Kaggle dataset.
        """
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training dataset not found at: {data_path}")

        logger.info(f"Loading and preprocessing data for MarksPredictor from: {data_path}")
        raw_df = pd.read_csv(data_path)
        cleaned_df = clean_data(raw_df)

        if "CGPA" not in cleaned_df.columns:
            raise ValueError("Target column 'CGPA' not found in dataset.")

        cleaned_df["CGPA"] = pd.to_numeric(cleaned_df["CGPA"], errors="coerce")
        valid_df = cleaned_df.dropna(subset=["CGPA"])
        if len(valid_df) < 10:
            raise ValueError("Insufficient valid CGPA target rows remaining after filtering.")

        # Prepare X and y
        X_df = valid_df[MARKS_FEATURES].copy()
        
        # Fill missing numeric values just in case
        for col in MARKS_FEATURES:
            if col not in X_df.columns:
                X_df[col] = 0.0
            X_df[col] = pd.to_numeric(X_df[col], errors="coerce").fillna(0.0)

        y_series = valid_df["CGPA"]

        X = X_df.to_numpy(dtype=np.float64)
        y = y_series.to_numpy(dtype=np.float64)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=self.random_state
        )

        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            random_state=self.random_state,
        )

        logger.info("Training MarksPredictor (RandomForestRegressor)...")
        self.model.fit(X_train, y_train)
        self.is_trained = True

        y_pred = self.model.predict(X_test)
        mse = float(mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        logger.info(f"MarksPredictor Evaluation -> MSE: {mse:.4f}, R2: {r2:.4f}")

        if save_path:
            self.save(save_path)

        return {
            "mse": mse,
            "r2_score": r2,
        }

    def predict(
        self,
        features: np.ndarray,
        scaler: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Predict CGPA for a single student.

        Args:
            features: 1D array of shape (3,) or 2D array of shape (1, 3) matching MARKS_FEATURES
            scaler: Optional scaler (ignored by RandomForest, kept for API consistency)
        """
        if self.model is None:
            raise RuntimeError("MarksPredictor model is not loaded or trained.")

        feat_arr = np.asarray(features, dtype=np.float64)
        if feat_arr.ndim == 1:
            if feat_arr.shape[0] != len(MARKS_FEATURES):
                raise ValueError(f"Expected feature array with {len(MARKS_FEATURES)} elements, got {feat_arr.shape[0]}")
            feat_arr = feat_arr.reshape(1, -1)
        elif feat_arr.ndim == 2:
            if feat_arr.shape[0] != 1:
                raise ValueError(
                    f"predict() expects a single feature vector (1 row), got shape {feat_arr.shape}."
                )
            if feat_arr.shape[1] != len(MARKS_FEATURES):
                raise ValueError(f"Expected feature matrix with {len(MARKS_FEATURES)} columns, got {feat_arr.shape[1]}")
        else:
            raise ValueError(f"Invalid feature array dimensions: {feat_arr.ndim}")
        
        # Handle NaN/Inf gracefully
        feat_arr = np.nan_to_num(feat_arr, nan=0.0, posinf=0.0, neginf=0.0)
        
        predicted_cgpa = float(self.model.predict(feat_arr)[0])
        # Bound it between 0.0 and 10.0
        predicted_cgpa = max(0.0, min(10.0, predicted_cgpa))

        return {
            "predicted_cgpa": round(predicted_cgpa, 2)
        }

    def save(self, model_path: str) -> str:
        """
        Save the trained model to disk with SHA-256 checksum sidecar.
        """
        if self.model is None:
            raise RuntimeError("Cannot save an uninitialized model.")

        abs_path = os.path.abspath(model_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        
        payload = {
            "model": self.model,
            "feature_names": MARKS_FEATURES,
        }
        joblib.dump(payload, abs_path)

        sha256_hash = _compute_sha256(abs_path)
        with open(f"{abs_path}.sha256", "w", encoding="utf-8") as f:
            f.write(sha256_hash)

        logger.info(f"Saved MarksPredictor model to: {abs_path} (SHA-256: {sha256_hash})")
        return abs_path

    def load(
        self,
        model_path: str,
        allowed_dir: Optional[str] = None,
        expected_hash: Optional[str] = None,
    ) -> None:
        """
        Load a pre-trained model from disk with integrity checks.
        """
        resolved_path = os.path.realpath(os.path.abspath(model_path))

        if allowed_dir is not None:
            resolved_allowed = os.path.realpath(os.path.abspath(allowed_dir))
            if not (resolved_path == resolved_allowed or resolved_path.startswith(resolved_allowed + os.sep)):
                raise ValueError(f"Security error: path {model_path} is outside allowed directory")

        if not os.path.exists(resolved_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        computed_hash = _compute_sha256(resolved_path)
        if expected_hash is not None:
            if computed_hash.lower() != expected_hash.lower():
                raise ValueError("Integrity check failed.")
        else:
            checksum_path = f"{resolved_path}.sha256"
            if not os.path.exists(checksum_path):
                raise ChecksumNotFoundError("Integrity check failed: missing checksum sidecar file.")
            with open(checksum_path, "r", encoding="utf-8") as f:
                recorded_hash = f.read().strip()
            if not recorded_hash or computed_hash.lower() != recorded_hash.lower():
                raise ValueError("Integrity check failed: recorded hash != computed hash.")

        loaded_obj = joblib.load(resolved_path)
        if isinstance(loaded_obj, dict):
            model = loaded_obj.get("model")
            feature_names = loaded_obj.get("feature_names")
            if not isinstance(model, RandomForestRegressor):
                raise TypeError("Payload does not contain a valid RandomForestRegressor.")
            if feature_names != MARKS_FEATURES:
                raise ValueError(f"Payload feature metadata mismatch. Expected {MARKS_FEATURES}, got {feature_names}")
            self.model = model
        elif isinstance(loaded_obj, RandomForestRegressor):
            raise ValueError("Raw legacy RandomForestRegressor objects without feature metadata are rejected.")
        else:
            raise TypeError("Loaded artifact is not a valid model payload.")

        self.is_trained = True
        logger.info(f"Loaded MarksPredictor from: {resolved_path}")
