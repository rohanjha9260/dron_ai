"""
API Endpoint Tests

Tests for all Flask REST API endpoints:
    - Authentication (register, login, me)
    - User profile (get, update)
    - Metrics fetching
    - Predictions
    - Career recommendations
    - Roadmap generation
"""

import pytest
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db


@pytest.fixture
def client():
    """Create a test client with an in-memory database."""
    app = create_app("testing")
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()


class TestAuthEndpoints:
    """Tests for /api/auth/ endpoints."""

    def test_register_success(self, client):
        """Test successful student registration."""
        # TODO: Implement
        pass

    def test_register_duplicate_email(self, client):
        """Test registration with an already-registered email."""
        # TODO: Implement
        pass

    def test_login_success(self, client):
        """Test successful login returns JWT token."""
        # TODO: Implement
        pass

    def test_login_invalid_credentials(self, client):
        """Test login with wrong password returns 401."""
        # TODO: Implement
        pass

    def test_me_without_token(self, client):
        """Test /me endpoint without JWT returns 401."""
        # TODO: Implement
        pass


class TestPredictionEndpoints:
    """Tests for /api/predictions/ endpoints."""

    def test_placement_prediction(self, client):
        """Test placement readiness prediction returns valid score."""
        # TODO: Implement
        pass


class TestCareerEndpoints:
    """Tests for /api/career/ endpoints."""

    def test_career_recommendation(self, client):
        """Test career recommendation returns ranked list."""
        # TODO: Implement
        pass


class TestRoadmapEndpoints:
    """Tests for /api/roadmap/ endpoints."""

    def test_roadmap_generation(self, client):
        """Test roadmap generation for a target career."""
        # TODO: Implement
        pass
