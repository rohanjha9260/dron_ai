"""
ML Model Training Script

Trains the XGBoost placement predictor and fitted StandardScaler,
then serializes both to disk for runtime inference.

Usage:
    python scripts/train_model.py
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine.xgboost_model import PlacementPredictor


def train():
    """Train the XGBoost model and save to disk."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Primary dataset path with fallback
    dataset_candidates = [
        os.path.join(base_dir, "ml_engine", "data", "student_career_success_dataset.csv"),
        os.path.join(base_dir, "ml_engine", "data", "sample_dataset.csv"),
    ]
    
    data_path = None
    for candidate in dataset_candidates:
        if os.path.exists(candidate):
            data_path = candidate
            break

    if not data_path:
        print("Error: Training dataset not found. Looked in:")
        for candidate in dataset_candidates:
            print(f"  - {candidate}")
        return

    save_path = os.path.join(base_dir, "ml_engine", "saved_models", "xgboost_placement.pkl")
    scaler_save_path = os.path.join(base_dir, "ml_engine", "saved_models", "scaler.pkl")

    print("==================================================")
    print(">> Starting XGBoost Placement Predictor Training")
    print(f"-> Dataset: {data_path}")
    print(f"-> Model Output: {save_path}")
    print(f"-> Scaler Output: {scaler_save_path}")
    print("==================================================")

    predictor = PlacementPredictor(
        max_depth=5,
        learning_rate=0.05,
        n_estimators=150,
        eval_metric="logloss",
        random_state=42,
    )

    metrics = predictor.train(
        data_path=data_path,
        save_path=save_path,
        scaler_save_path=scaler_save_path,
    )

    print("\n[OK] Training and Evaluation Complete!")
    print("--------------------------------------------------")
    print(f"Test Accuracy : {metrics['accuracy'] * 100:.2f}%")
    print(f"ROC-AUC Score : {metrics['roc_auc']:.4f}")
    print(f"F1-Score      : {metrics['f1_score']:.4f}")
    print(f"Confusion Matrix:\n{metrics['confusion_matrix']}")
    print("--------------------------------------------------")
    print("Top 5 Most Influential Features:")
    for i, (feature, importance) in enumerate(list(metrics['feature_importance'].items())[:5], start=1):
        print(f"  {i}. {feature:<20}: {importance * 100:.2f}%")
    print("==================================================")


if __name__ == "__main__":
    train()
