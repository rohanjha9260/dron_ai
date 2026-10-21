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

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

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

    def test_fetch_metrics_invalid_payload(self, client, registered_user):
        """POST /api/metrics/fetch with non-object JSON returns 400."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        resp = client.post(
            "/api/metrics/fetch",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(["not", "an", "object"]),
            content_type="application/json",
        )
        assert resp.status_code == 400
        assert resp.get_json()["error"] == "Request body must be a JSON object"

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

    def test_get_telemetry_endpoint(self, client, registered_user):
        """GET /api/metrics/telemetry returns telemetry details."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        resp = client.get(
            "/api/metrics/telemetry",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        body = resp.get_json()
        assert "github_handle" in body
        assert "leetcode_username" in body
        assert "dsa_score" in body


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


class TestHealthEndpoint:
    """Tests for /api/health endpoint."""

    def test_health_check_returns_status(self, client):
        """Test that /api/health returns 200 or 503 and valid json structure."""
        resp = client.get("/api/health")
        assert resp.status_code in (200, 503)
        data = resp.get_json()
        assert "status" in data
        assert "backend" in data
        assert data["backend"] is True
        assert "models_active" in data
        assert "models" in data
        assert "placement_model" in data["models"]
        assert "career_recommender" in data["models"]

    def test_health_check_exception_returns_fixed_error(self, client, monkeypatch):
        """Test that unhandled exception in health check returns fixed non-sensitive message."""
        import ml_engine.model_loader

        def mock_error(*args, **kwargs):
            raise RuntimeError("Database connection string postgres://secret:pass@internal:5432")

        monkeypatch.setattr(ml_engine.model_loader, "get_placement_model", mock_error)
        resp = client.get("/api/health")
        assert resp.status_code == 500
        data = resp.get_json()
        assert data["status"] == "offline"
        assert data["backend"] is True
        assert data["models_active"] is False
        assert data["error"] == "Internal health check error"
        assert "secret" not in data["error"]


# ── Hardening Tests: Error Handlers, Rate Limiting & Sanitization ─────────────

