"""
XGBoost Placement Readiness Model

Uses gradient boosted decision trees to predict:
    1. Placement probability (0.0 to 1.0)
    2. Student readiness classification (Placed / Not Placed)
    3. Feature importance explainability

Training Dataset: Student Career Success Prediction Dataset
Algorithm: XGBClassifier (binary classification: placed / not placed)
"""

import os
import time
import hashlib
import logging
from typing import Dict, Any, Optional, Tuple, List, Union
import numpy as np
import pandas as pd
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from sklearn.preprocessing import StandardScaler

from ml_engine.preprocessing import (
    FEATURE_NAMES,
    clean_data,
    prepare_dataset_features,
    normalize_features,
    save_scaler,
    load_scaler,
)

logger = logging.getLogger(__name__)


def _compute_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


class PlacementPredictor:
    """
    XGBoost-based placement readiness predictor.

    The model is trained once and serialized to disk. At runtime,
    it is loaded into memory as a singleton via model_loader.py.
    """

    def __init__(
        self,
        max_depth: int = 5,
        learning_rate: float = 0.05,
        n_estimators: int = 150,
        eval_metric: str = "logloss",
        random_state: int = 42,
    ):
        self.model: Optional[XGBClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.is_trained: bool = False
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.n_estimators = n_estimators
        self.eval_metric = eval_metric
        self.random_state = random_state

    def train(
        self,
        data_path: str,
        save_path: Optional[str] = None,
        scaler_save_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Train the XGBoost model on the student dataset.

        Args:
            data_path: Path to the training CSV file
            save_path: Path to save the serialized model (.pkl)
            scaler_save_path: Path to save the fitted StandardScaler (.pkl)

        Returns:
            Dictionary containing evaluation metrics (accuracy, roc_auc, f1, confusion_matrix)
        """
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training dataset not found at: {data_path}")

        logger.info(f"Loading and preprocessing training data from: {data_path}")
        raw_df = pd.read_csv(data_path)
        X_df, y_series = prepare_dataset_features(raw_df)

        X = X_df.to_numpy(dtype=np.float64)
        y = y_series.to_numpy(dtype=int)

        # 1. Fit StandardScaler on features
        X_scaled, self.scaler = normalize_features(X)

        # 2. 80/20 Stratified train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled,
            y,
            test_size=0.20,
            stratify=y,
            random_state=self.random_state,
        )

        # 3. Instantiate and train XGBClassifier with regularization
        self.model = XGBClassifier(
            max_depth=self.max_depth,
            learning_rate=self.learning_rate,
            n_estimators=self.n_estimators,
            eval_metric=self.eval_metric,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=self.random_state,
        )

        logger.info("Training XGBClassifier...")
        self.model.fit(X_train, y_train)
        self.is_trained = True

        # 4. Evaluate on test set
        y_pred = self.model.predict(X_test)
        y_proba = self.model.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        roc_auc = float(roc_auc_score(y_test, y_proba))
        f1 = float(f1_score(y_test, y_pred))
        cm = confusion_matrix(y_test, y_pred).tolist()
        report = classification_report(y_test, y_pred, output_dict=True)

        logger.info(f"Model Evaluation -> Accuracy: {acc:.4f}, ROC-AUC: {roc_auc:.4f}, F1-Score: {f1:.4f}")

        # 5. Extract Feature Importances
        importances = self.model.feature_importances_
        feature_importance_dict = {
            name: float(imp) for name, imp in zip(FEATURE_NAMES, importances)
        }
        sorted_importance = dict(
            sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True)
        )

        # 6. Save model and scaler if paths provided
        if save_path:
            self.save(save_path)

        if scaler_save_path and self.scaler is not None:
            save_scaler(self.scaler, scaler_save_path)

        return {
            "accuracy": acc,
            "roc_auc": roc_auc,
            "f1_score": f1,
            "confusion_matrix": cm,
            "classification_report": report,
            "feature_importance": sorted_importance,
        }

    def predict(
        self,
        features: np.ndarray,
        scaler: Optional[StandardScaler] = None,
    ) -> Dict[str, Any]:
        """
        Run inference on a student's feature vector.

        Args:
            features: 1D numpy array of shape (13,) or 2D array of shape (1, 13) matching FEATURE_NAMES
            scaler: Optional StandardScaler instance to normalize features before prediction

        Returns:
            Dict containing:
                - placement_probability: float in [0.0, 1.0]
                - is_placed: bool
                - feature_importance: dict mapping feature names to relative importances
                - top_factors: list of top contributing features

        Raises:
            RuntimeError: If model is not loaded or trained
            ValueError: If features shape is invalid
        """
        if self.model is None:
            raise RuntimeError("Placement model is not loaded or trained. Call train() or load() first.")

        feat_arr = np.asarray(features, dtype=np.float64)
        if feat_arr.ndim == 1:
            if feat_arr.shape[0] != len(FEATURE_NAMES):
                raise ValueError(f"Expected feature array with {len(FEATURE_NAMES)} elements, got {feat_arr.shape[0]}")
            feat_arr = feat_arr.reshape(1, -1)
        elif feat_arr.ndim == 2:
            if feat_arr.shape[1] != len(FEATURE_NAMES):
                raise ValueError(f"Expected feature matrix with {len(FEATURE_NAMES)} columns, got {feat_arr.shape[1]}")
        else:
            raise ValueError(f"Invalid feature array dimensions: {feat_arr.ndim}")

        # Apply scaling if scaler provided or available on instance
        active_scaler = scaler if scaler is not None else self.scaler
        if active_scaler is not None:
            feat_arr = active_scaler.transform(feat_arr)

        # Compute prediction and probability
        proba = float(self.model.predict_proba(feat_arr)[0, 1])
        is_placed = bool(proba >= 0.5)

        # Feature importances breakdown
        importances = getattr(self.model, "feature_importances_", None)
        if importances is not None:
            feature_imp = {
                name: float(imp) for name, imp in zip(FEATURE_NAMES, importances)
            }
            sorted_imp = dict(
                sorted(feature_imp.items(), key=lambda item: item[1], reverse=True)
            )
            top_factors = list(sorted_imp.keys())[:3]
        else:
            sorted_imp = {}
            top_factors = []

        return {
            "placement_probability": round(proba, 4),
            "is_placed": is_placed,
            "feature_importance": sorted_imp,
            "top_factors": top_factors,
        }

    def save(self, model_path: str) -> str:
        """
        Save the trained model and associated scaler to disk with SHA-256 checksum sidecar.

        Args:
            model_path: Destination path (.pkl)

        Returns:
            Absolute path to saved model file
        """
        if self.model is None:
            raise RuntimeError("Cannot save an uninitialized model. Train or load a model first.")

        abs_path = os.path.abspath(model_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        
        payload = {
            "model": self.model,
            "scaler": self.scaler,
            "feature_names": FEATURE_NAMES,
        }
        joblib.dump(payload, abs_path)

        # Sidecar hash for integrity
        sha256_hash = _compute_sha256(abs_path)
        with open(f"{abs_path}.sha256", "w", encoding="utf-8") as f:
            f.write(sha256_hash)

        logger.info(f"Saved XGBoost model to: {abs_path} (SHA-256: {sha256_hash})")
        return abs_path

    def load(
        self,
        model_path: str,
        allowed_dir: Optional[str] = None,
        expected_hash: Optional[str] = None,
    ) -> None:
        """
        Load a pre-trained model from disk with integrity checks.

        Args:
            model_path: Path to serialized model file (.pkl)
            allowed_dir: Optional directory to validate path containment
            expected_hash: Optional expected SHA-256 checksum string

        Raises:
            FileNotFoundError: If model file does not exist
            ValueError: If integrity check or path validation fails
            TypeError: If deserialized object is not an XGBClassifier or valid payload
        """
        resolved_path = os.path.realpath(os.path.abspath(model_path))

        if allowed_dir is not None:
            resolved_allowed = os.path.realpath(os.path.abspath(allowed_dir))
            if not (resolved_path == resolved_allowed or resolved_path.startswith(resolved_allowed + os.sep)):
                raise ValueError(f"Security error: path {model_path} is outside allowed directory {allowed_dir}")

        if not os.path.exists(resolved_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        computed_hash = _compute_sha256(resolved_path)
        if expected_hash is not None:
            if computed_hash.lower() != expected_hash.lower():
                raise ValueError(
                    f"Integrity check failed for {model_path}: expected {expected_hash}, got {computed_hash}"
                )
        else:
            checksum_path = f"{resolved_path}.sha256"
            if os.path.exists(checksum_path):
                with open(checksum_path, "r", encoding="utf-8") as f:
                    recorded_hash = f.read().strip()
                if recorded_hash and computed_hash.lower() != recorded_hash.lower():
                    raise ValueError(
                        f"Integrity check failed for {model_path}: recorded hash {recorded_hash} != {computed_hash}"
                    )

        loaded_obj = joblib.load(resolved_path)
        if isinstance(loaded_obj, dict):
            model = loaded_obj.get("model")
            scaler = loaded_obj.get("scaler")
            if not isinstance(model, XGBClassifier):
                raise TypeError(f"Payload does not contain a valid XGBClassifier: {type(model)}")
            self.model = model
            self.scaler = scaler
        elif isinstance(loaded_obj, XGBClassifier):
            self.model = loaded_obj
        else:
            raise TypeError(f"Loaded artifact is not a valid XGBClassifier or payload: {type(loaded_obj)}")

        self.is_trained = True
        logger.info(f"Loaded XGBoost model from: {resolved_path}")
