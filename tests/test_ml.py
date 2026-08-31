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


class TestXGBoostModel:
    """Tests for XGBoost placement predictor."""

    def test_prediction_returns_probability(self):
        """Test that prediction returns a value between 0.0 and 1.0."""
        # TODO: Implement
        pass

    def test_prediction_with_missing_features(self):
        """Test graceful handling of incomplete feature vectors."""
        # TODO: Implement
        pass


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
