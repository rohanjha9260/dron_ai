"""
Integration Tests

Unit tests with mocking for external API data fetchers:
    - GitHub REST API fetcher
    - LeetCode GraphQL fetcher
    - In-Memory TTL Cache utility
"""

import time
from unittest.mock import MagicMock, patch

import pytest

from app.integrations.github_fetcher import fetch_github_stats
from app.integrations.leetcode_fetcher import fetch_leetcode_stats
from app.utils.cache import InMemoryTTLCache


class TestInMemoryTTLCache:
    """Tests for thread-safe InMemoryTTLCache."""

    def test_cache_set_get_and_expiration(self):
        cache = InMemoryTTLCache(ttl_seconds=1, maxsize=2)
        cache.set("key1", {"val": 10})
        assert cache.get("key1") == {"val": 10}

        # Value is deepcopied: mutating retrieved value doesn't affect cache
        retrieved = cache.get("key1")
        retrieved["val"] = 999
        assert cache.get("key1") == {"val": 10}

        # Expiration
        time.sleep(1.05)
        assert cache.get("key1") is None

    def test_fifo_eviction_and_key_refresh(self):
        cache = InMemoryTTLCache(ttl_seconds=600, maxsize=2)
        cache.set("a", {"num": 1})
        cache.set("b", {"num": 2})
        assert len(cache) == 2

        # Updating existing key must NOT evict another key
        cache.set("a", {"num": 10})
        assert len(cache) == 2
        assert cache.get("a") == {"num": 10}
        assert cache.get("b") == {"num": 2}

        # Adding 3rd key evicts oldest ('b' since 'a' was refreshed)
        cache.set("c", {"num": 3})
        assert len(cache) == 2
        assert cache.get("b") is None
        assert cache.get("a") == {"num": 10}
        assert cache.get("c") == {"num": 3}


