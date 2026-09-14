import subprocess
import sys
import time

def main():
    print("Starting Dron-AI Backend API on port 5000...")
    # Using sys.executable ensures it uses the python from the active virtual environment
    backend = subprocess.Popen([sys.executable, "run.py"])

    print("Starting Dron-AI Frontend Dashboard on port 8000...")
    frontend = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], cwd="frontend")

    print("\nBoth servers are running!")
    print(" - Backend: http://localhost:5000")
    print(" - Frontend: http://localhost:8000")
    print("\nPress Ctrl+C to stop both servers.")

    try:
        # Keep the main thread alive to listen for KeyboardInterrupt
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend.terminate()
        frontend.terminate()
        backend.wait()
        frontend.wait()
        print("Servers stopped successfully.")

if __name__ == "__main__":
    main()
