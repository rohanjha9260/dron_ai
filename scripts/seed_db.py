"""
Database Seeding Script

Populates the database with sample/test student data for development and demonstration.
Run this script to initialize or reset sample student accounts.

Usage:
    python scripts/seed_db.py          # Seeds if database is empty or demo accounts missing
    python scripts/seed_db.py --reset  # Clears existing tables and re-seeds cleanly
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import User, AcademicHistory, PlatformLink, SkillVector, MLPrediction
from app.services.auth_service import hash_password


SAMPLE_STUDENTS = [
    {
        "full_name": "Rohan Jha",
        "email": "rohan@dron.ai",
        "password": "password123",
        "cohort_year": 2026,
        "academic_branch": "Computer Science & Engineering",
        "academics": [
            {"semester": 1, "cgpa": 8.4, "attendance_pct": 94.0, "active_backlogs": 0},
            {"semester": 2, "cgpa": 8.6, "attendance_pct": 91.5, "active_backlogs": 0},
            {"semester": 3, "cgpa": 8.7, "attendance_pct": 90.0, "active_backlogs": 0},
            {"semester": 4, "cgpa": 8.8, "attendance_pct": 93.0, "active_backlogs": 0},
            {"semester": 5, "cgpa": 8.9, "attendance_pct": 95.0, "active_backlogs": 0},
            {"semester": 6, "cgpa": 8.92, "attendance_pct": 92.0, "active_backlogs": 0},
        ],
        "platform_links": {
            "github_username": "rohanjha9260",
            "leetcode_username": "rohan_jha",
            "linkedin_url": "https://linkedin.com/in/rohanjha",
        },
        "skills": {
            "dsa_score": 88.0,
            "python_prof": 92.0,
            "cpp_prof": 80.0,
            "aiml_knowledge": 85.0,
            "total_commits": 180,
            "problems_solved": 340,
            "contest_rating": 1720.0,
            "project_count": 5,
            "communication_score": 85.0,
            "internship_exp": 6,
        },
    },
    {
        "full_name": "Priya Sharma",
        "email": "priya@dron.ai",
        "password": "password123",
        "cohort_year": 2026,
        "academic_branch": "Information Technology",
        "academics": [
            {"semester": 1, "cgpa": 7.2, "attendance_pct": 82.0, "active_backlogs": 0},
            {"semester": 2, "cgpa": 7.4, "attendance_pct": 80.0, "active_backlogs": 0},
            {"semester": 3, "cgpa": 7.5, "attendance_pct": 79.0, "active_backlogs": 0},
            {"semester": 4, "cgpa": 7.6, "attendance_pct": 83.0, "active_backlogs": 0},
            {"semester": 5, "cgpa": 7.7, "attendance_pct": 81.0, "active_backlogs": 0},
            {"semester": 6, "cgpa": 7.65, "attendance_pct": 80.5, "active_backlogs": 0},
        ],
        "platform_links": {
            "github_username": "priyasharma_dev",
            "leetcode_username": "priya_s",
            "linkedin_url": "https://linkedin.com/in/priyasharma",
        },
        "skills": {
            "dsa_score": 62.0,
            "python_prof": 68.0,
            "cpp_prof": 55.0,
            "aiml_knowledge": 40.0,
            "total_commits": 45,
            "problems_solved": 110,
            "contest_rating": 1350.0,
            "project_count": 2,
            "communication_score": 75.0,
            "internship_exp": 0,
        },
    },
    {
        "full_name": "Alex Chen",
        "email": "alex@dron.ai",
        "password": "password123",
        "cohort_year": 2026,
        "academic_branch": "Electronics & Communication",
        "academics": [
            {"semester": 1, "cgpa": 6.2, "attendance_pct": 70.0, "active_backlogs": 1},
            {"semester": 2, "cgpa": 5.9, "attendance_pct": 68.0, "active_backlogs": 1},
            {"semester": 3, "cgpa": 5.7, "attendance_pct": 64.0, "active_backlogs": 2},
            {"semester": 4, "cgpa": 5.8, "attendance_pct": 65.0, "active_backlogs": 2},
            {"semester": 5, "cgpa": 5.85, "attendance_pct": 66.0, "active_backlogs": 1},
            {"semester": 6, "cgpa": 5.8, "attendance_pct": 65.0, "active_backlogs": 2},
        ],
        "platform_links": {
            "github_username": "alexchen_code",
            "leetcode_username": "alexc",
            "linkedin_url": "https://linkedin.com/in/alexchen",
        },
        "skills": {
            "dsa_score": 30.0,
            "python_prof": 40.0,
            "cpp_prof": 25.0,
            "aiml_knowledge": 20.0,
            "total_commits": 12,
            "problems_solved": 25,
            "contest_rating": 1100.0,
            "project_count": 1,
            "communication_score": 60.0,
            "internship_exp": 0,
        },
    },
]


def seed(reset=False):
    """Seed the database with sample student data."""
    app = create_app("development")

    with app.app_context():
        if reset:
            print("Resetting database tables...")
            db.drop_all()

        print("Ensuring database tables exist...")
        db.create_all()

        seeded_count = 0
        seeded_emails = []
        for student_data in SAMPLE_STUDENTS:
            existing = User.query.filter_by(email=student_data["email"]).first()
            if existing:
                print(f"Student {student_data['email']} already exists. Skipping.")
                continue

            # 1. Create User
            user = User(
                full_name=student_data["full_name"],
                email=student_data["email"],
                password_hash=hash_password(student_data["password"]),
                cohort_year=student_data["cohort_year"],
                academic_branch=student_data["academic_branch"],
            )
            db.session.add(user)
            db.session.flush()

            # 2. Create Academic History
            for rec in student_data["academics"]:
                acad = AcademicHistory(
                    student_id=user.student_id,
                    semester=rec["semester"],
                    cgpa=rec["cgpa"],
                    attendance_pct=rec["attendance_pct"],
                    active_backlogs=rec["active_backlogs"],
                )
                db.session.add(acad)

            # 3. Create Platform Links
            pl = student_data["platform_links"]
            link = PlatformLink(
                student_id=user.student_id,
                github_username=pl.get("github_username"),
                leetcode_username=pl.get("leetcode_username"),
                linkedin_url=pl.get("linkedin_url"),
            )
            db.session.add(link)

            # 4. Create Skill Vector
            sk = student_data["skills"]
            vector = SkillVector(
                student_id=user.student_id,
                dsa_score=sk.get("dsa_score", 0.0),
                python_prof=sk.get("python_prof", 0.0),
                cpp_prof=sk.get("cpp_prof", 0.0),
                aiml_knowledge=sk.get("aiml_knowledge", 0.0),
                total_commits=sk.get("total_commits", 0),
                problems_solved=sk.get("problems_solved", 0),
                contest_rating=sk.get("contest_rating", 0.0),
                project_count=sk.get("project_count", 0),
                communication_score=sk.get("communication_score", 0.0),
                internship_exp=sk.get("internship_exp", 0),
            )
            db.session.add(vector)
            seeded_count += 1
            seeded_emails.append(student_data["email"])

        db.session.commit()
        print(f"Sample data seeded successfully! ({seeded_count} new accounts added)")
        if seeded_emails:
            print("\nNewly Created Demo Accounts:")
            for s in SAMPLE_STUDENTS:
                if s["email"] in seeded_emails:
                    print(f"  - {s['full_name']}: {s['email']} (password: {s['password']})")


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed(reset=reset_flag)
