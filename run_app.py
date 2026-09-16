"""
Fullstack Launcher for AI Resume Insights & Analyzer
Launches FastAPI backend (port 8000) and Vite frontend (port 5173).
"""

import subprocess
import sys
import os
import time

def main():
    print("=" * 60)
    print("🚀 Starting AI Resume Insights Fullstack Application")
    print("=" * 60)

    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    # Start FastAPI Backend
    print("[1/2] Launching Backend Server on http://localhost:8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=root_dir
    )

    time.sleep(2)

    # Start Vite Frontend
    print("[2/2] Launching Frontend Server on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    print("\n✅ Application is running!")
    print("👉 Frontend: http://localhost:5173")
    print("👉 Backend API & Swagger Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
