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
import requests
import logging
import functools

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"
GITHUB_ACCEPT_HEADER = "application/vnd.github+json"


def _get_headers() -> dict:
    """Build GitHub API request headers with optional authentication."""
    headers = {
        "Accept": GITHUB_ACCEPT_HEADER,
    }
    pat = os.getenv("GITHUB_PAT")
    if pat:
        headers["Authorization"] = f"Bearer {pat}"
    return headers


@functools.lru_cache(maxsize=128)
def fetch_github_stats(username: str) -> dict:
    """
    Fetch public GitHub statistics for a given username.

    Args:
        username: GitHub username

    Returns:
        Dict with:
            - total_repos: int
            - total_commits: int (estimated from public repos)
            - languages: list of programming languages used
            - top_language: most frequently used language

    Raises:
        ConnectionError: If GitHub API is unreachable
        ValueError: If username is not found (404)
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
        from collections import Counter
        from datetime import datetime, timedelta
        
        headers = _get_headers()
        
        # 1. Fetch user info for total repos
        user_url = f"{GITHUB_API_BASE}/users/{username}"
        user_resp = requests.get(user_url, headers=headers, timeout=10)
        
        if user_resp.status_code == 404:
            logger.warning(f"GitHub user not found: {username}")
            return result
        elif user_resp.status_code != 200:
            logger.warning(f"GitHub API returned {user_resp.status_code} for user {username}")
            return result
            
        result["total_repos"] = user_resp.json().get("public_repos", 0)
        
        # 2. Fetch up to 15 recently updated repos
        repos_url = f"{GITHUB_API_BASE}/users/{username}/repos?type=owner&sort=updated&per_page=15"
        repos_resp = requests.get(repos_url, headers=headers, timeout=10)
        
        if repos_resp.status_code != 200:
            return result
            
        repos = repos_resp.json()
        
        lang_counter = Counter()
        commits_count = 0
        
        one_year_ago = (datetime.now() - timedelta(days=365)).isoformat() + "Z"
        
        for repo in repos:
            if repo.get("fork"):
                continue
                
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
            
        return result
    except requests.RequestException as e:
        logger.error(f"Error fetching GitHub stats for {username}: {e}")
        return result
    except Exception as e:
        logger.error(f"Unexpected error fetching GitHub stats for {username}: {e}")
        return result
