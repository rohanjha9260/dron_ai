"""
Roadmap Generator

Converts skill-gap analysis results into a sequenced, phased
preparation plan. Each phase targets a specific weakness with
concrete tasks and estimated timelines.

Logic Chain: "Prediction tells where you stand. Personalization tells you what to do next."
"""

import math
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def _sanitize_metric(val: Any) -> float:
    """Sanitize float metric values by converting NaN, +Inf, -Inf, or invalid types to 0.0."""
    try:
        fval = float(val)
        if math.isnan(fval) or math.isinf(fval):
            return 0.0
        return fval
    except (ValueError, TypeError):
        return 0.0

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
    "contest_rating": {
        "title": "Boost Competitive Programming Contest Rating",
        "tasks": [
            "Participate in weekly LeetCode and competitive programming contests",
            "Analyze and upsolve problems missed during contest rounds",
            "Study speed optimization and time complexity under pressure",
            "Target advancing global ranking and rating tier",
        ],
        "duration": "6 weeks",
    },
    "cgpa": {
        "title": "Improve Academic CGPA",
        "tasks": [
            "Review core syllabus and previous examination question papers",
            "Establish structured daily study routines for upcoming semester exams",
            "Attend academic office hours and subject tutorial sessions",
            "Target score improvement in low-grade subjects",
        ],
        "duration": "8 weeks",
    },
    "attendance_pct": {
        "title": "Improve Academic Attendance",
        "tasks": [
            "Maintain consistent daily lecture and laboratory attendance",
            "Track attendance weekly against institutional threshold",
            "Coordinate with academic advisors on condonation/leave policies",
            "Avoid unauthorized absences",
        ],
        "duration": "4 weeks",
    },
    "active_backlogs": {
        "title": "Clear Active Academic Backlogs",
        "tasks": [
            "Register for supplementary examinations at the earliest opportunity",
            "Prepare focused study plans for each backlog subject",
            "Solve past 5 years' university question papers",
            "Complete necessary remedial classes and internal assessments",
        ],
        "duration": "6 weeks",
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
                "priority": "high",
                "milestone": "Reach target proficiency of 90.0 (current: 40.0)"
            },
            ...
        ]
    """
    if not skill_gaps or max_phases <= 0:
        return []

    top_gaps = skill_gaps[:max_phases]
    plan = []

    for idx, gap_item in enumerate(top_gaps, start=1):
        skill = str(gap_item.get("skill", ""))
        current = _sanitize_metric(gap_item.get("current", 0.0))
        required = _sanitize_metric(gap_item.get("required", 0.0))
        gap_val = _sanitize_metric(gap_item.get("gap", 0.0))
        gap_pct_val = _sanitize_metric(gap_item.get("gap_pct", 0.0))

        info = SKILL_IMPROVEMENT_MAP.get(
            skill,
            {
                "title": f"Improve {skill.replace('_', ' ').title()}",
                "tasks": [
                    f"Study fundamental concepts of {skill.replace('_', ' ')}",
                    f"Complete hands-on practice exercises in {skill.replace('_', ' ')}",
                    "Work on practical project applications",
                    "Assess progress through periodic practice evaluations",
                ],
                "duration": "4 weeks",
            },
        )

        # Assign priority based on sequence / severity
        if idx <= 2:
            priority = "high"
        elif idx <= 4:
            priority = "medium"
        else:
            priority = "low"

        milestone = f"Achieve target {skill.replace('_', ' ')} of {required} (current: {current}, gap: {gap_val})"

        phase_dict = {
            "phase": idx,
            "title": info["title"],
            "skill": skill,
            "duration": info["duration"],
            "tasks": list(info["tasks"]),
            "priority": priority,
            "milestone": milestone,
            "current": current,
            "required": required,
            "gap": gap_val,
            "gap_pct": gap_pct_val,
        }
        plan.append(phase_dict)

    return plan
