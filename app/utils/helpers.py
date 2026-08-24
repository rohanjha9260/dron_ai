"""
Common Helper Functions

Shared utility functions used across multiple modules.
"""

from flask import jsonify


def success_response(data: dict, status_code: int = 200):
    """Create a standardized success JSON response."""
    return jsonify({"status": "success", "data": data}), status_code


def error_response(message: str, status_code: int = 400):
    """Create a standardized error JSON response."""
    return jsonify({"status": "error", "error": message}), status_code


def validate_required_fields(data: dict, required_fields: list) -> list:
    """
    Check if all required fields are present in the data dict.

    Args:
        data: The input dictionary to validate
        required_fields: List of required field names

    Returns:
        List of missing field names (empty if all present)
    """
    if not data:
        return required_fields
    return [field for field in required_fields if field not in data or data[field] is None]
