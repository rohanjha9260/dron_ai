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
import numpy as np
import logging
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Path to career vectors definition file
CAREER_VECTORS_PATH = os.path.join(
    os.path.dirname(__file__), "data", "career_vectors.json"
)


class CareerRecommender:
    """
    Cosine Similarity-based career recommendation engine.

    Each career is defined as an ideal normalized vector in the
    same dimensional space as the student's skill vector.
    """

    def __init__(self):
        self.career_vectors = {}
        self.career_names = []

    def load_career_vectors(self, path: str = None):
        """
        Load predefined career vectors from JSON file.

        Args:
            path: Path to career_vectors.json (uses default if None)
        """
        # TODO: Implement
        # 1. Load JSON file
        # 2. Parse career names and their ideal vectors
        # 3. Store in self.career_vectors
        pass

    def recommend(self, student_vector: np.ndarray, top_k: int = 5) -> list:
        """
        Recommend careers based on cosine similarity.

        Args:
            student_vector: 1D numpy array representing the student's skills
            top_k: Number of top recommendations to return

        Returns:
            List of dicts: [{"career": str, "match_pct": float}, ...]
            Sorted by match_pct descending
        """
        # TODO: Implement
        # 1. Validate career vectors are loaded
        # 2. Reshape student vector
        # 3. Calculate cosine similarity against all career vectors
        # 4. Sort by similarity score
        # 5. Return top_k results with percentage scores
        pass

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
        # TODO: Implement
        pass
