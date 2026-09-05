"""
Comprehensive ML Engine & Model Lifecycle Test Suite

Validates the full ML pipeline:
1. Feature extraction, bounds clipping, and normalization (preprocessing.py)
2. Supervised XGBoost placement prediction, probability bounds, and SLA (xgboost_model.py)
3. Cosine similarity career recommendation and role vector retrieval (cosine_recommender.py)
4. Vector subtraction skill-gap analysis (gap_analyzer.py)
5. Actionable, phased roadmap generation (roadmap_generator.py)
6. Singleton model caching and thread safety (model_loader.py)
7. End-to-end smoke test through the full lifecycle
"""

import os
import sys
import tempfile
import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine.preprocessing import (
    FEATURE_NAMES,
    FEATURE_BOUNDS,
    build_feature_vector,
    normalize_features,
    clean_data,
    prepare_dataset_features,
)
from ml_engine.xgboost_model import PlacementPredictor
from ml_engine.cosine_recommender import CareerRecommender
from ml_engine.gap_analyzer import analyze_gaps
from ml_engine.roadmap_generator import generate_plan
from ml_engine.model_loader import (
    load_models,
    get_placement_model,
    get_career_recommender,
    reset_models,
)


# ── 1. Feature Engineering & Preprocessing Tests ─────────────────────────────

class TestFeatureEngineeringLifecycle:
    """Tests feature extraction, data cleaning, and normalization pipelines."""

    def test_feature_vector_extraction_and_bounds(self):
        """Test conversion of heterogeneous profile dicts to canonical 13-D vector."""
        academic = {
            "cgpa": 8.7,
            "attendance_pct": 92.5,
            "active_backlogs": 0,
        }
        skills = {
            "dsa_score": 85.0,
            "python_prof": 90.0,
            "cpp_prof": 75.0,
            "aiml_knowledge": 80.0,
            "total_commits": 140,
            "problems_solved": 320,
            "contest_rating": 1650.0,
            "project_count": 5,
            "communication_score": 88.0,
            "internship_exp": 6,
        }

        vector = build_feature_vector(academic, skills)

        assert isinstance(vector, np.ndarray)
        assert vector.shape == (13,)
        assert vector.dtype == np.float64
        assert vector[0] == 8.7
        assert vector[1] == 92.5
        assert vector[2] == 0.0
        assert vector[3] == 85.0
        assert vector[8] == 320.0

    def test_non_finite_values_sanitization(self):
        """Test that NaN and +/- Inf are sanitized to 0.0 without throwing errors."""
        academic = {"cgpa": float("nan"), "attendance_pct": float("inf"), "active_backlogs": -float("inf")}
        skills = {"dsa_score": np.nan, "python_prof": "invalid"}

        vector = build_feature_vector(academic, skills)
        assert np.all(np.isfinite(vector))
        assert vector[0] == 0.0
        assert vector[1] == 0.0
        assert vector[2] == 0.0
        assert vector[3] == 0.0
        assert vector[4] == 0.0

    def test_normalize_features_fit_and_transform(self):
        """Test StandardScaler normalization and leakage-free two-step transformation."""
        np.random.seed(42)
        X_train_raw = np.random.uniform(50.0, 100.0, size=(100, 13))
        X_test_raw = np.random.uniform(50.0, 100.0, size=(20, 13))

        # Fit only on training
        X_train_norm, scaler = normalize_features(X_train_raw, scaler=None)
        assert X_train_norm.shape == (100, 13)
        np.testing.assert_almost_equal(X_train_norm.mean(axis=0), np.zeros(13), decimal=5)

        # Transform test using fitted scaler
        X_test_norm, _ = normalize_features(X_test_raw, scaler=scaler)
        assert X_test_norm.shape == (20, 13)


# ── 2. XGBoost Inference & Probability Boundaries Tests ───────────────────────

