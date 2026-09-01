"""
Platform_Links Model

Stores external profile identifiers used for data synchronization
with GitHub, LeetCode, and LinkedIn APIs.

One-to-one relationship with users_master (enforced via UNIQUE on student_id FK).

Schema:
    link_id (PK) | student_id (FK → users_master, UNIQUE) |
    github_username | leetcode_username | linkedin_url | last_synced
"""

from datetime import datetime
from app.extensions import db


class PlatformLink(db.Model):
    """SQLAlchemy model for the platform_links table."""

    __tablename__ = "platform_links"

    # ── Primary Key ────────────────────────────────────────────────────────────
    link_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Foreign Key ────────────────────────────────────────────────────────────
    # unique=True enforces the one-to-one constraint at the DB level.
    # ondelete="CASCADE" → row is removed automatically when the parent user is deleted.
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # ── Platform Identifiers ───────────────────────────────────────────────────
    github_username = db.Column(db.String(255), nullable=True)
    leetcode_username = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(500), nullable=True)

    # ── Sync Tracking ──────────────────────────────────────────────────────────
    # last_synced records when platform data was last pulled from external APIs.
    # This is semantically different from a generic updated_at — it only changes
    # when the integration service successfully fetches fresh data.
    last_synced = db.Column(db.DateTime, nullable=True)

    # ── Serialization ──────────────────────────────────────────────────────────
    def to_dict(self):
        """Serialize platform links to a JSON-safe dictionary."""
        return {
            "link_id": self.link_id,
            "student_id": self.student_id,
            "github_username": self.github_username,
            "leetcode_username": self.leetcode_username,
            "linkedin_url": self.linkedin_url,
            "last_synced": self.last_synced.isoformat() if self.last_synced else None,
        }

    def __repr__(self):
        return f"<PlatformLink student={self.student_id}>"
