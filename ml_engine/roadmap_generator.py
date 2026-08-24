"""
Roadmap Generator

Converts skill-gap analysis results into a sequenced, phased
preparation plan. Each phase targets a specific weakness with
concrete tasks and estimated timelines.

Logic Chain: "Prediction tells where you stand. Personalization tells you what to do next."
"""

import logging

logger = logging.getLogger(__name__)

# Mapping of skill dimensions to actionable improvement phases
SKILL_IMPROVEMENT_MAP = {
    "dsa_score": {
        "title": "Master Data Structures & Algorithms",
        "tasks": [
            "Complete 50 Easy problems on LeetCode",
            "Study Arrays, Linked Lists, and Stacks",
            "Practice 30 Medium problems (Trees, Graphs, DP)",
            "Participate in 4 weekly LeetCode contests",
        ],
        "duration": "6 weeks",
    },
    "python_prof": {
        "title": "Strengthen Python Proficiency",
        "tasks": [
            "Complete Python OOP and decorators practice",
            "Build 2 Python automation scripts",
            "Learn Python libraries: NumPy, Pandas basics",
            "Contribute to an open-source Python project",
        ],
        "duration": "4 weeks",
    },
    "cpp_prof": {
        "title": "Strengthen C++ Proficiency",
        "tasks": [
            "Review C++ STL containers and algorithms",
            "Solve 30 competitive programming problems in C++",
            "Practice memory management and pointers",
            "Build a small project using C++",
        ],
        "duration": "4 weeks",
    },
    "aiml_knowledge": {
        "title": "Build AI/ML Foundations",
        "tasks": [
            "Complete ML fundamentals course",
            "Implement linear regression from scratch",
            "Study classification algorithms (SVM, Decision Trees)",
            "Build an end-to-end ML mini project",
        ],
        "duration": "5 weeks",
    },
    "total_commits": {
        "title": "Increase GitHub Activity & Project Portfolio",
        "tasks": [
            "Create 2 new project repositories",
            "Commit code daily for 30 days",
            "Write proper README documentation",
            "Contribute to 1 open-source project",
        ],
        "duration": "4 weeks",
    },
    "problems_solved": {
        "title": "Increase Problem-Solving Volume",
        "tasks": [
            "Set daily target of 2 LeetCode problems",
            "Focus on top interview questions",
            "Review editorial solutions for hard problems",
            "Practice timed problem-solving sessions",
        ],
        "duration": "6 weeks",
    },
    "project_count": {
        "title": "Build Full-Stack Projects",
        "tasks": [
            "Plan and build a web application end-to-end",
            "Deploy project to a live hosting platform",
            "Implement authentication and database integration",
            "Document the project for portfolio presentation",
        ],
        "duration": "5 weeks",
    },
    "communication_score": {
        "title": "Improve Communication & Soft Skills",
        "tasks": [
            "Practice mock technical interviews (3 sessions)",
            "Prepare and deliver a 5-minute tech presentation",
            "Write technical blog posts (2 articles)",
            "Schedule mock HR interview sessions",
        ],
        "duration": "3 weeks",
    },
    "internship_exp": {
        "title": "Gain Practical Experience",
        "tasks": [
            "Apply to internship programs (5+ applications)",
            "Work on freelance projects or volunteering",
            "Build a project simulating real-world requirements",
            "Network on LinkedIn with industry professionals",
        ],
        "duration": "8 weeks",
    },
}


def generate_plan(skill_gaps: list, max_phases: int = 5) -> list:
    """
    Generate a sequenced preparation roadmap from skill gaps.

    Args:
        skill_gaps: Sorted list of skill gap dicts from gap_analyzer
        max_phases: Maximum number of phases to include

    Returns:
        List of phase dicts:
        [
            {
                "phase": 1,
                "title": "Master Core DSA",
                "skill": "dsa_score",
                "duration": "6 weeks",
                "tasks": [...],
                "priority": "high"
            },
            ...
        ]
    """
    # TODO: Implement
    # 1. Take top max_phases gaps
    # 2. Map each gap to SKILL_IMPROVEMENT_MAP
    # 3. Assign phase numbers and priority levels
    # 4. Return ordered phase list
    pass
