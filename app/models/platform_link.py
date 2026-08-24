"""
Platform_Links Model

Stores external profile identifiers for data synchronization.
One-to-one relationship with Users_Master.

Schema:
    link_id (PK) | student_id (FK) | github_handle | leetcode_username | linkedin_url
"""

from datetime import datetime
from app.extensions import db


class PlatformLink(db.Model):
    """SQLAlchemy model for the Platform_Links table."""

    __tablename__ = "platform_links"

    link_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id"),
        unique=True,
        nullable=False,
    )
    github_handle = db.Column(db.String(255), nullable=True)
    leetcode_username = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(500), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Serialize platform links to dictionary."""
        return {
            "link_id": self.link_id,
            "student_id": self.student_id,
            "github_handle": self.github_handle,
            "leetcode_username": self.leetcode_username,
            "linkedin_url": self.linkedin_url,
        }

    def __repr__(self):
        return f"<PlatformLink student={self.student_id}>"
