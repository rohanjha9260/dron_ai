"""
Dron-AI Database Models Package

Exports all SQLAlchemy ORM models for easy importing.
"""

from app.models.user import User
from app.models.academic import AcademicHistory
from app.models.platform_link import PlatformLink
from app.models.skill_vector import SkillVector
from app.models.prediction import MLPrediction

__all__ = [
    "User",
    "AcademicHistory",
    "PlatformLink",
    "SkillVector",
    "MLPrediction",
]
