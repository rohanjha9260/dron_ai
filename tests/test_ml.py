"""
ML Model Tests

Tests for the Machine Learning engine:
    - XGBoost model training and inference
    - Cosine Similarity career matching
    - Skill-gap analysis
    - Roadmap generation
    - Data preprocessing
"""

import pytest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestPreprocessing:
    """Tests for data preprocessing module."""

    def test_build_feature_vector(self):
        """Test feature vector construction from academic + skill data."""
        from ml_engine.preprocessing import build_feature_vector

        academic_data = {
            "cgpa": 8.5,
            "attendance_pct": 92.0,
            "active_backlogs": 0,
        }
        skill_data = {
            "dsa_score": 85.0,
            "python_prof": 90.0,
            "cpp_prof": 75.0,
            "aiml_knowledge": 80.0,
            "total_commits": 120,
            "problems_solved": 350,
            "contest_rating": 1650.0,
            "project_count": 5,
            "communication_score": 88.0,
            "internship_exp": 6,
        }

        vector = build_feature_vector(academic_data, skill_data)

        assert isinstance(vector, np.ndarray)
        assert vector.shape == (13,)
        assert vector.dtype == np.float64
        assert vector[0] == 8.5   # cgpa
        assert vector[1] == 92.0  # attendance_pct
        assert vector[2] == 0.0   # active_backlogs
        assert vector[3] == 85.0  # dsa_score
        assert vector[4] == 90.0  # python_prof
        assert vector[12] == 6.0  # internship_exp

    def test_build_feature_vector_with_missing_and_defaults(self):
        """Test that missing keys in input dictionaries default to 0.0."""
        from ml_engine.preprocessing import build_feature_vector

        academic_data = {"cgpa": 7.8}
        skill_data = {}

        vector = build_feature_vector(academic_data, skill_data)
        assert vector.shape == (13,)
        assert vector[0] == 7.8
        assert np.all(vector[1:] == 0.0)

    def test_clean_data_handles_nan_and_duplicates(self):
        """Test that NaN values are properly filled and duplicates are dropped."""
        import pandas as pd
        from ml_engine.preprocessing import clean_data

        raw_data = {
            "Student_ID": ["ST001", "ST002", "ST002", "ST003"],
            "cgpa": [8.5, np.nan, 7.0, 9.0],
            "attendance_pct": [90.0, 80.0, 80.0, np.nan],
            "Major": ["Computer Science", np.nan, "Information Technology", "Computer Science"],
        }
        df = pd.DataFrame(raw_data)
        cleaned = clean_data(df)

        assert len(cleaned) == 3
        assert not cleaned.isna().any().any()
        assert cleaned["cgpa"].isna().sum() == 0
        assert cleaned["attendance_pct"].isna().sum() == 0
        assert cleaned["Major"].isna().sum() == 0

    def test_clean_data_boundary_clipping(self):
        """Test that outliers beyond valid domain ranges are clipped."""
        import pandas as pd
        from ml_engine.preprocessing import clean_data

        raw_data = {
            "Student_ID": ["ST001", "ST002"],
            "cgpa": [12.5, -2.0],
            "attendance_pct": [120.0, -10.0],
            "dsa_score": [150.0, -5.0],
        }
        df = pd.DataFrame(raw_data)
        cleaned = clean_data(df)

        assert cleaned["cgpa"].iloc[0] == 10.0
        assert cleaned["cgpa"].iloc[1] == 0.0
        assert cleaned["attendance_pct"].iloc[0] == 100.0
        assert cleaned["attendance_pct"].iloc[1] == 0.0
        assert cleaned["dsa_score"].iloc[0] == 100.0
        assert cleaned["dsa_score"].iloc[1] == 0.0

    def test_normalize_features(self):
        """Test feature normalization with StandardScaler."""
        from ml_engine.preprocessing import normalize_features
        from sklearn.preprocessing import StandardScaler

        features = np.array([
            [8.0, 90.0, 0, 80, 80, 70, 60, 100, 200, 1500, 4, 80, 3],
            [6.0, 70.0, 2, 50, 60, 40, 30, 20, 50, 1200, 1, 60, 0],
            [9.5, 95.0, 0, 95, 95, 90, 90, 250, 500, 1800, 8, 90, 12],
        ], dtype=np.float64)

        scaled, scaler = normalize_features(features)
        assert isinstance(scaler, StandardScaler)
        assert scaled.shape == (3, 13)
        np.testing.assert_almost_equal(scaled.mean(axis=0), np.zeros(13), decimal=5)

        single_vec = np.array([8.0, 90.0, 0, 80, 80, 70, 60, 100, 200, 1500, 4, 80, 3], dtype=np.float64)
        single_scaled, _ = normalize_features(single_vec, scaler=scaler)
        assert single_scaled.shape == (13,)
        np.testing.assert_almost_equal(single_scaled, scaled[0], decimal=5)

    def test_scaler_save_and_load(self, tmp_path):
        """Test saving and loading the StandardScaler."""
        from ml_engine.preprocessing import normalize_features, save_scaler, load_scaler

        features = np.random.rand(10, 13)
        _, scaler = normalize_features(features)

        save_path = str(tmp_path / "test_scaler.pkl")
        save_scaler(scaler, save_path)

        assert os.path.exists(save_path)

        loaded_scaler = load_scaler(save_path)
        assert loaded_scaler is not None

        test_sample = np.random.rand(1, 13)
        np.testing.assert_array_equal(
            scaler.transform(test_sample),
            loaded_scaler.transform(test_sample)
        )

    def test_build_feature_vector_non_finite_values(self):
        """Test that NaN, Inf, and -Inf values are safely replaced with 0.0."""
        import math
        from ml_engine.preprocessing import build_feature_vector

        academic_data = {
            "cgpa": float("nan"),
            "attendance_pct": float("inf"),
            "active_backlogs": -float("inf"),
        }
        skill_data = {
            "dsa_score": np.nan,
            "python_prof": "invalid_string",
            "cpp_prof": None,
        }

        vector = build_feature_vector(academic_data, skill_data)
        assert vector.shape == (13,)
        assert not np.isnan(vector).any()
        assert np.all(np.isfinite(vector))
        assert vector[0] == 0.0  # cgpa from nan
        assert vector[1] == 0.0  # attendance_pct from inf
        assert vector[2] == 0.0  # active_backlogs from -inf
        assert vector[3] == 0.0  # dsa_score from np.nan
        assert vector[4] == 0.0  # python_prof from invalid string
        assert vector[5] == 0.0  # cpp_prof from None

    def test_scaler_integrity_and_security(self, tmp_path):
        """Test security validation and tamper detection in load_scaler."""
        from ml_engine.preprocessing import normalize_features, save_scaler, load_scaler

        features = np.random.rand(10, 13)
        _, scaler = normalize_features(features)

        allowed_dir = str(tmp_path / "models")
        os.makedirs(allowed_dir, exist_ok=True)
        save_path = os.path.join(allowed_dir, "scaler.pkl")
        save_scaler(scaler, save_path)

        # 1. Valid load within allowed_dir
        loaded = load_scaler(save_path, allowed_dir=allowed_dir)
        assert loaded is not None

        # 2. Path outside allowed_dir should raise ValueError
        other_dir = str(tmp_path / "other")
        os.makedirs(other_dir, exist_ok=True)
        with pytest.raises(ValueError, match="outside allowed directory"):
            load_scaler(save_path, allowed_dir=other_dir)

        # 3. Tampered artifact should fail integrity verification
        with open(save_path, "ab") as f:
            f.write(b"tampered_bytes")
        with pytest.raises(ValueError, match="Integrity check failed"):
            load_scaler(save_path)

    def test_prepare_dataset_features_empty_and_partial(self):
        """Test prepare_dataset_features on empty and partial input DataFrames."""
        import pandas as pd
        from ml_engine.preprocessing import prepare_dataset_features, FEATURE_NAMES

        # Empty DataFrame
        empty_df = pd.DataFrame()
        X_empty, y_empty = prepare_dataset_features(empty_df)
        assert X_empty.shape == (0, 13)
        assert list(X_empty.columns) == FEATURE_NAMES
        assert y_empty.shape == (0,)

        # Partial DataFrame (missing most columns)
        partial_df = pd.DataFrame({
            "Student_ID": ["ST01", "ST02"],
            "CGPA": [3.5, 3.8],
            "Placement_Status": ["Placed", "Not Placed"],
        })
        X_part, y_part = prepare_dataset_features(partial_df)
        assert X_part.shape == (2, 13)
        assert list(X_part.columns) == FEATURE_NAMES
        assert X_part.isna().sum().sum() == 0
        assert y_part.tolist() == [1, 0]
        # Check scale conversion on 4.0 scale (3.5 * 2.5 = 8.75)
        np.testing.assert_almost_equal(X_part["cgpa"].iloc[0], 8.75)


