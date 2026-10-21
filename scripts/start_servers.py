"""
Dron-AI Server Launcher

Runs both the Flask REST API backend and the Frontend static HTTP server concurrently.
Automatically opens the dashboard in your default browser.
"""

import os
import subprocess
import sys
import time
import webbrowser

# Ensure UTF-8 output encoding on Windows if supported
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def main():
    print("\n==============================================================")
    print("       [*] Launching Dron-AI Career Guidance Platform         ")
    print("==============================================================")

    # 1. Start Flask REST API Backend on port 5000
    print("[1/2] Starting Flask Backend API on http://localhost:5000 ...")
    backend = subprocess.Popen([sys.executable, "run.py"])

    # 2. Start Frontend Static HTTP Server on port 8000
    print("[2/2] Starting Frontend Web Server on http://localhost:8000 ...")
    frontend = subprocess.Popen(
        [sys.executable, "-m", "http.server", "8000"],
        cwd="frontend",
    )

    # Allow servers a brief moment to initialize
    time.sleep(2.0)

    print("\n==============================================================")
    print("       [OK] Both Servers Are Live & Ready!                    ")
    print("==============================================================")
    print("   [WEB] Web Landing Page: http://localhost:8000/html/index.html")
    print("         (Or via IPv4:     http://127.0.0.1:8000/html/index.html)")
    print("         (Root redirect:   http://localhost:8000)")
    print("   [API] Backend Health:   http://localhost:5000/api/health")
    print("==============================================================")
    print("   Press Ctrl+C in this terminal anytime to stop both servers.\n")

    # Automatically open the landing page in the user's default browser
    try:
        webbrowser.open("http://127.0.0.1:8000/html/index.html")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers gracefully...")
        backend.terminate()
        frontend.terminate()
        backend.wait()
        frontend.wait()
        print("All servers stopped successfully.")


if __name__ == "__main__":
    main()
