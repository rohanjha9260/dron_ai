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


def sanitize_string(value: str) -> str:
    """
    Sanitize a string input by escaping HTML entities.

    Args:
        value: Raw string input from the user

    Returns:
        Sanitized string safe for storage and display
    """
    if not isinstance(value, str):
        return value
    return html.escape(value.strip())


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
