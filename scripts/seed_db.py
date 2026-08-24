"""
Database Seeding Script

Populates the database with sample/test data for development.
Run this script after creating the database tables.

Usage:
    python scripts/seed_db.py
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models import User, AcademicHistory, PlatformLink, SkillVector


def seed():
    """Seed the database with sample student data."""
    app = create_app("development")

    with app.app_context():
        print("Creating database tables...")
        db.create_all()

        # Check if data already exists
        if User.query.first():
            print("Database already has data. Skipping seed.")
            return

        print("Seeding sample data...")

        # TODO: Add sample students
        # 1. Create 3-5 sample User records
        # 2. Create Academic_History records for each
        # 3. Create Platform_Links for each
        # 4. Create Skill_Vectors for each
        # 5. Commit to database

        print("Sample data seeded successfully!")


if __name__ == "__main__":
    seed()
