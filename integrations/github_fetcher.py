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
    # TODO: Implement
    # 1. Fetch user's public repos: GET /users/{username}/repos
    # 2. For each repo, fetch commit count
    # 3. Aggregate language stats across repos
    # 4. Calculate total commits
    # 5. Return structured stats dict
    logger.info(f"Fetching GitHub stats for: {username}")

    result = {
        "total_repos": 0,
        "total_commits": 0,
        "languages": [],
        "top_language": None,
    }

    # Placeholder - to be implemented
    return result