class TestGitHubFetcher:
    """Tests for GitHub REST API integration."""

    def test_fetch_public_user_stats(self):
        """Test fetching stats for a GitHub user with mocked responses."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = {
            "public_repos": 5,
            "followers": 12,
            "avatar_url": "https://example.com/avatar.png",
            "name": "Test User",
            "bio": "Open source developer",
        }

        mock_repos_resp = MagicMock()
        mock_repos_resp.status_code = 200
        mock_repos_resp.json.return_value = [
            {"name": "repo1", "fork": False, "language": "Python", "stargazers_count": 3, "forks_count": 1},
            {"name": "repo2", "fork": False, "language": "C++", "stargazers_count": 2, "forks_count": 0},
        ]

        mock_commits_resp = MagicMock()
        mock_commits_resp.status_code = 200
        mock_commits_resp.json.return_value = [{"sha": "123"}, {"sha": "456"}]

        with patch("requests.Session.get") as mock_get:
            mock_get.side_effect = [mock_user_resp, mock_repos_resp, mock_commits_resp, mock_commits_resp]
            stats = fetch_github_stats("test_dev_user_mock")

            assert isinstance(stats, dict)
            assert stats["total_repos"] == 5
            assert stats["total_commits"] == 4
            assert "Python" in stats["languages"]
            assert "C++" in stats["languages"]
            assert stats["total_stars"] == 5
            assert stats["total_forks"] == 1
            assert stats["followers"] == 12
            assert stats["avatar_url"] == "https://example.com/avatar.png"
            assert stats["name"] == "Test User"
            assert stats["language_distribution"]["Python"] == 1
            assert stats["language_distribution"]["C++"] == 1

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent user returns baseline defaults safely."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 404

        with patch("requests.Session.get") as mock_get:
            mock_get.return_value = mock_user_resp
            stats = fetch_github_stats("nonexistent_user_99999_mock")

            assert stats["total_repos"] == 0
            assert stats["total_commits"] == 0
            assert stats["languages"] == []
            assert stats["top_language"] is None
            assert stats["total_stars"] == 0
            assert stats["followers"] == 0

    def test_rate_limit_headers(self):
        """Test that rate limit (403) or network errors fail safely without crashing."""
        fetch_github_stats.cache_clear()

        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 403

        with patch("requests.Session.get") as mock_get:
            mock_get.return_value = mock_user_resp
            stats = fetch_github_stats("rate_limited_user_mock")

            assert stats["total_repos"] == 0
            assert stats["total_commits"] == 0

    def test_ttl_cache_expiration_and_casing(self):
        """Test that cached entries hit cache within TTL and usernames are case-normalized."""
        fetch_github_stats.cache_clear()

        mock_user = MagicMock(
            status_code=200,
            json=lambda: {"public_repos": 3, "followers": 2, "avatar_url": None, "name": None, "bio": None},
        )
        mock_repos = MagicMock(status_code=200, json=lambda: [])

        with patch("requests.Session.get", side_effect=[mock_user, mock_repos]) as mock_get:
            res1 = fetch_github_stats("Alice_Test")
            assert res1["total_repos"] == 3
            assert mock_get.call_count == 2

        # Second call with different casing hits cache (0 network calls)
        with patch("requests.Session.get") as mock_get_cached:
            res2 = fetch_github_stats("alice_test")
            mock_get_cached.assert_not_called()
            assert res2["total_repos"] == 3

    def test_cache_mutation_defense(self):
        """Test that modifying returned stats does not mutate the in-memory cache."""
        fetch_github_stats.cache_clear()

        mock_user = MagicMock(
            status_code=200,
            json=lambda: {"public_repos": 2, "followers": 1, "avatar_url": None, "name": None, "bio": None},
        )
        mock_repos = MagicMock(
            status_code=200,
            json=lambda: [{"name": "repo1", "fork": False, "language": "Python", "stargazers_count": 1, "forks_count": 0}],
        )
        mock_commits = MagicMock(status_code=200, json=lambda: [{"sha": "1"}])

        with patch("requests.Session.get", side_effect=[mock_user, mock_repos, mock_commits]):
            res1 = fetch_github_stats("mutation_tester")
            assert "Python" in res1["languages"]

            # Mutate local copy
            res1["languages"].append("MALICIOUS_INPUT")
            res1["total_repos"] = 999

        # Subsequent fetch from cache must remain uncorrupted
        res2 = fetch_github_stats("mutation_tester")
        assert "MALICIOUS_INPUT" not in res2["languages"]
        assert res2["total_repos"] == 2

    def test_username_input_sanitization(self):
        """Test invalid or non-string usernames reject safely without network calls."""
        fetch_github_stats.cache_clear()

        with patch("requests.Session.get") as mock_get:
            # Non-string input
            assert fetch_github_stats(12345)["total_repos"] == 0
            # Invalid characters
            assert fetch_github_stats("invalid/user$name")["total_repos"] == 0
            # None / Empty
            assert fetch_github_stats("")["total_repos"] == 0
            assert fetch_github_stats(None)["total_repos"] == 0
            mock_get.assert_not_called()


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
                    "profile": {
                        "realName": "Test Coder",
                        "ranking": 50000,
                        "reputation": 45,
                    },
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
                    "topPercentage": 4.5,
                }
            }
        }

        with patch("requests.Session.post") as mock_post:
            mock_post.side_effect = [mock_profile_resp, mock_contest_resp]
            stats = fetch_leetcode_stats("testcoder_mock")

            assert stats["problems_solved"] == 250
            assert stats["easy_solved"] == 100
            assert stats["medium_solved"] == 120
            assert stats["hard_solved"] == 30
            assert stats["contest_rating"] == 1680.5
            assert stats["ranking"] == 12000
            assert stats["real_name"] == "Test Coder"
            assert stats["reputation"] == 45
            assert stats["attended_contests"] == 8
            assert stats["top_percentage"] == 4.5

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent LeetCode user returns safe baseline zeros."""
        fetch_leetcode_stats.cache_clear()

        mock_profile_resp = MagicMock()
        mock_profile_resp.status_code = 200
        mock_profile_resp.json.return_value = {"data": {"matchedUser": None}}

        with patch("requests.Session.post") as mock_post:
            mock_post.return_value = mock_profile_resp
            stats = fetch_leetcode_stats("nonexistent_coder_99999_mock")

            assert stats["problems_solved"] == 0
            assert stats["easy_solved"] == 0
            assert stats["contest_rating"] == 0.0

    def test_failed_requests_do_not_pollute_cache(self):
        """Test that HTTP 429 or 500 does NOT get cached, allowing retry to succeed."""
        fetch_leetcode_stats.cache_clear()

        mock_429 = MagicMock(status_code=429)

        # 1. First call fails with rate limit 429
        with patch("requests.Session.post", return_value=mock_429):
            res_fail = fetch_leetcode_stats("bob_rate_limited")
            assert res_fail["problems_solved"] == 0

        # 2. Second call succeeds immediately because 429 was NOT cached
        mock_ok_profile = MagicMock(
            status_code=200,
            json=lambda: {
                "data": {
                    "matchedUser": {
                        "submitStats": {"acSubmissionNum": [{"difficulty": "All", "count": 42}]}
                    }
                }
            },
        )
        mock_ok_contest = MagicMock(status_code=200, json=lambda: {"data": {}})

        with patch("requests.Session.post", side_effect=[mock_ok_profile, mock_ok_contest]):
            res_ok = fetch_leetcode_stats("bob_rate_limited")
            assert res_ok["problems_solved"] == 42

    def test_leetcode_input_sanitization(self):
        """Test non-string or invalid LeetCode usernames reject safely without network calls."""
        fetch_leetcode_stats.cache_clear()

        with patch("requests.Session.post") as mock_post:
            assert fetch_leetcode_stats(99999)["problems_solved"] == 0
            assert fetch_leetcode_stats("bad@name!")["problems_solved"] == 0
            assert fetch_leetcode_stats("")["problems_solved"] == 0
            mock_post.assert_not_called()
