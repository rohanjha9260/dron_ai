# Dron-AI — Intelligent Student Guidance Platform

An AI/ML-based decision-support system that analyzes a student's multidimensional academic, technical, and professional profile to provide personalized, data-driven career guidance.

## Core Features

1. **Student Profile Creation** — Unified profile from academic records + live GitHub & LeetCode metrics aggregation.
2. **Placement Readiness Prediction** — XGBoost-powered probability scoring.
3. **Explainable AI (XAI)** — SHAP integration to provide transparent "Why?" explanations for placement predictions.
4. **Academic Performance Forecasting** — RandomForestRegressor to predict next semester CGPA based on engagement.
5. **Career Recommendation** — Cosine Similarity vector matching to ideal career paths.
6. **Skill-Gap Analysis** — Vector subtraction to identify weaknesses.
7. **Personalized Roadmap** — Sequenced action plan for improvement.

## Tech Stack


| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Backend API | Python 3.11+, Flask (Application Factory), SQLAlchemy |
| Database | SQLite 3 |
| ML Engine & AI | Scikit-learn, XGBoost, Random Forest, SHAP (Explainable AI), Cosine Similarity, NumPy, Pandas |
| External Integrations | GitHub REST API, LeetCode GraphQL API |
| Security & Auth | JWT (Flask-JWT-Extended), Flask-Limiter (Rate Limiting), Bcrypt |
| Testing | Pytest |

## Project Structure

```text
dron-ai/
├── app/              # Flask Application Factory (Backend API)
├── integrations/     # GitHub & LeetCode live data fetchers
├── ml_engine/        # XGBoost, RandomForest, SHAP, Cosine Similarity
├── frontend/         # HTML/CSS/JS Dashboard UI
├── scripts/          # DB seeding & model training utilities
└── tests/            # Test suite
```

## Setup & Run Instructions

### Prerequisites
- Python 3.11+
- Git

---

### Step 1: Installation & Setup

Execute the following commands in order. Each command includes an explanation of what it does and why it is needed:

```bash
# 1. Clone the project repository from GitHub to your local machine
git clone https://github.com/rohanjha9260/dron_ai.git

# 2. Navigate into the cloned project directory
cd dron-ai

# 3. Create an isolated Python virtual environment named 'venv'
# WHY: Isolates project dependencies from your global Python environment to prevent version conflicts
python -m venv venv

# 4. Activate the virtual environment
# WHY: Ensures subsequent 'pip' and 'python' commands use the local environment's binaries
source venv/bin/activate        # On macOS / Linux
venv\Scripts\activate           # On Windows (PowerShell or CMD)

# 5. Install all required dependencies from requirements.txt
# WHY: Installs Flask, Flask-SQLAlchemy, XGBoost, scikit-learn, NumPy, Pandas, etc.
pip install -r requirements.txt

# 6. Create your local environment configuration file (.env)
# WHY: Defines application secrets, database URI, and optional GitHub API tokens
cp .env.example .env            # macOS / Linux
copy .env.example .env          # Windows (Command Prompt)
# (Optional: Open .env and add your GITHUB_TOKEN for higher rate limits)

# 7. Seed the database with mock academic profiles, skill vectors, and career models
# WHY: Populates the SQLite database (dron_ai.db) with initial test data needed by the app
python app/scripts/seed_db.py

# 8. Train the ML models and generate cryptographic SHA-256 sidecar checksums
# WHY: Compiles the XGBoost placement predictor model (xgboost_placement.pkl) and standard scaler (scaler.pkl)
python ml_engine/scripts/train_model.py
```

---

### Step 2: Running the Application

There are two ways to run the platform locally:

#### ⚡ Option A: Simplest & Recommended (1 Single Command)

Run both the Flask backend API and the frontend web server concurrently from a single terminal:

```bash
# Starts Backend (port 5000) + Frontend (port 8000) and automatically opens your browser
python scripts/start_servers.py
```

**What this command does for you:**
- ✅ Launches the Flask REST API at `http://localhost:5000`
- ✅ Launches the Frontend Web Server at `http://localhost:8000`
- ✅ Binds explicitly to `127.0.0.1` so your terminal prints clean, clickable IPv4 links instead of confusing `[::]` IPv6 addresses
- ✅ Automatically opens your default web browser to the dashboard
- ✅ Gracefully stops both servers when you press `Ctrl + C`

---

#### 🛠️ Option B: Manual (Two Separate Terminals)

If you prefer to inspect backend API logs and frontend access logs separately, open two terminal windows:

**Terminal 1 — Backend API Server:**
```bash
# Activate your virtual environment first
venv\Scripts\activate           # Windows
source venv/bin/activate        # macOS / Linux

# Start the Flask REST API server
# WHY: Powers model inference, authentication, database queries, and metric calculations
python run.py

# The backend API will be live at: http://localhost:5000
# Health check endpoint: http://localhost:5000/api/health
```

**Terminal 2 — Frontend Web Server:**
```bash
# Start the static HTTP server from the project root
# WHY: Serves HTML, CSS, JavaScript, and assets to the browser
# NOTE: '--bind 127.0.0.1' ensures a clickable IPv4 URL is shown in your terminal
# NOTE: Opening http://localhost:8000 automatically redirects to http://localhost:8000/html/index.html
python -m http.server 8000 --directory frontend --bind 127.0.0.1

# The frontend dashboard will be live at: http://localhost:8000
# Direct landing page URL: http://localhost:8000/html/index.html
```

---

### 💡 Frontend URL & Redirect Troubleshooting

#### Q: When I run `python -m http.server 8000`, the terminal displays `http://[::]:8000/` or no clickable URL. How do I fix this?
> **Root Cause:** By default, Python's `http.server` binds to IPv6 (`::`), which cannot be clicked or resolved directly by many Windows browsers.
> **Solution:** Always pass `--bind 127.0.0.1`:
> ```bash
> python -m http.server 8000 --directory frontend --bind 127.0.0.1
> ```
> This forces Python to display the standard, clickable IPv4 address: `http://127.0.0.1:8000/`.

#### Q: Navigating to `http://localhost:8000` showed a folder listing instead of opening the website. Why?
> **Root Cause:** All dashboard views reside inside the `frontend/html/` subdirectory (e.g., `index.html`, `dashboard.html`). If the root has no `index.html`, Python displays raw directory folders (`css/`, `html/`, `js/`).
> **Solution:** We added an automatic redirect in `frontend/index.html`. Now, opening either `http://localhost:8000` or `http://127.0.0.1:8000` immediately redirects straight to the landing dashboard at `http://localhost:8000/html/index.html`.

## Team

- [Rohan Jha](https://github.com/rohanjha9260) — AI/ML Lead
- [Aman Sharma](https://github.com/Aetherion-S) — Backend Lead & Team Leader
- [Suruchi Kumari](https://github.com/jhasuruchi864) — Frontend Lead

## License

This project is developed as an academic mini-project.

