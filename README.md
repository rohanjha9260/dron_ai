# Dron-AI — Intelligent Student Guidance Platform

An AI/ML-based decision-support system that analyzes a student's multidimensional academic, technical, and professional profile to provide personalized, data-driven career guidance.

## Core Features

1. **Student Profile Creation** — Unified profile from academic records + GitHub + LeetCode
2. **Placement Readiness Prediction** — XGBoost-powered probability scoring
3. **Career Recommendation** — Cosine Similarity vector matching to ideal career paths
4. **Skill-Gap Analysis** — Vector subtraction to identify weaknesses
5. **Personalized Roadmap** — Sequenced action plan for improvement

## Tech Stack


| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python 3.x + Flask |
| Database | MySQL |
| ML Engine | Pandas, NumPy, Scikit-learn, XGBoost |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
dron-ai/
├── app/              # Flask Application Factory (Backend API)
├── integrations/     # GitHub & LeetCode data fetchers
├── ml_engine/        # XGBoost, Cosine Similarity, Roadmap generation
├── frontend/         # HTML/CSS/JS Dashboard
├── scripts/          # DB seeding & model training utilities
└── tests/            # Test suite
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- MySQL 8.0+
- pip

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd dron-ai

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# 5. Initialize database
python scripts/seed_db.py

# 6. Train ML models (first time only)
python scripts/train_model.py

# 7. Run the application
python run.py
```

The application will be available at `http://localhost:5000`

## Team

- **Member 1 (ML Engineer)**: `ml_engine/`, `integrations/`, `scripts/train_model.py`
- **Member 2 (Backend Developer)**: `app/`, `config.py`, `run.py`
- **Member 3 (Frontend Developer)**: `frontend/`, `scripts/seed_db.py`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/users/profile` | Get student profile |
| PUT | `/api/users/profile` | Update student profile |
| POST | `/api/metrics/fetch` | Fetch GitHub + LeetCode data |
| POST | `/api/predictions/placement` | Get placement readiness score |
| POST | `/api/career/recommend` | Get career recommendations |
| POST | `/api/roadmap/generate` | Generate personalized roadmap |

## License

This project is developed as an academic mini-project.