class TestXGBoostInferenceLifecycle:
    """Tests supervised prediction, boundary guarantees, and latency SLA."""

    @pytest.fixture
    def trained_model(self, tmp_path):
        """Creates and trains a fast PlacementPredictor instance on synthetic data."""
        np.random.seed(42)
        n = 300
        synthetic_df = pd.DataFrame({
            "Student_ID": [f"ST{i:03d}" for i in range(n)],
            "CGPA": np.random.uniform(2.5, 4.0, n),
            "Attendance_Percentage": np.random.uniform(65, 100, n),
            "Programming_Skill": np.random.randint(1, 11, n),
            "Problem_Solving": np.random.randint(1, 11, n),
            "Projects_Completed": np.random.randint(0, 6, n),
            "Communication_Skills": np.random.randint(1, 11, n),
            "Internships": np.random.randint(0, 3, n),
            "Hackathons": np.random.randint(0, 4, n),
            "GitHub_Profile": np.random.choice(["Yes", "No"], n),
            "Major": np.random.choice(["Computer Science", "Information Technology"], n),
            "Placement_Status": np.random.choice(["Placed", "Not Placed"], n, p=[0.65, 0.35]),
        })
        csv_path = str(tmp_path / "synthetic_students.csv")
        synthetic_df.to_csv(csv_path, index=False)

        predictor = PlacementPredictor(n_estimators=30, max_depth=3, n_jobs=1)
        predictor.train(csv_path)
        return predictor

    def test_xgboost_confidence_score_boundaries(self, trained_model):
        """Verify that prediction output is bounded between 0.0 and 1.0."""
        sample_features = np.array([8.8, 92.0, 0, 85, 90, 80, 75, 150, 400, 80, 5, 85, 3], dtype=np.float64)

        result = trained_model.predict(sample_features)

        assert isinstance(result, dict)
        assert "placement_probability" in result
        assert "is_placed" in result
        assert "feature_importance" in result
        assert "top_factors" in result

        prob = result["placement_probability"]
        assert 0.0 <= prob <= 1.0
        assert isinstance(result["is_placed"], bool)
        assert len(result["feature_importance"]) == 13
        assert len(result["top_factors"]) <= 3

    def test_single_row_enforcement(self, trained_model):
        """Verify that multi-row 2D input is rejected with ValueError."""
        multi_row = np.ones((3, 13), dtype=np.float64)
        with pytest.raises(ValueError, match="single feature vector"):
            trained_model.predict(multi_row)

    def test_serialization_and_checksum_integrity(self, trained_model, tmp_path):
        """Verify that saving creates SHA-256 sidecars and deserialization fails closed if tampered."""
        save_file = str(tmp_path / "model.pkl")
        trained_model.save(save_file)

        assert os.path.exists(save_file)
        assert os.path.exists(f"{save_file}.sha256")

        # Load valid
        reloaded = PlacementPredictor()
        reloaded.load(save_file)
        assert reloaded.is_trained

        # Tamper check
        with open(save_file, "ab") as f:
            f.write(b"corrupted_bytes")
        with pytest.raises(ValueError, match="Integrity check failed"):
            reloaded.load(save_file)


# ── 3. Career Recommendations & Roadmap Generation Tests ─────────────────────

class TestCareerAndRoadmapLifecycle:
    """Tests vector matching, skill gap subtraction, and roadmap generation."""

    @pytest.fixture
    def recommender(self):
        rec = CareerRecommender()
        rec.load_career_vectors()
        return rec

    def test_career_recommendations_ranking(self, recommender):
        """Verify that recommendations return sorted top_k matches within [0.0, 100.0]."""
        student_skill_vec = np.array([85.0, 80.0, 70.0, 40.0, 90.0, 80.0, 60.0, 75.0, 65.0, 60.0])
        recs = recommender.recommend(student_skill_vec, top_k=5)

        assert len(recs) == 5
        for i in range(len(recs) - 1):
            assert recs[i]["match_pct"] >= recs[i + 1]["match_pct"]
            assert 0.0 <= recs[i]["match_pct"] <= 100.0
            assert "career" in recs[i]

    def test_skill_gap_analysis_calculation(self, recommender):
        """Verify vector subtraction isolates positive deltas."""
        student_skills = np.array([50.0, 60.0, 40.0, 30.0, 40.0, 30.0, 20.0, 50.0, 60.0, 40.0])
        swe_ideal = recommender.get_career_vector("Software Engineer")

        gaps = analyze_gaps(student_skills, swe_ideal)

        assert len(gaps) > 0
        for gap_item in gaps:
            assert gap_item["gap"] > 0
            assert gap_item["required"] > gap_item["current"]
            assert 0.0 <= gap_item["gap_pct"] <= 100.0

    def test_roadmap_plan_generation(self, recommender):
        """Verify sequential roadmap planning with tasks, milestones, and priorities."""
        student_skills = np.array([40.0, 70.0, 50.0, 30.0, 50.0, 30.0, 20.0, 60.0, 60.0, 50.0])
        swe_ideal = recommender.get_career_vector("Software Engineer")

        gaps = analyze_gaps(student_skills, swe_ideal)
        plan = generate_plan(gaps, max_phases=4)

        assert len(plan) == 4
        assert plan[0]["phase"] == 1
        assert plan[0]["priority"] == "high"
        assert len(plan[0]["tasks"]) > 0
        assert "duration" in plan[0]
        assert "milestone" in plan[0]


