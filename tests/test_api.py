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


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    """Create a test client with an in-memory SQLite database."""
    app = create_app("testing")
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()


@pytest.fixture
def registered_user(client):
    """Register a student and return the response JSON for reuse across tests."""
    payload = {
        "full_name": "Test Student",
        "email": "test@example.com",
        "password": "SecurePass123",
    }
    resp = client.post(
        "/api/auth/register",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert resp.status_code == 201, f"Fixture setup failed: {resp.get_json()}"
    return payload  # return the raw payload so tests can reuse email/password


def _get_jwt(client, email="test@example.com", password="SecurePass123") -> str:
    """Helper: log in and return a valid Bearer token string."""
    resp = client.post(
        "/api/auth/login",
        data=json.dumps({"email": email, "password": password}),
        content_type="application/json",
    )
    return resp.get_json()["access_token"]


# ── Auth Endpoint Tests ────────────────────────────────────────────────────────

class TestAuthEndpoints:
    """Tests for /api/auth/ endpoints."""

    # ── Register ──────────────────────────────────────────────────────────────

    def test_register_success(self, client):
        """Valid payload returns 201 with student_id."""
        payload = {
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "password": "StrongPass1!",
        }
        resp = client.post(
            "/api/auth/register",
            data=json.dumps(payload),
            content_type="application/json",
        )
        body = resp.get_json()

        assert resp.status_code == 201
        assert "student_id" in body
        assert isinstance(body["student_id"], int)
        assert body["message"] == "Registration successful"

    def test_register_duplicate_email(self, client, registered_user):
        """Registering with an already-used email returns 409 Conflict."""
        payload = {
            "full_name": "Duplicate User",
            "email": registered_user["email"],   # same email as fixture
            "password": "AnotherPass99",
        }
        resp = client.post(
            "/api/auth/register",
            data=json.dumps(payload),
            content_type="application/json",
        )
        body = resp.get_json()

        assert resp.status_code == 409
        assert "error" in body

    def test_register_missing_field(self, client):
        """Payload missing full_name returns 400 Bad Request."""
        payload = {
            "email": "incomplete@example.com",
            "password": "SomePass123",
            # full_name intentionally omitted
        }
        resp = client.post(
            "/api/auth/register",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert resp.status_code == 400

    def test_register_optional_fields(self, client):
        """Registration succeeds with optional cohort_year and academic_branch."""
        payload = {
            "full_name": "Bob Jones",
            "email": "bob@example.com",
            "password": "Pass1234!",
            "cohort_year": 2024,
            "academic_branch": "CS",
        }
        resp = client.post(
            "/api/auth/register",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert resp.status_code == 201

    # ── Login ─────────────────────────────────────────────────────────────────

    def test_login_success(self, client, registered_user):
        """Valid credentials return 200 with access_token and student_id."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": registered_user["email"],
                "password": registered_user["password"],
            }),
            content_type="application/json",
        )
        body = resp.get_json()

        assert resp.status_code == 200
        assert "access_token" in body
        assert isinstance(body["access_token"], str)
        assert len(body["access_token"]) > 0
        assert "student_id" in body
        assert isinstance(body["student_id"], int)

    def test_login_invalid_credentials(self, client, registered_user):
        """Wrong password returns 401 Unauthorized."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": registered_user["email"],
                "password": "WrongPassword!",
            }),
            content_type="application/json",
        )
        body = resp.get_json()

        assert resp.status_code == 401
        assert "error" in body

    def test_login_unknown_email(self, client):
        """Email that was never registered returns 401."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({
                "email": "nobody@example.com",
                "password": "SomePass123",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        """Payload without password returns 400."""
        resp = client.post(
            "/api/auth/login",
            data=json.dumps({"email": "test@example.com"}),
            content_type="application/json",
        )
        assert resp.status_code == 400

    # ── /me ───────────────────────────────────────────────────────────────────

    def test_me_without_token(self, client):
        """GET /me with no Authorization header returns 401."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_me_with_valid_token(self, client, registered_user):
        """GET /me with a valid Bearer token returns 200 and user data."""
        token = _get_jwt(
            client,
            email=registered_user["email"],
            password=registered_user["password"],
        )
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        body = resp.get_json()

        assert resp.status_code == 200
        assert body["email"] == registered_user["email"]
        assert body["full_name"] == registered_user["full_name"]
        assert "password_hash" not in body  # must never be exposed

    def test_me_with_invalid_token(self, client):
        """GET /me with a garbage token returns 401/422."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer this.is.not.a.valid.jwt"},
        )
        assert resp.status_code in (401, 422)


# ── Placeholder Tests (other feature areas) ───────────────────────────────────

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
