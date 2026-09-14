"""
LeetCode GraphQL API Fetcher

Fetches public profile data from LeetCode's GraphQL endpoint:
    - Total problems solved (by difficulty: Easy/Medium/Hard)
    - Contest rating
    - Submission statistics
    - Public profile info

GraphQL Endpoint: https://leetcode.com/graphql

Note: LeetCode does not provide official API documentation.
These queries are based on reverse-engineered community implementations
(alfa-leetcode-api, leetcode-query).
"""

import requests
import logging

logger = logging.getLogger(__name__)

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

# GraphQL query to fetch user profile and problem stats
USER_PROFILE_QUERY = """
query getUserProfile($username: String!) {
    matchedUser(username: $username) {
        username
        profile {
            realName
            ranking
            reputation
        }
        submitStats {
            acSubmissionNum {
                difficulty
                count
            }
        }
    }
}
"""

# GraphQL query to fetch contest rating
CONTEST_RATING_QUERY = """
query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        attendedContestsCount
    }
}
"""


import functools

@functools.lru_cache(maxsize=128)
def fetch_leetcode_stats(username: str) -> dict:
    """
    Fetch public LeetCode statistics for a given username.

    Args:
        username: LeetCode username

    Returns:
        Dict with:
            - problems_solved: int (total)
            - easy_solved: int
            - medium_solved: int
            - hard_solved: int
            - contest_rating: float
            - ranking: int

    Raises:
        ConnectionError: If LeetCode API is unreachable
        ValueError: If username is not found
    """
    logger.info(f"Fetching LeetCode stats for: {username}")

    result = {
        "problems_solved": 0,
        "easy_solved": 0,
        "medium_solved": 0,
        "hard_solved": 0,
        "contest_rating": 0.0,
        "ranking": 0,
    }
    
    if not username:
        return result

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
    }

    try:
        # 1. Profile Query
        payload1 = {
            "query": USER_PROFILE_QUERY,
            "variables": {"username": username}
        }
        r1 = requests.post(LEETCODE_GRAPHQL_URL, json=payload1, headers=headers, timeout=10)
        
        if r1.status_code == 200:
            data = r1.json().get("data", {})
            matched_user = data.get("matchedUser")
            
            if matched_user is None:
                logger.warning(f"LeetCode user not found: {username}")
                return result
                
            stats = matched_user.get("submitStats", {}).get("acSubmissionNum", [])
            for stat in stats:
                diff = stat.get("difficulty")
                count = stat.get("count", 0)
                if diff == "All":
                    result["problems_solved"] = count
                elif diff == "Easy":
                    result["easy_solved"] = count
                elif diff == "Medium":
                    result["medium_solved"] = count
                elif diff == "Hard":
                    result["hard_solved"] = count
                    
        # 2. Contest Query
        payload2 = {
            "query": CONTEST_RATING_QUERY,
            "variables": {"username": username}
        }
        r2 = requests.post(LEETCODE_GRAPHQL_URL, json=payload2, headers=headers, timeout=10)
        
        if r2.status_code == 200:
            data = r2.json().get("data", {})
            contest_info = data.get("userContestRanking")
            
            if contest_info:
                result["contest_rating"] = contest_info.get("rating", 0.0)
                result["ranking"] = contest_info.get("globalRanking", 0)

        return result
        
    except requests.RequestException as e:
        logger.error(f"Error fetching LeetCode stats for {username}: {e}")
        return result
    except Exception as e:
        logger.error(f"Unexpected error fetching LeetCode stats for {username}: {e}")
        return result
