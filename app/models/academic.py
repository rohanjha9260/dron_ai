"""
Academic_History Model

Tracks historical and temporal academic progression per semester.
Each student can have multiple records (one per semester).

Schema:
    record_id (PK) | student_id (FK → users_master) | semester |
    cgpa | attendance_pct | active_backlogs | created_at

Indexes:
    - ix_academic_student_id  : speeds up per-student lookups
    - uq_student_semester     : ensures a student has at most one record per semester
"""

from datetime import datetime
from app.extensions import db


class AcademicHistory(db.Model):
    """SQLAlchemy model for the academic_history table."""

    __tablename__ = "academic_history"

    # ── Composite constraints / indexes declared at table level ────────────────
    __table_args__ = (
        # A student cannot have two rows for the same semester
        db.UniqueConstraint(
            "student_id", "semester", name="uq_student_semester"
        ),
        # Explicit index on student_id for fast per-student queries
        db.Index("ix_academic_student_id", "student_id"),
    )

    # ── Primary Key ────────────────────────────────────────────────────────────
    record_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # ── Foreign Key ────────────────────────────────────────────────────────────
    # ondelete="CASCADE" → when the parent user row is deleted, the DB engine
    # automatically deletes all matching academic_history rows.
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users_master.student_id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Academic Fields ────────────────────────────────────────────────────────
    semester = db.Column(db.Integer, nullable=False)          # e.g. 1 through 8
    cgpa = db.Column(db.Float, nullable=False)                # cumulative GPA
    attendance_pct = db.Column(db.Float, default=0.0)        # 0.0 – 100.0
    active_backlogs = db.Column(db.Integer, default=0)       # number of backlogs

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ── Serialization ──────────────────────────────────────────────────────────
    def to_dict(self):
        """Serialize academic record to a JSON-safe dictionary."""
        return {
            "record_id": self.record_id,
            "student_id": self.student_id,
            "semester": self.semester,
            "cgpa": self.cgpa,
            "attendance_pct": self.attendance_pct,
            "active_backlogs": self.active_backlogs,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<AcademicHistory student={self.student_id} sem={self.semester}>"
