"""
GitHub REST API Fetcher

Fetches public profile data from GitHub REST API:
    - Total repositories (including private repos if authenticated owner)
    - Total commits (across public repos, sampled up to 10 non-fork repos)
    - Programming language distribution
    - Contribution frequency and profile telemetry (stars, forks, followers, etc.)

API Endpoint: https://api.github.com/users/{username}
Headers: Accept: application/vnd.github+json

Authentication:
    Uses optional GITHUB_PAT environment variable for higher rate limits
    (5,000 req/hr authenticated vs 60 req/hr unauthenticated) and access
    to private telemetry if authorized.

Rate Limits:
    - Unauthenticated: 60 requests/hour
    - Authenticated (with PAT): 5,000 requests/hour
"""

import logging
import os
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Optional

import requests

from app.utils.cache import InMemoryTTLCache
from app.utils.sanitizer import sanitize_username

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"
GITHUB_ACCEPT_HEADER = "application/vnd.github+json"

_cache = InMemoryTTLCache(ttl_seconds=600, maxsize=128)


def _get_headers() -> dict:
    """Build GitHub API request headers with optional authentication."""
    headers = {
        "Accept": GITHUB_ACCEPT_HEADER,
        "User-Agent": "DronAI-Platform/1.0",
    }
    pat = (os.getenv("GITHUB_PAT") or "").strip()
    # Ignore placeholder token values from template configuration
    if pat and pat not in ("your-github-personal-access-token", "your_token", "your_pat_here", "None"):
        headers["Authorization"] = f"Bearer {pat}"
    return headers


def _fetch_private_telemetry_graphql(
    username: str,
    headers: dict,
    session: Optional[requests.Session] = None,
) -> dict:
    """
    If authenticated with a PAT, query GitHub GraphQL API for the user's
    contribution calendar.

    Visibility semantics:
    - If the authenticated viewer matches the queried username, totalContributions
      includes both public and private activity for the student's own account,
      and private repositories are counted.
    - If the authenticated viewer does not match the queried username, totalContributions
      reports public activity (and any private contributions explicitly opted-in
      by the user via profile settings). It does not expose hidden private activity.
    """
    if "Authorization" not in headers:
        return {}

    query = """
    query($login: String!) {
      viewer {
        login
        repositories(privacy: PRIVATE) {
          totalCount
        }
      }
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """
    http = session or requests
    try:
        resp = http.post(
            f"{GITHUB_API_BASE}/graphql",
            json={"query": query, "variables": {"login": username}},
            headers=headers,
            timeout=8,
        )
        if resp.status_code == 200:
            res_data = resp.json().get("data", {})
            user_data = res_data.get("user")
            viewer_data = res_data.get("viewer")

            result = {}
            if user_data:
                calendar = user_data.get("contributionsCollection", {}).get("contributionCalendar", {})
                result["total_contributions"] = calendar.get("totalContributions")

            is_own_account = bool(
                viewer_data
                and viewer_data.get("login", "").lower() == (username or "").lower()
            )
            result["is_own_account"] = is_own_account
            result["contributions_visibility"] = "authenticated_owner" if is_own_account else "public_or_opted_in"

            if is_own_account and viewer_data:
                result["private_repos"] = viewer_data.get("repositories", {}).get("totalCount", 0)

            return result
    except Exception as e:
        logger.debug(f"GraphQL contribution telemetry fetch skipped: {e}")
    return {}


def fetch_github_stats(username: str) -> dict:
    """
    Fetch public GitHub statistics for a given username.

    Results are cached in memory for 10 minutes. Failures (unknown
    user, rate limit, network error) return baseline zeros and are
    NOT cached, so a later retry hits the API again.

    Args:
        username: GitHub username

    Returns:
        Dict with:
            - total_repos: int
            - total_commits: int (sampled: last year, up to 10 non-fork
              repos, max 100 commits each -- not a full count)
            - languages: list of programming languages used
            - top_language: most frequently used language
            - total_stars: int
            - total_forks: int
            - followers: int
            - avatar_url: str or None
            - name: str or None
            - bio: str or None
            - language_distribution: dict
            - total_contributions: int or None
            - contributions_visibility: str
    """
    logger.info(f"Fetching GitHub stats for: {username}")

    result = {
        "total_repos": 0,
        "total_commits": 0,
        "languages": [],
        "top_language": None,
        "total_stars": 0,
        "total_forks": 0,
        "followers": 0,
        "avatar_url": None,
        "name": None,
        "bio": None,
        "language_distribution": {},
        "total_contributions": None,
        "contributions_visibility": "public",
    }

    if not username or not isinstance(username, str):
        return result

    try:
        clean_user = sanitize_username(username)
    except (ValueError, TypeError, AttributeError):
        logger.warning(f"Rejected invalid GitHub username: {username}")
        return result
    if not clean_user:
        return result

    cache_key = clean_user.lower()
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    result, cacheable = _fetch_github_stats_uncached(clean_user)
    if cacheable:
        _cache.set(cache_key, result)
    return result


