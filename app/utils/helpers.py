"""
Common Helper Functions

Shared utility functions used across multiple modules.
"""

from flask import jsonify


def success_response(data: dict, status_code: int = 200):
    """Create a standardized success JSON response."""
    return jsonify({"success": True, "data": data, "status": "success"}), status_code


def error_response(message: str, status_code: int = 400):
    """
    Create a standardized error JSON response.

    Schema:
        {
            "success": false,
            "error": {
                "code": status_code,
                "message": message
            }
        }
    """
    payload = {
        "success": False,
        "error": {
            "code": status_code,
            "message": message,
        },
    }
    return jsonify(payload), status_code


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
