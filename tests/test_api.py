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


# ── Profile Endpoint Tests ───────────────────────────────────────────────────

class TestProfileEndpoints:
    """Tests for /api/users/profile endpoints."""

    def test_get_profile_unauthorized(self, client):
        """GET /api/users/profile without JWT returns 401."""
        resp = client.get("/api/users/profile")
        assert resp.status_code == 401

    def test_get_profile_success(self, client, registered_user):
        """GET /api/users/profile returns 200 with complete student stats."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        body = resp.get_json()

        assert "user" in body
        assert body["user"]["email"] == registered_user["email"]
        assert body["user"]["full_name"] == registered_user["full_name"]
        assert "password_hash" not in body["user"]

        assert "academics" in body
        assert isinstance(body["academics"], list)

        assert "platform_links" in body
        assert "links" in body
        assert "skills" in body
        assert "dsa_score" in body["skills"]
        assert "total_commits" in body["skills"]
        assert "problems_solved" in body["skills"]

    def test_update_profile_user_info(self, client, registered_user):
        """PUT /api/users/profile updates basic user profile fields."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        update_payload = {
            "full_name": "Updated Name",
            "cohort_year": 2026,
            "academic_branch": "Computer Science",
        }
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(update_payload),
            content_type="application/json",
        )
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["message"] == "Profile updated successfully"

        # Verify via GET
        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        get_body = get_resp.get_json()
        assert get_body["user"]["full_name"] == "Updated Name"
        assert get_body["user"]["cohort_year"] == 2026
        assert get_body["user"]["academic_branch"] == "Computer Science"

    def test_update_profile_academics_upsert(self, client, registered_user):
        """PUT /api/users/profile upserts semester-wise academic records."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        academics_payload = {
            "academics": [
                {"semester": 1, "cgpa": 8.5, "attendance_pct": 92.0, "active_backlogs": 0},
                {"semester": 2, "cgpa": 8.7, "attendance_pct": 95.0, "active_backlogs": 0},
            ]
        }
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(academics_payload),
            content_type="application/json",
        )
        assert resp.status_code == 200

        # Update semester 1 and add semester 3
        upsert_payload = {
            "academics": [
                {"semester": 1, "cgpa": 8.9, "attendance_pct": 93.0, "active_backlogs": 1},
                {"semester": 3, "cgpa": 9.1, "attendance_pct": 90.0, "active_backlogs": 0},
            ]
        }
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(upsert_payload),
            content_type="application/json",
        )
        assert resp.status_code == 200

        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        get_body = get_resp.get_json()
        sems = get_body["academics"]
        assert len(sems) == 3
        sem1 = next(s for s in sems if s["semester"] == 1)
        assert sem1["cgpa"] == 8.9
        assert sem1["active_backlogs"] == 1

    def test_update_profile_platform_links(self, client, registered_user):
        """PUT /api/users/profile updates external platform identifiers."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        links_payload = {
            "platform_links": {
                "github_username": "octocat",
                "leetcode_username": "tourist",
                "linkedin_url": "https://linkedin.com/in/octocat",
            }
        }
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(links_payload),
            content_type="application/json",
        )
        assert resp.status_code == 200

        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        links = get_resp.get_json()["platform_links"]
        assert links["github_username"] == "octocat"
        assert links["leetcode_username"] == "tourist"
        assert links["linkedin_url"] == "https://linkedin.com/in/octocat"

    def test_update_profile_skills(self, client, registered_user):
        """PUT /api/users/profile updates skill metrics."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        skills_payload = {
            "skills": {
                "dsa_score": 85.5,
                "python_prof": 90.0,
                "cpp_prof": 75.0,
                "aiml_knowledge": 80.0,
                "project_count": 5,
                "communication_score": 88.0,
                "internship_exp": 6,
            }
        }
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(skills_payload),
            content_type="application/json",
        )
        assert resp.status_code == 200

        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        skills = get_resp.get_json()["skills"]
        assert skills["dsa_score"] == 85.5
        assert skills["python_prof"] == 90.0
        assert skills["project_count"] == 5
        assert skills["internship_exp"] == 6

    def test_update_profile_validation_errors(self, client, registered_user):
        """PUT /api/users/profile rejects invalid input with 400."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])

        # Invalid CGPA > 10
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"academics": [{"semester": 1, "cgpa": 12.0}]}),
            content_type="application/json",
        )
        assert resp.status_code == 400

        # Negative attendance
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"academics": [{"semester": 1, "cgpa": 8.0, "attendance_pct": -5.0}]}),
            content_type="application/json",
        )
        assert resp.status_code == 400

        # Invalid semester
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"academics": [{"semester": 0, "cgpa": 8.0}]}),
            content_type="application/json",
        )
        assert resp.status_code == 400

        # Skill score > 100
        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"skills": {"dsa_score": 150.0}}),
            content_type="application/json",
        )
        assert resp.status_code == 400


# ── Metrics Endpoint Tests ────────────────────────────────────────────────────

class TestMetricsEndpoints:
    """Tests for /api/metrics/ endpoints."""

    def test_fetch_metrics_unauthorized(self, client):
        """POST /api/metrics/fetch without JWT returns 401."""
        resp = client.post("/api/metrics/fetch")
        assert resp.status_code == 401

    def test_fetch_metrics_no_handles(self, client, registered_user):
        """POST /api/metrics/fetch with no handles returns 400."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        resp = client.post(
            "/api/metrics/fetch",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({}),
            content_type="application/json",
        )
        assert resp.status_code == 400
        body = resp.get_json()
        assert "error" in body

    def test_fetch_metrics_success_with_mock(self, client, registered_user, monkeypatch):
        """POST /api/metrics/fetch syncs metrics and updates skill vector."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])

        mock_github = {
            "total_repos": 15,
            "total_commits": 128,
            "languages": ["Python", "JavaScript"],
            "top_language": "Python",
        }
        mock_leetcode = {
            "problems_solved": 210,
            "easy_solved": 70,
            "medium_solved": 110,
            "hard_solved": 30,
            "contest_rating": 1680.5,
            "ranking": 45000,
        }

        monkeypatch.setattr(
            "app.services.metrics_service.fetch_github_stats",
            lambda username: mock_github,
        )
        monkeypatch.setattr(
            "app.services.metrics_service.fetch_leetcode_stats",
            lambda username: mock_leetcode,
        )

        resp = client.post(
            "/api/metrics/fetch",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({
                "github_handle": "dev_student",
                "leetcode_username": "coder_student",
            }),
            content_type="application/json",
        )
        assert resp.status_code == 200
        body = resp.get_json()

        assert "github" in body
        assert body["github"]["total_commits"] == 128
        assert body["github"]["repos"] == 15
        assert "leetcode" in body
        assert body["leetcode"]["problems_solved"] == 210
        assert body["leetcode"]["rating"] == 1680.5

        # Verify that profile and skill_vector were updated in the database
        profile_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        profile_body = profile_resp.get_json()

        assert profile_body["skills"]["total_commits"] == 128
        assert profile_body["skills"]["problems_solved"] == 210
        assert profile_body["skills"]["contest_rating"] == 1680.5
        assert profile_body["skills"]["dsa_score"] >= 70.0

        assert profile_body["platform_links"]["github_username"] == "dev_student"
        assert profile_body["platform_links"]["leetcode_username"] == "coder_student"
        assert profile_body["platform_links"]["last_synced"] is not None


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

