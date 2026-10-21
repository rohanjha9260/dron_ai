"""
Input Sanitizer

Provides functions to sanitize and validate user inputs to prevent:
    - Cross-Site Scripting (XSS) attacks
    - SQL Injection (handled by ORM, but defense-in-depth)
    - Malicious HTML in text fields

All user-facing string inputs should pass through these functions
before being stored in the database or processed by ML models.
"""

import re
import html
import math
from typing import Any, Dict, List, Optional, Union

# Pattern to detect and strip script tags and their content
SCRIPT_TAG_PATTERN = re.compile(r"<script.*?>.*?</script>", re.IGNORECASE | re.DOTALL)
# Pattern to strip any remaining HTML/XML tags
HTML_TAG_PATTERN = re.compile(r"<[^>]+>")


def strip_html(value: str) -> str:
    """
    Remove all HTML and script tags from an input string.

    Args:
        value: Raw string possibly containing HTML/script tags.

    Returns:
        String with script blocks and HTML tags stripped.
    """
    if not isinstance(value, str):
        return value
    # 1. Remove script elements completely including body
    no_scripts = SCRIPT_TAG_PATTERN.sub("", value)
    # 2. Strip remaining HTML tags
    no_tags = HTML_TAG_PATTERN.sub("", no_scripts)
    return no_tags


def sanitize_string(value: str, strip_tags: bool = True, escape: bool = False) -> str:
    """
    Sanitize a string input by stripping HTML/script tags.

    HTML entity escaping is omitted by default so that characters such as
    quotes (e.g. O'Brien) or URL parameters (?a=1&b=2) are stored correctly
    without double-escaping issues. Escaping should happen at render time.

    Args:
        value: Raw string input from the user
        strip_tags: If True, strips HTML/script tags
        escape: If True, escapes HTML entities (default: False)

    Returns:
        Sanitized string safe for storage and processing
    """
    if not isinstance(value, str):
        return value
    cleaned = strip_html(value) if strip_tags else value
    cleaned = cleaned.strip()
    return html.escape(cleaned) if escape else cleaned


def sanitize_input(data: Any) -> Any:
    """
    Recursively sanitize strings inside dicts, lists, or primitive values.
    Strips HTML and script tags without HTML-escaping characters.

    Args:
        data: Arbitrary structure (dict, list, str, int, etc.)

    Returns:
        Structure with all string values stripped of HTML tags and trimmed.
    """
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        return sanitize_string(data, strip_tags=True, escape=False)
    return data


def validate_numeric_bounds(
    value: Union[int, float],
    min_val: Optional[Union[int, float]] = None,
    max_val: Optional[Union[int, float]] = None,
    field_name: str = "field",
) -> Union[int, float]:
    """
    Enforce numeric bounds on inputs and reject non-finite values (NaN, Inf).

    Args:
        value: Number to validate
        min_val: Minimum acceptable value (inclusive)
        max_val: Maximum acceptable value (inclusive)
        field_name: Name of the field for error reporting

    Returns:
        The validated value

    Raises:
        ValueError: If value is non-numeric, non-finite, or outside [min_val, max_val]
    """
    if value is None:
        raise ValueError(f"{field_name} cannot be None")
    try:
        num = float(value)
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be a valid number, got: {value}")

    if not math.isfinite(num):
        raise ValueError(f"{field_name} must be a finite number")

    if min_val is not None and num < min_val:
        raise ValueError(
            f"{field_name} must be greater than or equal to {min_val}, got: {num}"
        )
    if max_val is not None and num > max_val:
        raise ValueError(
            f"{field_name} must be less than or equal to {max_val}, got: {num}"
        )
    return value


def validate_cgpa(cgpa: Union[int, float]) -> float:
    """Validate cumulative GPA bounds (0.0 - 10.0)."""
    validate_numeric_bounds(cgpa, min_val=0.0, max_val=10.0, field_name="cgpa")
    return float(cgpa)


def validate_attendance(attendance: Union[int, float]) -> float:
    """Validate academic attendance percentage bounds (0.0 - 100.0)."""
    validate_numeric_bounds(
        attendance, min_val=0.0, max_val=100.0, field_name="attendance_pct"
    )
    return float(attendance)


def validate_backlogs(backlogs: Union[int, float]) -> int:
    """Validate active backlogs (non-negative integer)."""
    validate_numeric_bounds(backlogs, min_val=0, field_name="active_backlogs")
    return int(backlogs)


def validate_skill_score(score: Union[int, float], field_name: str = "skill_score") -> float:
    """Validate skill proficiency score (0.0 - 100.0)."""
    validate_numeric_bounds(score, min_val=0.0, max_val=100.0, field_name=field_name)
    return float(score)


def sanitize_url(url: str) -> str:
    """
    Validate and sanitize a URL input.

    Args:
        url: Raw URL string

    Returns:
        Validated URL string

    Raises:
        ValueError: If URL format is invalid
    """
    if not url:
        return ""
    url = url.strip()
    # Basic URL validation
    url_pattern = re.compile(
        r"^https?://"
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
        r"localhost|"
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
        r"(?::\d+)?"
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )
    if not url_pattern.match(url):
        raise ValueError(f"Invalid URL format: {url}")
    return url


def sanitize_username(username: str) -> str:
    """
    Validate and sanitize a platform username (GitHub/LeetCode).

    Only allows alphanumeric characters, hyphens, and underscores.

    Args:
        username: Raw username string

    Returns:
        Sanitized username

    Raises:
        ValueError: If username contains invalid characters
    """
    if not username:
        return ""
    username = username.strip()
    if not re.match(r"^[a-zA-Z0-9_-]+$", username):
        raise ValueError(f"Invalid username format: {username}")
    return username