class TestXGBoostModel:
    """Tests for XGBoost placement predictor."""

    @pytest.fixture
    def trained_predictor(self, tmp_path):
        """Fixture that provides a trained PlacementPredictor instance."""
        import pandas as pd
        from ml_engine.xgboost_model import PlacementPredictor

        # Synthetic dataset for fast unit test execution
        np.random.seed(42)
        n_samples = 400
        synthetic_data = {
            "Student_ID": [f"ST{i:04d}" for i in range(n_samples)],
            "CGPA": np.random.uniform(2.0, 4.0, n_samples),
            "Attendance_Percentage": np.random.uniform(60, 100, n_samples),
            "Programming_Skill": np.random.randint(1, 11, n_samples),
            "Problem_Solving": np.random.randint(1, 11, n_samples),
            "Projects_Completed": np.random.randint(0, 8, n_samples),
            "Communication_Skills": np.random.randint(1, 11, n_samples),
            "Internships": np.random.randint(0, 4, n_samples),
            "Hackathons": np.random.randint(0, 5, n_samples),
            "GitHub_Profile": np.random.choice(["Yes", "No"], n_samples),
            "Major": np.random.choice(["Computer Science", "Information Technology", "AI"], n_samples),
            "Placement_Status": np.random.choice(["Placed", "Not Placed"], n_samples, p=[0.6, 0.4]),
        }
        csv_path = str(tmp_path / "test_students.csv")
        pd.DataFrame(synthetic_data).to_csv(csv_path, index=False)

        predictor = PlacementPredictor(n_estimators=30, max_depth=3)
        predictor.train(csv_path)
        return predictor

    def test_prediction_returns_probability(self, trained_predictor):
        """Test that prediction returns a valid probability, status, and feature importances."""
        sample_features = np.array([8.5, 90.0, 0, 85, 90, 75, 80, 120, 350, 80, 5, 88, 3], dtype=np.float64)

        result = trained_predictor.predict(sample_features)

        assert isinstance(result, dict)
        assert "placement_probability" in result
        assert "is_placed" in result
        assert "feature_importance" in result
        assert "top_factors" in result

        assert 0.0 <= result["placement_probability"] <= 1.0
        assert isinstance(result["is_placed"], bool)
        assert len(result["feature_importance"]) == 13
        assert len(result["top_factors"]) <= 3

    def test_prediction_with_missing_features(self, trained_predictor):
        """Test graceful handling of incomplete/zero feature vectors."""
        zero_features = np.zeros(13, dtype=np.float64)
        result = trained_predictor.predict(zero_features)

        assert 0.0 <= result["placement_probability"] <= 1.0
        assert isinstance(result["is_placed"], bool)

    def test_prediction_latency(self, trained_predictor):
        """Test that single inference execution is fast (<5ms per call)."""
        import time

        sample_features = np.array([8.0, 85.0, 0, 80, 80, 70, 60, 50, 200, 70, 4, 75, 2], dtype=np.float64)

        # Warmup
        trained_predictor.predict(sample_features)

        # Measure 50 predictions
        start_time = time.perf_counter()
        for _ in range(50):
            trained_predictor.predict(sample_features)
        total_time = time.perf_counter() - start_time
        avg_time_ms = (total_time / 50) * 1000

        assert avg_time_ms < 5.0, f"Average inference time {avg_time_ms:.2f}ms exceeded 5ms SLA"

    def test_model_serialization(self, trained_predictor, tmp_path):
        """Test saving and loading the trained PlacementPredictor with integrity check."""
        from ml_engine.xgboost_model import PlacementPredictor

        model_path = str(tmp_path / "xgboost_placement.pkl")
        trained_predictor.save(model_path)
        assert os.path.exists(model_path)
        assert os.path.exists(f"{model_path}.sha256")

        new_predictor = PlacementPredictor()
        new_predictor.load(model_path)
        assert new_predictor.is_trained

        sample_features = np.array([9.0, 95.0, 0, 90, 95, 85, 90, 150, 400, 90, 6, 95, 4], dtype=np.float64)
        res_orig = trained_predictor.predict(sample_features)
        res_loaded = new_predictor.predict(sample_features)

        assert res_orig["placement_probability"] == res_loaded["placement_probability"]
        assert res_orig["is_placed"] == res_loaded["is_placed"]


class TestCosineRecommender:
    """Tests for Cosine Similarity career recommender."""

    def test_recommendation_returns_sorted_list(self):
        """Test that recommendations are sorted by match percentage."""
        # TODO: Implement
        pass

    def test_perfect_match_returns_100_percent(self):
        """Test that identical vectors yield 100% match."""
        # TODO: Implement
        pass


class TestGapAnalyzer:
    """Tests for skill-gap analysis."""

    def test_gap_calculation(self):
        """Test vector subtraction identifies correct gaps."""
        # TODO: Implement
        pass


class TestRoadmapGenerator:
    """Tests for roadmap generation."""

    def test_roadmap_has_correct_phases(self):
        """Test that generated roadmap contains expected phases."""
        # TODO: Implement
        pass
