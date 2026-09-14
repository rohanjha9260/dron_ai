"""
Root conftest.py — pytest configuration for Dron-AI test suite.

Ensures pytest discovers tests across all domain-specific test directories:
    - ml_engine/tests/    (ML engine & preprocessing tests)
    - app/tests/          (Flask API & integration tests)
"""

import sys
import os

# Add project root to sys.path so all imports resolve correctly from any test directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