class TestSecurityAndHardening:
    """Tests for rate limiting, centralized JSON error handlers, CORS, and sanitization."""

    def test_centralized_error_handlers_format(self, client):
        """Malformed JSON or standard errors return standardized JSON error schema."""
        # 404 Not Found
        resp = client.get("/api/nonexistent-endpoint")
        assert resp.status_code == 404
        body = resp.get_json()
        assert body["success"] is False
        assert body["error"]["code"] == 404
        assert "Resource not found" in body["error"]["message"]

        # 400 Bad Request (malformed JSON string)
        resp = client.post(
            "/api/auth/register",
            data="{malformed: json,",
            content_type="application/json",
        )
        assert resp.status_code == 400
        body = resp.get_json()
        assert body["success"] is False
        assert body["error"]["code"] == 400
        assert isinstance(body["error"]["message"], str)

    def test_rate_limiting_exceeded(self, client):
        """Rate limit triggers 429 Too Many Requests when threshold is exceeded."""
        payload = {"email": "spam@example.com", "password": "password"}
        hit_429 = False

        # /api/auth/login has 10/minute rate limit
        for _ in range(15):
            resp = client.post(
                "/api/auth/login",
                data=json.dumps(payload),
                content_type="application/json",
            )
            if resp.status_code == 429:
                hit_429 = True
                body = resp.get_json()
                assert body["success"] is False
                assert body["error"]["code"] == 429
                assert "Too Many Requests" in body["error"]["message"] or "per minute" in body["error"]["message"]
                break

        assert hit_429, "Expected 429 Too Many Requests after exceeding threshold"

    def test_input_sanitization_xss_stripped(self, client, registered_user):
        """Input strings strip malicious script/HTML tags before reaching DB."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        malicious_name = "Jane Doe<script>alert('xss')</script><b>Bold</b>"

        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"full_name": malicious_name}),
            content_type="application/json",
        )
        assert resp.status_code == 200

        # Verify via GET profile
        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        profile = get_resp.get_json()
        stored_name = profile["user"]["full_name"]

        # Ensure script tag and contents are eliminated
        assert "<script>" not in stored_name
        assert "alert('xss')" not in stored_name
        assert "Jane Doe" in stored_name

    def test_input_sanitization_does_not_html_escape_quotes_or_urls(self, client, registered_user):
        """Do not HTML-escape values before storing: quotes and URLs with query parameters stay clean."""
        token = _get_jwt(client, registered_user["email"], registered_user["password"])
        name_with_apostrophe = "Conan O'Brien"
        linkedin_with_query = "https://linkedin.com/in/obrien?a=1&b=2"

        resp = client.put(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({
                "full_name": name_with_apostrophe,
                "platform_links": {"linkedin_url": linkedin_with_query},
            }),
            content_type="application/json",
        )
        assert resp.status_code == 200

        get_resp = client.get(
            "/api/users/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        profile = get_resp.get_json()
        assert profile["user"]["full_name"] == "Conan O'Brien"
        assert "&#x27;" not in profile["user"]["full_name"]
        assert profile["platform_links"]["linkedin_url"] == "https://linkedin.com/in/obrien?a=1&b=2"
        assert "&amp;" not in profile["platform_links"]["linkedin_url"]

    def test_numeric_bounds_rejects_nan_and_inf(self):
        """validate_numeric_bounds, validate_cgpa, validate_attendance, and validate_skill_score reject NaN and Inf."""
        import pytest
        from app.utils.sanitizer import (
            validate_numeric_bounds,
            validate_cgpa,
            validate_attendance,
            validate_skill_score,
        )

        for nan_val in (float("nan"), "nan", "NaN"):
            with pytest.raises(ValueError, match="finite"):
                validate_numeric_bounds(nan_val, min_val=0.0, max_val=10.0, field_name="cgpa")
            with pytest.raises(ValueError, match="finite"):
                validate_cgpa(nan_val)
            with pytest.raises(ValueError, match="finite"):
                validate_attendance(nan_val)
            with pytest.raises(ValueError, match="finite"):
                validate_skill_score(nan_val)

        for inf_val in (float("inf"), float("-inf"), "inf", "-inf"):
            with pytest.raises(ValueError, match="finite"):
                validate_numeric_bounds(inf_val, min_val=0.0, max_val=10.0, field_name="cgpa")

    def test_cors_headers_present(self, client):
        """Verify CORS headers are returned for API preflight and requests."""
        resp = client.open(
            "/api/health",
            method="OPTIONS",
            headers={"Origin": "http://localhost:8000"},
        )
        assert resp.status_code in (200, 204)
        assert "Access-Control-Allow-Origin" in resp.headers

    def test_production_cors_validation_rejects_regex_and_wildcards(self, monkeypatch):
        """ProductionConfig.validate() must reject regex patterns like '.*' or wildcards like '*'."""
        import pytest
        from config import ProductionConfig

        # Valid secure production setup with domain, custom port, IPv4, and bracketed IPv6
        monkeypatch.setattr(ProductionConfig, "SECRET_KEY", "real-prod-secret-key-32-chars-long!")
        monkeypatch.setattr(ProductionConfig, "JWT_SECRET_KEY", "real-prod-jwt-key-32-chars-long!!")
        monkeypatch.setattr(
            ProductionConfig,
            "CORS_ORIGINS",
            [
                "https://dron.ai",
                "https://app.dron.ai:8000",
                "http://127.0.0.1:5000",
                "https://[::1]:8443",
                "https://[2001:db8::1]",
            ],
        )
        ProductionConfig.validate()  # Passes

        # Reject wildcard '*'
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["*"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject regex wildcard '.*'
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", [".*"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject partial regex pattern 'https://.*\.dron\.ai'
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", [r"https://.*\.dron\.ai"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject out-of-range port (e.g. 99999)
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["https://example.com:99999"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject out-of-range IPv4 octets (e.g. 999.999.999.999)
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["http://999.999.999.999"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject unbracketed or invalid IPv6
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["https://::1:8443"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject trailing slash (browsers never send trailing slash in Origin header)
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["https://dron.ai/"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject uppercase scheme
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["HTTPS://dron.ai"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject empty port colon
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["https://dron.ai:"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()

        # Reject embedded whitespace or newline
        monkeypatch.setattr(ProductionConfig, "CORS_ORIGINS", ["https://dron.ai\n"])
        with pytest.raises(ValueError, match="Origins in production must be explicit literal URLs"):
            ProductionConfig.validate()



