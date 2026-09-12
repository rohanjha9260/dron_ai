"""
Cosine Similarity Career Recommender

Maps a student's skill vector against predefined ideal career vectors
to identify the best-matching career paths.

Mathematical Foundation:
    Similarity(S, C) = (S · C) / (||S|| × ||C||)

This measures orientation (proportional skill alignment) rather than
magnitude (absolute mastery level), making it ideal for students at
different stages of their education.

Career Vectors are defined in: ml_engine/data/career_vectors.json
"""

import os
import json
import logging
from typing import Dict, List, Optional, Union
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Path to career vectors definition file
CAREER_VECTORS_PATH = os.path.join(
    os.path.dirname(__file__), "data", "career_vectors.json"
)

# Ordered feature names expected in the career vectors
SKILL_FEATURE_NAMES = [
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


class CareerRecommender:
    """
    Cosine Similarity-based career recommendation engine.

    Each career is defined as an ideal normalized vector in the
    same dimensional space as the student's skill vector.
    """

    def __init__(self, path: Optional[str] = None):
        self.path = path
        self.career_vectors: Dict[str, np.ndarray] = {}
        self.career_names: List[str] = []
        self.career_descriptions: Dict[str, str] = {}
        self._matrix: Optional[np.ndarray] = None
        self._feature_names = SKILL_FEATURE_NAMES

        # Load career vectors if default or custom path is valid
        try:
            self.load_career_vectors(self.path)
        except Exception as e:
            logger.warning(f"Initial load of career vectors skipped: {e}")

    def load_career_vectors(self, path: Optional[str] = None):
        """
        Load predefined career vectors from JSON file.

        Args:
            path: Path to career_vectors.json (uses self.path or default if None)
        """
        if path is not None:
            self.path = path

        file_path = path or self.path or CAREER_VECTORS_PATH
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Career vectors file not found at: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        careers = data.get("careers", {})
        if not careers:
            raise ValueError(f"No careers defined in {file_path}")

        self.career_vectors = {}
        self.career_names = []
        self.career_descriptions = {}
        matrix_rows = []

        for name, details in careers.items():
            vec_dict = details.get("vector", {})
            vec = [float(vec_dict.get(feat, 0.0)) for feat in self._feature_names]
            vec_arr = np.array(vec, dtype=np.float64)

            self.career_vectors[name] = vec_arr
            self.career_names.append(name)
            self.career_descriptions[name] = details.get("description", "")
            matrix_rows.append(vec_arr)

        self._matrix = np.vstack(matrix_rows)
        logger.info(f"Successfully loaded {len(self.career_names)} career vectors from {file_path}")

    def _prepare_student_vector(self, student_vector: Union[np.ndarray, list]) -> np.ndarray:
        """Validate and format student vector to match the 10-D skill feature space."""
        if isinstance(student_vector, list):
            s_vec = np.array(student_vector, dtype=np.float64)
        elif isinstance(student_vector, np.ndarray):
            s_vec = student_vector.astype(np.float64)
        else:
            raise TypeError("student_vector must be a list or numpy ndarray")

        # Handle 2D matrix (single-row)
        if s_vec.ndim == 2:
            if s_vec.shape[0] == 1:
                s_vec = s_vec.flatten()
            elif s_vec.shape[1] == 1:
                s_vec = s_vec.flatten()
            else:
                raise ValueError(
                    f"student_vector must be 1D or single-row 2D, got shape {s_vec.shape}"
                )
        elif s_vec.ndim != 1:
            raise ValueError(f"student_vector must be 1D, got ndim={s_vec.ndim}")

        # Sanitize non-finite values (NaN, Inf, -Inf) to 0.0
        s_vec = np.nan_to_num(s_vec, nan=0.0, posinf=0.0, neginf=0.0)

        # Support both 13-D full feature vectors and 10-D skill vectors
        if s_vec.shape[0] == 13:
            s_vec = s_vec[3:]
        elif s_vec.shape[0] != len(self._feature_names):
            raise ValueError(
                f"student_vector must have {len(self._feature_names)} skill features "
                f"(or 13 full features), got length {s_vec.shape[0]}"
            )

        return s_vec

    def recommend(self, student_vector: Union[np.ndarray, list], top_k: int = 5) -> list:
        """
        Recommend careers based on cosine similarity.

        Args:
            student_vector: 1D numpy array or list representing the student's skills
            top_k: Number of top recommendations to return

        Returns:
            List of dicts: [{"career": str, "match_pct": float, "description": str}, ...]
            Sorted by match_pct descending
        """
        if not self.career_vectors or self._matrix is None:
            self.load_career_vectors(self.path)

        if top_k <= 0:
            return []

        s_vec = self._prepare_student_vector(student_vector)

        # Check if student vector has zero norm
        norm_s = np.linalg.norm(s_vec)
        if norm_s == 0.0:
            results = [
                {
                    "career": name,
                    "match_pct": 0.0,
                    "description": self.career_descriptions.get(name, ""),
                }
                for name in self.career_names
            ]
            return results[:top_k]

        # Compute cosine similarity against all career vectors
        sims = cosine_similarity(s_vec.reshape(1, -1), self._matrix)[0]

        results = []
        for name, sim in zip(self.career_names, sims):
            clipped_sim = float(np.clip(sim, 0.0, 1.0))
            match_pct = round(clipped_sim * 100.0, 2)
            results.append(
                {
                    "career": name,
                    "match_pct": match_pct,
                    "description": self.career_descriptions.get(name, ""),
                }
            )

        # Sort descending by match_pct
        results.sort(key=lambda x: x["match_pct"], reverse=True)

        return results[:top_k]

    def get_career_vector(self, career_name: str) -> np.ndarray:
        """
        Get the ideal vector for a specific career path.

        Args:
            career_name: Name of the career (e.g., "Software Engineer")

        Returns:
            1D numpy array representing the ideal skill distribution

        Raises:
            ValueError: If career_name is not found
        """
        if not self.career_vectors:
            self.load_career_vectors(self.path)

        if not career_name:
            raise ValueError("career_name cannot be empty")

        # 1. Exact match
        if career_name in self.career_vectors:
            return self.career_vectors[career_name].copy()

        # 2. Case-insensitive exact match
        target = career_name.strip().lower()
        for name, vec in self.career_vectors.items():
            if name.lower() == target:
                return vec.copy()

        # 3. Partial match (e.g. "DevOps" -> "DevOps Engineer", "Cybersecurity" -> "Cybersecurity Analyst")
        for name, vec in self.career_vectors.items():
            if target in name.lower() or name.lower() in target:
                return vec.copy()

        raise ValueError(
            f"Career '{career_name}' not found. Available careers: {self.career_names}"
        )
