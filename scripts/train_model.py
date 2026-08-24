"""
ML Model Training Script

Trains the XGBoost placement predictor and serializes it to disk.
Run this script before starting the Flask application for the first time.

Usage:
    python scripts/train_model.py

Prerequisites:
    - Training dataset in ml_engine/data/sample_dataset.csv
    - requirements.txt dependencies installed
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine.xgboost_model import PlacementPredictor


def train():
    """Train the XGBoost model and save to disk."""
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "ml_engine", "data", "sample_dataset.csv"
    )
    save_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "ml_engine", "saved_models", "xgboost_placement.pkl"
    )

    if not os.path.exists(data_path):
        print(f"Error: Training dataset not found at {data_path}")
        print("Please add the Student Career Success Prediction Dataset first.")
        return

    print(f"Training XGBoost model from: {data_path}")
    predictor = PlacementPredictor()
    predictor.train(data_path, save_path)
    print(f"Model saved to: {save_path}")
    print("Training complete!")


if __name__ == "__main__":
    train()