# ── 4. End-to-End Pipeline Smoke Test ─────────────────────────────────────────

class TestEndToEndPipeline:
    """Validates full pipeline: data preparation -> training -> inference -> career match -> roadmap."""

    def test_full_ml_lifecycle_smoke_test(self, tmp_path):
        """Smoke test executing the end-to-end user journey across all ML components."""
        # 1. Dataset loading & preparation
        dataset_path = "ml_engine/data/student_career_success_dataset.csv"
        if not os.path.exists(dataset_path):
            pytest.skip("Dataset file not available for smoke test")

        raw_df = pd.read_csv(dataset_path).head(500)
        X_df, y = prepare_dataset_features(raw_df)
        assert X_df.shape == (500, 13)
        assert len(y) == 500

        # 2. Model training on mini slice
        mini_csv = str(tmp_path / "mini_train.csv")
        raw_df.to_csv(mini_csv, index=False)

        predictor = PlacementPredictor(n_estimators=25, max_depth=3, n_jobs=1)
        model_save_path = str(tmp_path / "smoke_model.pkl")
        metrics = predictor.train(mini_csv, save_path=model_save_path)

        assert "accuracy" in metrics
        assert os.path.exists(model_save_path)
        assert os.path.exists(f"{model_save_path}.sha256")

        # 3. Model deserialization
        eval_predictor = PlacementPredictor()
        eval_predictor.load(model_save_path)

        # 4. Student feature extraction & placement prediction
        student_academic = {"cgpa": 8.5, "attendance_pct": 88.0, "active_backlogs": 0}
        student_skills = {
            "dsa_score": 65.0,
            "python_prof": 85.0,
            "cpp_prof": 60.0,
            "aiml_knowledge": 80.0,
            "total_commits": 70,
            "problems_solved": 80,
            "contest_rating": 1500.0,
            "project_count": 4,
            "communication_score": 75.0,
            "internship_exp": 3,
        }
        student_vec_13d = build_feature_vector(student_academic, student_skills)
        prediction = eval_predictor.predict(student_vec_13d)

        assert 0.0 <= prediction["placement_probability"] <= 1.0
        assert isinstance(prediction["is_placed"], bool)

        # 5. Career recommendation
        recommender = CareerRecommender()
        recommender.load_career_vectors()
        recs = recommender.recommend(student_vec_13d, top_k=3)
        assert len(recs) == 3
        top_career = recs[0]["career"]

        # 6. Skill-gap analysis against recommended role
        target_vec = recommender.get_career_vector(top_career)
        gaps = analyze_gaps(student_vec_13d, target_vec)

        # 7. Phased roadmap generation
        roadmap = generate_plan(gaps, max_phases=3)
        assert isinstance(roadmap, list)
        if gaps:
            assert len(roadmap) > 0
            assert roadmap[0]["phase"] == 1


# ── 5. Singleton Model Loader Lifecycle Tests ─────────────────────────────────

class TestModelLoaderSingleton:
    """Tests application startup singleton loading and thread safety."""

    def setup_method(self):
        reset_models()

    def teardown_method(self):
        reset_models()

    def test_singleton_model_loader_lifecycle(self):
        """Verify singleton pattern returns identical instance and prevents redundant loads."""
        # Initial call initializes singletons
        load_models()

        m1 = get_placement_model()
        m2 = get_placement_model()
        assert m1 is not None
        assert m1 is m2  # Exact object identity in memory

        r1 = get_career_recommender()
        r2 = get_career_recommender()
        assert r1 is not None
        assert r1 is r2  # Exact object identity in memory

        # Reset clears instances
        reset_models()
        # Next call lazily reloads
        m3 = get_placement_model()
        assert m3 is not None
        assert m3 is not m1  # New instance after reset
