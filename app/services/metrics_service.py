"""
Metrics Service

Handles:
    - Orchestrating GitHub and LeetCode data fetching
    - Updating Skill_Vectors and Platform_Links with fetched data
    - Normalizing external metrics into internal score format
"""

from app.extensions import db
from app.models import PlatformLink, SkillVector
from integrations.github_fetcher import fetch_github_stats
from integrations.leetcode_fetcher import fetch_leetcode_stats


def fetch_and_update_metrics(student_id: int, github_handle: str = None, leetcode_username: str = None) -> dict:
    """
    Fetch public profile data from GitHub and LeetCode, then
    update the student's Platform_Links and Skill_Vectors.

    This is called synchronously during the request flow.

    Args:
        student_id: The student's primary key
        github_handle: GitHub username (optional)
        leetcode_username: LeetCode username (optional)

    Returns:
        Dict with fetched GitHub and LeetCode stats

    Raises:
        ValueError: If neither handle is provided
    """
    # TODO: Implement
    # 1. Validate at least one handle is provided
    # 2. Fetch GitHub stats if handle provided
    # 3. Fetch LeetCode stats if username provided
    # 4. Update Platform_Links with handles
    # 5. Update Skill_Vectors with extracted metrics
    # 6. Commit and return combined results
    pass
