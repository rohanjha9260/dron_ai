"""
Integration Tests

Unit tests with mocking for external API data fetchers:
    - GitHub REST API fetcher
    - LeetCode GraphQL fetcher
"""

import pytest
from unittest.mock import patch, MagicMock

from app.integrations.github_fetcher import fetch_github_stats
from app.integrations.leetcode_fetcher import fetch_leetcode_stats


class TestGitHubFetcher:
    """Tests for GitHub REST API integration."""

    def test_fetch_public_user_stats(self):
        """Test fetching stats for a GitHub user with mocked responses."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = {"public_repos": 5}

        mock_repos_resp = MagicMock()
        mock_repos_resp.status_code = 200
        mock_repos_resp.json.return_value = [
            {"name": "repo1", "fork": False, "language": "Python"},
            {"name": "repo2", "fork": False, "language": "C++"},
        ]

        mock_commits_resp = MagicMock()
        mock_commits_resp.status_code = 200
        mock_commits_resp.json.return_value = [{"sha": "123"}, {"sha": "456"}]

        with patch("requests.get") as mock_get:
            mock_get.side_effect = [mock_user_resp, mock_repos_resp, mock_commits_resp, mock_commits_resp]
            stats = fetch_github_stats("test_dev_user_mock")

            assert isinstance(stats, dict)
            assert stats["total_repos"] == 5
            assert stats["total_commits"] == 4
            assert "Python" in stats["languages"]
            assert "C++" in stats["languages"]

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent user returns baseline defaults safely."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 404

        with patch("requests.get") as mock_get:
            mock_get.return_value = mock_user_resp
            stats = fetch_github_stats("nonexistent_user_99999_mock")

            assert stats["total_repos"] == 0
            assert stats["total_commits"] == 0
            assert stats["languages"] == []
            assert stats["top_language"] is None

    def test_rate_limit_headers(self):
        """Test that rate limit (403) or network errors fail safely without crashing."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 403

        with patch("requests.get") as mock_get:
            mock_get.return_value = mock_user_resp
            stats = fetch_github_stats("rate_limited_user_mock")

            assert stats["total_repos"] == 0
            assert stats["total_commits"] == 0


class TestLeetCodeFetcher:
    """Tests for LeetCode GraphQL integration."""

    def test_fetch_public_user_stats(self):
        """Test fetching stats for a LeetCode user with mocked GraphQL responses."""
        fetch_leetcode_stats.cache_clear()

        mock_profile_resp = MagicMock()
        mock_profile_resp.status_code = 200
        mock_profile_resp.json.return_value = {
            "data": {
                "matchedUser": {
                    "username": "testcoder",
                    "profile": {"ranking": 50000},
                    "submitStats": {
                        "acSubmissionNum": [
                            {"difficulty": "All", "count": 250},
                            {"difficulty": "Easy", "count": 100},
                            {"difficulty": "Medium", "count": 120},
                            {"difficulty": "Hard", "count": 30},
                        ]
                    },
                }
            }
        }

        mock_contest_resp = MagicMock()
        mock_contest_resp.status_code = 200
        mock_contest_resp.json.return_value = {
            "data": {
                "userContestRanking": {
                    "rating": 1680.5,
                    "globalRanking": 12000,
                    "attendedContestsCount": 8,
                }
            }
        }

        with patch("requests.post") as mock_post:
            mock_post.side_effect = [mock_profile_resp, mock_contest_resp]
            stats = fetch_leetcode_stats("testcoder_mock")

            assert stats["problems_solved"] == 250
            assert stats["easy_solved"] == 100
            assert stats["medium_solved"] == 120
            assert stats["hard_solved"] == 30
            assert stats["contest_rating"] == 1680.5

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent LeetCode user returns safe baseline zeros."""
        fetch_leetcode_stats.cache_clear()

        mock_profile_resp = MagicMock()
        mock_profile_resp.status_code = 200
        mock_profile_resp.json.return_value = {"data": {"matchedUser": None}}

        with patch("requests.post") as mock_post:
            mock_post.return_value = mock_profile_resp
            stats = fetch_leetcode_stats("nonexistent_coder_99999_mock")

            assert stats["problems_solved"] == 0
            assert stats["easy_solved"] == 0
            assert stats["contest_rating"] == 0.0