def _fetch_github_stats_uncached(
    username: str,
    session: Optional[requests.Session] = None,
) -> tuple:
    """Fetch from GitHub API using pooled session. Returns (result, cacheable); failures are not cacheable."""
    result = {
        "total_repos": 0,
        "total_commits": 0,
        "languages": [],
        "top_language": None,
        "total_stars": 0,
        "total_forks": 0,
        "followers": 0,
        "avatar_url": None,
        "name": None,
        "bio": None,
        "language_distribution": {},
        "total_contributions": None,
        "contributions_visibility": "public",
    }

    headers = _get_headers()
    own_session = session is None
    http = session or requests.Session()

    try:
        # 1. Fetch user info for total repos, followers, and profile details
        user_url = f"{GITHUB_API_BASE}/users/{username}"
        user_resp = http.get(user_url, headers=headers, timeout=10)

        # If PAT returned 401 Unauthorized, gracefully fall back to unauthenticated public request
        if user_resp.status_code == 401 and "Authorization" in headers:
            logger.warning(
                f"GitHub PAT returned 401 Unauthorized for user {username}; "
                "falling back to unauthenticated public request"
            )
            headers = {k: v for k, v in headers.items() if k != "Authorization"}
            user_resp = http.get(user_url, headers=headers, timeout=10)

        if user_resp.status_code == 404:
            logger.warning(f"GitHub user not found: {username}")
            return result, False
        elif user_resp.status_code != 200:
            logger.warning(f"GitHub API returned {user_resp.status_code} for user {username}")
            return result, False

        user_data = user_resp.json()
        result["total_repos"] = user_data.get("public_repos", 0)
        result["followers"] = user_data.get("followers", 0)
        result["avatar_url"] = user_data.get("avatar_url")
        result["name"] = user_data.get("name")
        result["bio"] = user_data.get("bio")

        # 2. Fetch up to 10 recently updated repos (capped to protect rate limits & latency)
        repos_url = f"{GITHUB_API_BASE}/users/{username}/repos?type=owner&sort=updated&per_page=10"
        repos_resp = http.get(repos_url, headers=headers, timeout=10)

        if repos_resp.status_code != 200:
            return result, False

        repos = repos_resp.json()

        lang_counter = Counter()
        commits_count = 0
        stars_count = 0
        forks_count = 0

        one_year_ago = (datetime.now(timezone.utc) - timedelta(days=365)).isoformat().replace("+00:00", "Z")

        checked = 0
        for repo in repos:
            if repo.get("fork"):
                continue
            if checked >= 10:
                break
            checked += 1

            stars_count += repo.get("stargazers_count", 0)
            forks_count += repo.get("forks_count", 0)

            lang = repo.get("language")
            if lang:
                lang_counter[lang] += 1

            # 3. Fetch commits for this repo in last year
            commits_url = (
                f"{GITHUB_API_BASE}/repos/{username}/{repo['name']}/commits"
                f"?author={username}&since={one_year_ago}&per_page=100"
            )
            try:
                c_resp = http.get(commits_url, headers=headers, timeout=5)
                if c_resp.status_code == 200:
                    commits_count += len(c_resp.json())
            except requests.RequestException:
                pass  # skip this repo if commit fetch fails (rate limit, timeout)

        # 4. If authenticated with PAT, query GraphQL contribution calendar and private repo counts
        graphql_data = _fetch_private_telemetry_graphql(username, headers, session=http)
        result["total_commits"] = commits_count

        if graphql_data.get("total_contributions") is not None:
            result["total_contributions"] = int(graphql_data["total_contributions"])
            result["contributions_visibility"] = graphql_data.get("contributions_visibility", "public")

        if graphql_data.get("private_repos"):
            result["total_repos"] += int(graphql_data["private_repos"])

        result["total_stars"] = stars_count
        result["total_forks"] = forks_count
        result["languages"] = list(lang_counter.keys())
        result["language_distribution"] = dict(lang_counter)
        if lang_counter:
            result["top_language"] = lang_counter.most_common(1)[0][0]

        return result, True

    except requests.RequestException as e:
        logger.error(f"Error fetching GitHub stats for {username}: {e}")
        return result, False
    except Exception as e:
        logger.error(f"Unexpected error fetching GitHub stats for {username}: {e}")
        return result, False
    finally:
        if own_session:
            http.close()


fetch_github_stats.cache_clear = _cache.clear
