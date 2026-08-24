"""
Academic_History Model

Tracks historical and temporal academic progression per semester.
Each student can have multiple records (one per semester).

Schema:
    record_id (PK) | student_id (FK) | semester_index | cgpa | active_backlogs | attendance_pct
"""

from datetime import datetime
from app.extensions import db


class AcademicHistory(db.Model):
    """SQLAlchemy model for the Academic_History table."""

    __tablename__ = "academic_history"

    record_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(
        db.Integer, db.ForeignKey("users_master.student_id"), nullable=False
    )
    semester_index = db.Column(db.Integer, nullable=False)
    cgpa = db.Column(db.Float, nullable=False)
    active_backlogs = db.Column(db.Integer, default=0)
    attendance_pct = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Serialize academic record to dictionary."""
        return {
            "record_id": self.record_id,
            "student_id": self.student_id,
            "semester_index": self.semester_index,
            "cgpa": self.cgpa,
            "active_backlogs": self.active_backlogs,
            "attendance_pct": self.attendance_pct,
        }

    def __repr__(self):
        return f"<AcademicHistory student={self.student_id} sem={self.semester_index}>"
