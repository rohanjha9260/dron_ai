"""
Metrics Service

Handles:
    - Orchestrating GitHub and LeetCode data fetching
    - Updating Skill_Vectors and Platform_Links with fetched data
    - Normalizing external metrics into internal score format
"""

from datetime import datetime
from typing import Optional, Dict, Any

from app.extensions import db
from app.models import User, PlatformLink, SkillVector
from integrations.github_fetcher import fetch_github_stats
from integrations.leetcode_fetcher import fetch_leetcode_stats


def fetch_and_update_metrics(
    student_id: int,
    github_handle: Optional[str] = None,
    leetcode_username: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Fetch public profile data from GitHub and LeetCode, then
    update the student's Platform_Links and Skill_Vectors.

    This is called synchronously during the request flow.

    Args:
        student_id: The student's primary key
        github_handle: GitHub username (optional)
        leetcode_username: LeetCode username (optional)

    Returns:
        Dict with fetched GitHub and LeetCode stats formatted for the API response.

    Raises:
        ValueError: If student does not exist or neither handle is provided.
    """
    user = db.session.get(User, student_id)
    if not user:
        raise ValueError("Student not found")

    platform_link = PlatformLink.query.filter_by(student_id=student_id).first()
    if not platform_link:
        platform_link = PlatformLink(student_id=student_id)
        db.session.add(platform_link)

    skill_vector = SkillVector.query.filter_by(student_id=student_id).first()
    if not skill_vector:
        skill_vector = SkillVector(student_id=student_id)
        db.session.add(skill_vector)

    # Normalize inputs or fall back to saved handles if omitted in payload
    gh = (github_handle or "").strip() or (platform_link.github_username or "").strip()
    lc = (leetcode_username or "").strip() or (platform_link.leetcode_username or "").strip()

    if not gh and not lc:
        raise ValueError("At least one handle/username is required")

    result: Dict[str, Any] = {}
    now = datetime.utcnow()

    # 1. Fetch and process GitHub stats
    if gh:
        github_stats = fetch_github_stats(gh)
        platform_link.github_username = gh
        platform_link.last_synced = now

        total_commits = github_stats.get("total_commits", 0)
        skill_vector.total_commits = total_commits

        result["github"] = {
            "total_commits": total_commits,
            "repos": github_stats.get("total_repos", 0),
            "languages": github_stats.get("languages", []),
            "top_language": github_stats.get("top_language"),
        }

    # 2. Fetch and process LeetCode stats
    if lc:
        leetcode_stats = fetch_leetcode_stats(lc)
        platform_link.leetcode_username = lc
        platform_link.last_synced = now

        problems_solved = leetcode_stats.get("problems_solved", 0)
        skill_vector.problems_solved = problems_solved

        contest_rating = leetcode_stats.get("contest_rating", 0.0)
        if contest_rating and contest_rating > 0.0:
            skill_vector.contest_rating = float(contest_rating)

        # Dynamic refinement of DSA proficiency score if problems solved
        if problems_solved > 0:
            calculated_dsa = min(100.0, problems_solved / 3.0)
            current_dsa = skill_vector.dsa_score or 0.0
            skill_vector.dsa_score = max(current_dsa, round(calculated_dsa, 1))

        result["leetcode"] = {
            "problems_solved": problems_solved,
            "easy": leetcode_stats.get("easy_solved", 0),
            "medium": leetcode_stats.get("medium_solved", 0),
            "hard": leetcode_stats.get("hard_solved", 0),
            "rating": contest_rating,
            "ranking": leetcode_stats.get("ranking", 0),
        }

    # 3. Commit database transaction
    db.session.commit()

    return result
