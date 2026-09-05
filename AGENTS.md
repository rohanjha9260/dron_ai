# AGENTS.md — Dron-AI Project Guide for AI Agents

> **Quick Context for AI Agents**: Dron-AI is an AI/ML-driven student career guidance and placement readiness platform. It integrates academic records, GitHub activity, and LeetCode metrics into a quantitative feature vector to predict placement readiness, recommend career paths, calculate skill gaps, and generate learning roadmaps.

---

## ⚠️ Team Ownership & Role Boundaries

| Area / Component | Owner | Scope & Responsibility | AI Agent Rule |
|:---|:---|:---|:---|
| **AI / ML & Integrations** | **Our Role (AI/ML Engineer)** | `ml_engine/`, `integrations/`, `scripts/train_model.py`, `tests/test_ml.py` | **Primary focus**. Implement, optimize, test, and maintain ML algorithms, feature pipelines, and live data fetchers. |
| **Backend API** | **Teammate (Backend Dev)** | `app/` (API blueprints, models, services, auth), `config.py`, `run.py` | **Do not modify** without explicit instructions. Teammates handle Flask routes, DB schemas, and auth. |
| **Frontend UI** | **Teammate (Frontend Dev)** | `frontend/` (HTML, CSS, JS dashboard) | **Do not modify** without explicit instructions. Teammates handle dashboard layout, styles, and client scripts. |
| **Database Seeding** | **Teammate (Frontend/Backend)**| `scripts/seed_db.py`, `migrations/` | **Do not overwrite** mock DB seed data. |

> **Critical Guideline for AI Agents**: Keep all changes strictly isolated to `ml_engine/`, `integrations/`, `scripts/train_model.py`, and `tests/test_ml.py`. Avoid touching or refactoring `app/` or `frontend/` to prevent merge conflicts with other teammates' active work.

---

## 1. Project Directory Structure

```text
dron-ai/
├── app/                  # Flask REST API Backend (Application Factory Pattern)
│   ├── api/              # Blueprints: auth, users, metrics, predictions, career, roadmap
│   ├── models/           # SQLAlchemy Models: User, AcademicProfile, SkillVector, MLPrediction, Roadmap
│   ├── services/         # Business logic services wrapping ML engine & integrations
│   └── extensions.py     # SQLAlchemy, JWT, Limiter, CORS extensions
├── integrations/         # Live external data fetchers with memoization and fallbacks
│   ├── github_fetcher.py # GitHub REST API: repos, languages, commit activity
│   └── leetcode_fetcher.py# LeetCode GraphQL API: solved problems, contest rating, ranking
├── ml_engine/            # Machine Learning & Recommendation Core
│   ├── preprocessing.py  # 13D feature engineering, bounds clamping, StandardScaler
│   ├── xgboost_model.py  # XGBoost placement readiness predictor (<2ms inference)
│   ├── cosine_recommender.py # Cosine similarity career matching against target roles
│   ├── gap_analyzer.py   # Vector subtraction (Ideal Role Vector - Student Vector)
│   ├── roadmap_generator.py # Sequenced milestone and learning plan generation
│   ├── model_loader.py   # Singleton model cache initialized on Flask startup
│   ├── data/             # career_vectors.json, student_career_success_dataset.csv
│   └── saved_models/     # xgboost_placement.pkl, scaler.pkl (+ .sha256 sidecars)
├── frontend/             # Vanilla HTML5, CSS3, JavaScript ES6+ (No React/Tailwind)
├── scripts/              # CLI utilities
│   ├── train_model.py    # Retrains XGBoost model and generates SHA-256 sidecars
│   └── seed_db.py        # Populates mock users, academic data, and skill vectors
└── tests/                # Pytest unit & regression tests
    └── test_ml.py        # ML engine, preprocessing, and recommender test suite
```

---

## 2. Feature Vectors & Mathematical Formulas

### Canonical 13-Dimensional Feature Vector
Defined in `ml_engine/preprocessing.py:FEATURE_NAMES`:

