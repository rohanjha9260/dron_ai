"""
Dron-AI Application Entry Point

Usage:
    python run.py

Starts the Flask development server using the Application Factory pattern.
"""

import os
from app import create_app

# Select configuration based on FLASK_ENV (defaults to 'development')
env = os.getenv("FLASK_ENV", "development")
app = create_app(env)

if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", 5000))
    app.run(host=host, port=port)
