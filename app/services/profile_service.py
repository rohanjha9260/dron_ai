"""
Profile Service

Handles:
    - Fetching complete student profile (user + academics + links + skills)
    - Updating profile fields across multiple tables
    - Academic history management
"""

from typing import Optional, Dict, Any
from app.extensions import db
from app.models import User, AcademicHistory, PlatformLink, SkillVector


def get_student_profile(student_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetch the complete aggregated profile for a student.

    Combines data from Users_Master, Academic_History,
    Platform_Links, and Skill_Vectors into a single consolidated response.

    Args:
        student_id: The student's primary key

    Returns:
        Dict containing user info, academic records, platform links, and skills,
        or None if student does not exist.
    """
    user = db.session.get(User, student_id)
    if not user:
        return None

    # Academic progression sorted chronologically by semester
    academics = (
        AcademicHistory.query.filter_by(student_id=student_id)
        .order_by(AcademicHistory.semester.asc())
        .all()
    )

    # Ensure platform link record exists
    platform_link = PlatformLink.query.filter_by(student_id=student_id).first()
    if not platform_link:
        platform_link = PlatformLink(student_id=student_id)
        db.session.add(platform_link)
        db.session.commit()

    # Ensure skill vector record exists
    skill_vector = SkillVector.query.filter_by(student_id=student_id).first()
    if not skill_vector:
        skill_vector = SkillVector(student_id=student_id)
        db.session.add(skill_vector)
        db.session.commit()

    links_dict = platform_link.to_dict() if platform_link else {}

    return {
        "user": user.to_dict(),
        "academics": [rec.to_dict() for rec in academics],
        "platform_links": links_dict,
        "links": links_dict,
        "skills": skill_vector.to_dict() if skill_vector else {},
    }


def update_student_profile(student_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update student profile across multiple tables with validation.

    Args:
        student_id: The student's primary key
        data: Dict with optional keys: full_name, cohort_year, academic_branch,
              academics (list), platform_links (dict), links (dict), skills (dict)

    Returns:
        Aggregated updated student profile dict.

    Raises:
        ValueError: If validation fails or student is not found.
    """
    user = db.session.get(User, student_id)
    if not user:
        raise ValueError("Profile not found")

    # 1. Update basic User profile attributes
    if "full_name" in data:
        full_name = data["full_name"]
        if not isinstance(full_name, str) or not full_name.strip():
            raise ValueError("full_name must be a non-empty string")
        user.full_name = full_name.strip()

    if "cohort_year" in data:
        cohort_year = data["cohort_year"]
        if cohort_year is not None:
            if not isinstance(cohort_year, int) or cohort_year < 1900 or cohort_year > 2100:
                raise ValueError("cohort_year must be a valid year between 1900 and 2100")
        user.cohort_year = cohort_year

    if "academic_branch" in data:
        branch = data["academic_branch"]
        user.academic_branch = branch.strip() if isinstance(branch, str) else None

    # 2. Upsert semester-wise academic records
    if "academics" in data:
        records = data["academics"]
        if not isinstance(records, list):
            raise ValueError("academics must be a list of semester records")

        for rec in records:
            if not isinstance(rec, dict):
                raise ValueError("Each academic record must be an object")

            # Support both 'semester' and 'semester_index'
            sem = rec.get("semester")
            if sem is None:
                sem = rec.get("semester_index")

            if sem is None or not isinstance(sem, int) or sem < 1 or sem > 12:
                raise ValueError("semester must be an integer between 1 and 12")

            # Validate CGPA
            cgpa = None
            if "cgpa" in rec and rec["cgpa"] is not None:
                try:
                    cgpa = float(rec["cgpa"])
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid cgpa for semester {sem}")
                if cgpa < 0.0 or cgpa > 10.0:
                    raise ValueError("cgpa must be between 0.0 and 10.0")

            # Validate Attendance %
            attendance = None
            if "attendance_pct" in rec and rec["attendance_pct"] is not None:
                try:
                    attendance = float(rec["attendance_pct"])
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid attendance_pct for semester {sem}")
                if attendance < 0.0 or attendance > 100.0:
                    raise ValueError("attendance_pct must be between 0.0 and 100.0")

            # Validate Backlogs
            backlogs = None
            if "active_backlogs" in rec and rec["active_backlogs"] is not None:
                try:
                    backlogs = int(rec["active_backlogs"])
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid active_backlogs for semester {sem}")
                if backlogs < 0:
                    raise ValueError("active_backlogs cannot be negative")

            # Upsert into database
            existing = AcademicHistory.query.filter_by(
                student_id=student_id, semester=sem
            ).first()

            if existing:
                if cgpa is not None:
                    existing.cgpa = cgpa
                if attendance is not None:
                    existing.attendance_pct = attendance
                if backlogs is not None:
                    existing.active_backlogs = backlogs
            else:
                if cgpa is None:
                    raise ValueError(f"cgpa is required for new academic record of semester {sem}")
                new_record = AcademicHistory(
                    student_id=student_id,
                    semester=sem,
                    cgpa=cgpa,
                    attendance_pct=attendance if attendance is not None else 0.0,
                    active_backlogs=backlogs if backlogs is not None else 0,
                )
                db.session.add(new_record)

    # 3. Upsert Platform Links
    link_data = data.get("platform_links")
    if link_data is None:
        link_data = data.get("links")

    if link_data is not None:
        if not isinstance(link_data, dict):
            raise ValueError("platform_links must be an object")

        pl = PlatformLink.query.filter_by(student_id=student_id).first()
        if not pl:
            pl = PlatformLink(student_id=student_id)
            db.session.add(pl)

        if "github_username" in link_data:
            pl.github_username = (
                link_data["github_username"].strip()
                if isinstance(link_data["github_username"], str)
                else None
            )
        elif "github_handle" in link_data:
            pl.github_username = (
                link_data["github_handle"].strip()
                if isinstance(link_data["github_handle"], str)
                else None
            )

        if "leetcode_username" in link_data:
            pl.leetcode_username = (
                link_data["leetcode_username"].strip()
                if isinstance(link_data["leetcode_username"], str)
                else None
            )

        if "linkedin_url" in link_data:
            pl.linkedin_url = (
                link_data["linkedin_url"].strip()
                if isinstance(link_data["linkedin_url"], str)
                else None
            )

    # 4. Upsert Skill Vector
    skill_data = data.get("skills")
    if skill_data is not None:
        if not isinstance(skill_data, dict):
            raise ValueError("skills must be an object")

        sv = SkillVector.query.filter_by(student_id=student_id).first()
        if not sv:
            sv = SkillVector(student_id=student_id)
            db.session.add(sv)

        score_fields = [
            "dsa_score",
            "python_prof",
            "cpp_prof",
            "aiml_knowledge",
            "communication_score",
        ]
        for field in score_fields:
            if field in skill_data and skill_data[field] is not None:
                try:
                    val = float(skill_data[field])
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid value for {field}")
                if val < 0.0 or val > 100.0:
                    raise ValueError(f"{field} must be between 0.0 and 100.0")
                setattr(sv, field, val)

        count_fields = [
            "total_commits",
            "problems_solved",
            "project_count",
            "internship_exp",
        ]
        for field in count_fields:
            if field in skill_data and skill_data[field] is not None:
                try:
                    val = int(skill_data[field])
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid value for {field}")
                if val < 0:
                    raise ValueError(f"{field} cannot be negative")
                setattr(sv, field, val)

        if "contest_rating" in skill_data and skill_data["contest_rating"] is not None:
            try:
                val = float(skill_data["contest_rating"])
            except (ValueError, TypeError):
                raise ValueError("Invalid value for contest_rating")
            if val < 0.0:
                raise ValueError("contest_rating cannot be negative")
            sv.contest_rating = val

    db.session.commit()
    return get_student_profile(student_id)


# Backwards compatibility aliases
get_full_profile = get_student_profile
update_profile = update_student_profile
