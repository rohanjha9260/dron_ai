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

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rohanjha9260/dron_ai.git
cd dron-ai

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# (Optional) Edit .env with your secret keys and GitHub token

# 5. Initialize database
python scripts/seed_db.py

# 6. Train ML models & generate checksums (first time only)
python scripts/train_model.py
```

### Running the Application

To run Dron-AI locally, you must start both the backend API and the frontend dashboard in **separate terminal windows**.

**Terminal 1 (Backend API):**
```bash
# Ensure your virtual environment is activated
python run.py
# The backend API will be available at http://localhost:5000
```

**Terminal 2 (Frontend Dashboard):**
```bash
cd frontend
python -m http.server 8000
# The frontend UI will be available at http://localhost:8000
```

## Team

- [Rohan Jha](https://github.com/rohanjha9260) — AI/ML Lead
- [Aman Sharma](https://github.com/Aetherion-S) — Backend Lead & Team Leader
- [Suruchi Kumari](https://github.com/jhasuruchi864) — Frontend Lead

## License

This project is developed as an academic mini-project.

