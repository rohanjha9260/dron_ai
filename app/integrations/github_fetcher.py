"""
GitHub REST API Fetcher

Fetches public profile data from GitHub REST API:
    - Total repositories
    - Total commits (across public repos)
    - Programming language distribution
    - Contribution frequency

API Endpoint: https://api.github.com/users/{username}/repos
Headers: Accept: application/vnd.github+json

Rate Limits:
    - Unauthenticated: 60 requests/hour
    - Authenticated (with PAT): 5,000 requests/hour
"""

import os
import time
import threading
import requests
import logging

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"
GITHUB_ACCEPT_HEADER = "application/vnd.github+json"

_CACHE_TTL_SECONDS = 600
_CACHE_MAXSIZE = 128
_cache: dict = {}
_cache_lock = threading.Lock()


def _cache_get(key: str):
    now = time.monotonic()
    with _cache_lock:
        entry = _cache.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at < now:
            _cache.pop(key, None)
            return None
        return value


def _cache_set(key: str, value: dict) -> None:
    with _cache_lock:
        if len(_cache) >= _CACHE_MAXSIZE:
            _cache.pop(next(iter(_cache)))
        _cache[key] = (time.monotonic() + _CACHE_TTL_SECONDS, value)


def _cache_clear() -> None:
    with _cache_lock:
        _cache.clear()


def _get_headers() -> dict:
    """Build GitHub API request headers with optional authentication."""
    headers = {
        "Accept": GITHUB_ACCEPT_HEADER,
    }
    pat = os.getenv("GITHUB_PAT")
    if pat:
        headers["Authorization"] = f"Bearer {pat}"
    return headers


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
    """
    logger.info(f"Fetching GitHub stats for: {username}")

    result = {
        "total_repos": 0,
        "total_commits": 0,
        "languages": [],
        "top_language": None,
    }

    if not username:
        return result

    try:
        from app.utils.sanitizer import sanitize_username

        username = sanitize_username(username)
    except ValueError:
        logger.warning(f"Rejected invalid GitHub username: {username}")
        return result
    if not username:
        return result

    cached = _cache_get(username)
    if cached is not None:
        return cached

    result, cacheable = _fetch_github_stats_uncached(username)
    if cacheable:
        _cache_set(username, result)
    return result


# shortcut: module-level requests.get kept (not Session) so existing
# tests mocking requests.get keep working; upgrade to a pooled Session
# + background job when metrics sync moves off the request thread.
def _fetch_github_stats_uncached(username: str) -> tuple:
    """Fetch from API. Returns (result, cacheable); failures are not cacheable."""
    result = {
        "total_repos": 0,
        "total_commits": 0,
        "languages": [],
        "top_language": None,
    }

    try:
        from collections import Counter
        from datetime import datetime, timedelta, timezone

        headers = _get_headers()

        # 1. Fetch user info for total repos
        user_url = f"{GITHUB_API_BASE}/users/{username}"
        user_resp = requests.get(user_url, headers=headers, timeout=10)

        if user_resp.status_code == 404:
            logger.warning(f"GitHub user not found: {username}")
            return result, False
        elif user_resp.status_code != 200:
            logger.warning(f"GitHub API returned {user_resp.status_code} for user {username}")
            return result, False

        result["total_repos"] = user_resp.json().get("public_repos", 0)

        # 2. Fetch up to 10 recently updated repos
        repos_url = f"{GITHUB_API_BASE}/users/{username}/repos?type=owner&sort=updated&per_page=10"
        repos_resp = requests.get(repos_url, headers=headers, timeout=10)

        if repos_resp.status_code != 200:
            return result, False

        repos = repos_resp.json()

        lang_counter = Counter()
        commits_count = 0

        one_year_ago = (datetime.now(timezone.utc) - timedelta(days=365)).isoformat().replace("+00:00", "Z")

        checked = 0
        for repo in repos:
            if repo.get("fork"):
                continue
            if checked >= 10:
                break
            checked += 1

            lang = repo.get("language")
            if lang:
                lang_counter[lang] += 1

            # 3. Fetch commits for this repo in last year
            commits_url = f"{GITHUB_API_BASE}/repos/{username}/{repo['name']}/commits?author={username}&since={one_year_ago}&per_page=100"
            try:
                c_resp = requests.get(commits_url, headers=headers, timeout=5)
                if c_resp.status_code == 200:
                    commits_count += len(c_resp.json())
            except requests.RequestException:
                pass # skip this repo if commit fetch fails (rate limit, timeout)

        result["total_commits"] = commits_count
        result["languages"] = list(lang_counter.keys())
        if lang_counter:
            result["top_language"] = lang_counter.most_common(1)[0][0]

        return result, True
    except requests.RequestException as e:
        logger.error(f"Error fetching GitHub stats for {username}: {e}")
        return result, False
    except Exception as e:
        logger.error(f"Unexpected error fetching GitHub stats for {username}: {e}")
        return result, False


def _github_cache_clear() -> None:
    _cache_clear()


fetch_github_stats.cache_clear = _github_cache_clear
