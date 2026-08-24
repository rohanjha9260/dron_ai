"""
Integration Tests

Tests for external API data fetchers:
    - GitHub REST API fetcher
    - LeetCode GraphQL fetcher
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestGitHubFetcher:
    """Tests for GitHub REST API integration."""

    def test_fetch_public_user_stats(self):
        """Test fetching stats for a known public GitHub user."""
        # TODO: Implement (use a well-known public profile for testing)
        pass

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent user raises ValueError."""
        # TODO: Implement
        pass

    def test_rate_limit_headers(self):
        """Test that rate limit info is properly handled."""
        # TODO: Implement
        pass


class TestLeetCodeFetcher:
    """Tests for LeetCode GraphQL integration."""

    def test_fetch_public_user_stats(self):
        """Test fetching stats for a known public LeetCode user."""
        # TODO: Implement
        pass

    def test_fetch_nonexistent_user(self):
        """Test that fetching a non-existent user raises ValueError."""
        # TODO: Implement
        pass