| Index | Feature Name | Description | Source / Bounds |
|:---:|:---|:---|:---|
| 0 | `cgpa` | Cumulative GPA | Academic (0.0 to 10.0) |
| 1 | `attendance_pct` | Academic Attendance % | Academic (0.0 to 100.0) |
| 2 | `active_backlogs` | Number of active backlogs | Academic (0+) |
| 3 | `dsa_score` | Data Structures & Algorithms | Skill Vector (0 to 100) |
| 4 | `python_prof` | Python Proficiency | Skill Vector (0 to 100) |
| 5 | `cpp_prof` | C++ Proficiency | Skill Vector (0 to 100) |
| 6 | `aiml_knowledge` | AI/ML Conceptual Knowledge | Skill Vector (0 to 100) |
| 7 | `total_commits` | GitHub Commit Count (1 year) | GitHub Integration |
| 8 | `problems_solved` | LeetCode Solved Count | LeetCode Integration |
| 9 | `contest_rating` | LeetCode Contest Rating | LeetCode Integration |
| 10 | `project_count` | Number of completed projects | Student Profile |
| 11 | `communication_score`| Soft skills & Communication | Student Profile (0 to 100) |
| 12 | `internship_exp` | Internship experience (months) | Student Profile |

*Note: `CareerRecommender` uses the 10 skill dimensions (indices 3 to 12), automatically slicing 13D vectors if provided.*

### Core Formulas
- **Cosine Similarity (Career Match)**:
  $$\text{Similarity}(S, C) = \frac{S \cdot C}{\|S\| \times \|C\|}$$
  $$\text{match\_pct} = \text{round}(\text{clip}(\text{Similarity}(S, C), 0.0, 1.0) \times 100, 2)$$
- **Skill Gap**:
  $$\text{Gap} = \max(0, \text{Career Vector} - \text{Student Vector})$$

---

## 3. Technology Stack & Environment Details

- **Language**: Python 3.11+
- **Backend Framework**: Flask + Flask-SQLAlchemy + Flask-JWT-Extended
- **ML Frameworks**: scikit-learn, XGBoost, NumPy, Pandas
- **Frontend**: Vanilla HTML/CSS/JavaScript. *Do not add React, TypeScript, or TailwindCSS unless explicitly instructed.*
- **Operating System**: Windows PowerShell environment. Avoid raw Unicode emojis in console outputs to prevent CP1252 `UnicodeEncodeError`.

---

## 4. Key Architectural Invariants & Agent Rules

1. **Integrity & Security**:
   - Serialized ML models (`.pkl`) require SHA-256 sidecars (`.sha256`).
   - `load_scaler()` and `PlacementPredictor.load()` must **fail closed** (`FileNotFoundError` / `ValueError`) if hashes do not match or sidecars are missing.
2. **Data Leakage Prevention**:
   - Always perform train/test splits **before** fitting the `StandardScaler`. Transform test data using the train-fitted scaler.
3. **Inference Latency & Semantics**:
   - `PlacementPredictor.predict(features)` enforces single-row semantics (rejecting 2D arrays with `shape[0] != 1`).
   - Inference latency SLA is $<5\text{ms}$ (configured with `n_jobs=1` and cached feature importances).
4. **Resilience & Fallbacks**:
   - External fetchers (`github_fetcher.py`, `leetcode_fetcher.py`) use `@functools.lru_cache` and must return baseline zero-dictionaries on 404s, timeouts, or rate limits without crashing the backend.
   - Non-finite numbers (`NaN`, `Inf`, `-Inf`) must be sanitized to `0.0`.
5. **Team Scope Isolation**:
   - Only edit files in `ml_engine/`, `integrations/`, `scripts/train_model.py`, and `tests/test_ml.py`.
   - Never modify `app/` (backend API) or `frontend/` (UI dashboard) unless explicitly requested by the user.

---

## 5. Common Commands

```powershell
# Run the test suite
python -m pytest tests/test_ml.py -v

# Train / serialize ML models with SHA-256 checksums
python scripts/train_model.py

# Run the Flask backend
python run.py
```
