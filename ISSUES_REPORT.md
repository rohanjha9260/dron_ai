# Dron-AI — Comprehensive System Audit & Bug Report

> [!IMPORTANT]
> This audit report documents all discovered defects, architectural mismatches, and operational issues across the Dron-AI platform. It includes root cause analysis (RCA), reproduction steps, affected line numbers, and recommended code fixes for each issue.

---

## 1. Executive Summary

A full-spectrum audit was conducted across the Dron-AI codebase spanning the **Frontend UI layer**, **Flask Backend API**, **Database & Seeding scripts**, and the **ML / Integrations engine**.

While the core machine learning inference pipeline (XGBoost, Cosine Recommender, Preprocessing) and Flask API tests are healthy (passing all unit tests), several critical defects were identified in frontend runtime execution, database utility scripts, and system integration data flow.

### Severity Overview
| Severity | Count | Summary |
| :--- | :---: | :--- |
| **Critical** | 2 | Show-stopping script crashes preventing page load or DB seeding |
| **High** | 2 | Data-flow disconnections & dropdown/selector UI failures |
| **Medium** | 2 | Broken relative navigation links & hardcoded static telemetry |
| **Low / Warning** | 2 | In-memory limiter warnings & external fetcher edge cases |

---

## 2. Detailed Issue Catalog

---

### Issue 1: Fatal Runtime Crash on Page Load (`mock_interview.html`)
* **Severity:** `CRITICAL`
* **Category:** Frontend UI / JavaScript
* **Affected File:** [mock_interview.html](frontend/mock_interview.html) (Line 726)

#### Root Cause Analysis (RCA)
At line 726 of `mock_interview.html`, the inline JavaScript immediately executes:
```javascript
// Initialize Lucide Icons
lucide.createIcons();
```
However, the Lucide Icons CDN script (`<script src="https://unpkg.com/lucide@latest"></script>`) is **never imported** anywhere in the `<head>` or `<body>`.

#### Impact & Failure Behavior
When any user opens `mock_interview.html` in the browser:
1. The browser console immediately halts with:
   ```text
   Uncaught ReferenceError: lucide is not defined
       at mock_interview.html:726:9
   ```
2. Because the error is thrown at the top of the main `<script>` tag, **none of the subsequent JavaScript code executes**.
3. The initial question fails to render (`loadQuestion` is never called).
4. Timer countdown, Audio recording / Web Speech API, camera toggle, and answer evaluation buttons do not respond.
5. All 17 `<i data-lucide="...">` tags on the page render as empty, blank spaces.

#### Reproduction Steps
1. Start the frontend server (`python -m http.server 8000 --directory frontend`).
2. Open `http://localhost:8000/mock_interview.html` in Chrome or Edge.
3. Open DevTools (F12) Console. The fatal `ReferenceError` is immediately visible.

#### Recommended Fix
Add the Lucide CDN script in the `<head>` section of `frontend/mock_interview.html`:
```html
<!-- Lucide Icons CDN -->
<script src="https://unpkg.com/lucide@latest"></script>
```
And guard the call in script:
```javascript
if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
}
```

---

### Issue 2: Role Selector Mismatch & Dead Dropdown States in `mock_interview.html`
* **Severity:** `HIGH`
* **Category:** Frontend UI / State Management
* **Affected File:** [mock_interview.html](frontend/mock_interview.html) (Lines 147-163, 1261-1282)

#### Root Cause Analysis (RCA)
1. **String Mismatch on Role Selection:**
   * In the HTML dropdown:
     ```html
     <option value="DevOps / SRE">DevOps / SRE</option>
     ```
   * In `MOCK_QUESTIONS[2]`:
     ```javascript
     role: 'DevOps/SRE' // Note: no spaces around '/'
     ```
   * Line 1262 does a strict equality comparison:
     ```javascript
     const matched = MOCK_QUESTIONS.find(q => q.role === e.target.value);
     ```
     `"DevOps/SRE" === "DevOps / SRE"` evaluates to `false`. `matched` is `undefined`, so selecting "DevOps / SRE" does nothing.
2. **Orphaned Dropdown & Difficulty Options:**
   * Dropdown option `<option value="Distributed Systems Architect">` has no matching question in `MOCK_QUESTIONS`.
   * Difficulty button `data-diff="Junior"` has no question with `difficulty: 'Junior'`. Clicking it leaves the interview screen in a stuck/blank state.

#### Recommended Fix
1. Harmonize the role strings:
   ```html
   <option value="DevOps/SRE">DevOps / SRE</option>
   ```
2. Add fallback or corresponding question objects for `Distributed Systems Architect` and `Junior` in `MOCK_QUESTIONS`.

---

### Issue 3: CLI Database Seeding Script Fails (`seed_db.py`)
* **Severity:** `CRITICAL`
* **Category:** Backend CLI / Python Environment
* **Affected File:** [app/scripts/seed_db.py](app/scripts/seed_db.py) (Line 16)

#### Root Cause Analysis (RCA)
Line 16 resolves the project root as follows:
```python
# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
```
* `os.path.abspath(__file__)` = `d:\...\dron_ai\app\scripts\seed_db.py`
* 1st `dirname` = `d:\...\dron_ai\app\scripts`
* 2nd `dirname` = `d:\...\dron_ai\app` ⚠️ *(This is `app/`, not project root `dron_ai/`)*

When the script attempts `from app import create_app` on line 18, Python searches for package `app` inside `dron_ai/app` and fails.

#### Reproduction Steps
Run the documented setup command from project root:
```powershell
python app/scripts/seed_db.py
```
**Output:**
```text
Traceback (most recent call last):
  File "D:\Dron AI - MIni Project\dron_ai\app\scripts\seed_db.py", line 18, in <module>
    from app import create_app
ModuleNotFoundError: No module named 'app'
```

#### Recommended Fix
Replace line 16 in `app/scripts/seed_db.py` with:
```python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
```
*(Navigates 2 levels up from `scripts/` to `dron_ai/`).*

---

### Issue 4: Broken Navigation Links in `frontend/html/index.html` (404)
* **Severity:** `MEDIUM`
* **Category:** Frontend Routing & Navigation
* **Affected File:** [frontend/html/index.html](frontend/html/index.html) (Lines 48, 51, 88, 120)

#### Root Cause Analysis (RCA)
In `frontend/html/index.html`, navigation anchors point to:
```html
<a href="career.html">Career Direction</a>
<a href="roadmap.html">Remediation Roadmap</a>
```
Because the current file is inside `frontend/html/`, the browser resolves the links relative to `frontend/html/career.html` and `frontend/html/roadmap.html`. Neither file exists in `frontend/html/` (they reside in the parent directory `frontend/`). Clicking either results in an HTTP 404 error.

#### Recommended Fix
Update relative paths to:
```html
<a href="../career.html">Career Direction</a>
<a href="../roadmap.html">Remediation Roadmap</a>
```
Or consolidate templates to point to the active dashboard root.

---

### Issue 5: Dual Frontend Architecture Disconnect
* **Severity:** `HIGH`
* **Category:** System Architecture & Data Flow
* **Affected Files:**
  * Active UI: [frontend/input.html](frontend/input.html), [frontend/dashboard.html](frontend/dashboard.html), [frontend/app.js](frontend/app.js)
  * Backend API Client: [frontend/js/api.js](frontend/js/api.js), [frontend/js/profile.js](frontend/js/profile.js)

#### Root Cause Analysis (RCA)
The codebase currently contains two disparate frontend versions:
1. **The API-Connected Old UI (`frontend/html/`):**
   * Uses `api.js`, `auth.js`, `profile.js`, `career.js`, and `placement.js` to communicate with the Flask REST endpoints (`/api/auth`, `/api/users/profile`, `/api/predictions/placement`, etc.).
2. **The New Metallic Dashboard (`frontend/`):**
   * Runs under `scripts/start_servers.py` on port 8000.
   * Driven exclusively by [frontend/app.js](frontend/app.js), which stores all user telemetry inside browser `localStorage` (`dron_student_profile`) and computes scores using client-side JavaScript approximations.
   * **The new dashboard does not send requests to the Flask API backend or database.**
   * As a result, the trained XGBoost model (`xgboost_placement.pkl`), SQLite database (`dron_ai.db`), and live external integrations (`github_fetcher.py`, `leetcode_fetcher.py`) remain completely decoupled from the modern user interface.

#### Recommended Fix
Integrate `api.js` into the modern dashboard pages:
* In `frontend/input.html`: When the user submits the telemetry form, dispatch `PUT /api/users/profile` alongside `localStorage` caching.
* In `frontend/placement.html`: Call `POST /api/predictions/placement` to display the actual XGBoost probability score and SHAP weights.
* In `frontend/career.html`: Call `POST /api/career/recommend` to display real cosine similarity rankings.

---

### Issue 6: Hardcoded Static Telemetry on Analytical Dashboards
* **Severity:** `MEDIUM`
* **Category:** Frontend Data Binding
* **Affected Files:**
  * `frontend/career.html` (Table rows)
  * `frontend/placement.html` (Score Badge)
  * `frontend/app.js` (Radar chart datasets)

#### Root Cause Analysis (RCA)
* **`career.html`:** The "Ranked Career Vectors" table (e.g. `#1 Data Engineer 88%`, `#2 Machine Learning Engineer 82%`) consists of **hardcoded HTML table markup**. When a student modifies their technical skills in `input.html`, the table values never change.
* **`career.html` Radar Chart:** In `app.js:675`, the student skill polygon values are hardcoded as `[82, 88, 65, 80, 75, 76]` instead of being derived dynamically from `profile.technicalSkills` or `profile.softSkills`.
* **`placement.html`:** The banner displays a hardcoded `<span class="badge badge-success">Overall Score: 74%</span>` and fixed bar chart weights `[28, 24, 18, 14, 10, 6]`.

#### Recommended Fix
Bind these components dynamically using `calculatePlacementReadiness(profile)` and `calculateCareerMatches(profile)` in `app.js`.

---

### Issue 7: Flask-Limiter In-Memory Warning on Startup
* **Severity:** `LOW`
* **Category:** Backend Configuration
* **Affected File:** [config.py](config.py)
* **Message:**
  ```text
  UserWarning: Using the in-memory storage for tracking rate limits as no storage was explicitly specified. This is not recommended for production use.
  ```

#### Root Cause Analysis (RCA)
Flask-Limiter is initialized in `app/extensions.py` without an explicit storage backend URI. While acceptable for development and unit testing, in production or multi-worker deployments (Gunicorn/uWSGI), rate limits will reset per worker.

#### Recommended Fix
In `config.py`, set:
```python
RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
```

---

### Issue 8: GitHub Fetcher Response Type Assumption on Empty Repositories
* **Severity:** `LOW`
* **Category:** External Integration Resilience
* **Affected File:** [app/integrations/github_fetcher.py](app/integrations/github_fetcher.py) (Line 117)

#### Root Cause Analysis (RCA)
Line 117 performs:
```python
commits_count += len(c_resp.json())
```
If an empty repository returns an error dictionary (`{"message": "Git Repository is empty."}`) with a 200/409 code, calling `len()` on the dictionary counts JSON keys rather than commit objects.

#### Recommended Fix
Ensure the response is a list before accumulating:
```python
commits_data = c_resp.json()
if isinstance(commits_data, list):
    commits_count += len(commits_data)
```

---

## 3. Remediation Priority Matrix

| Priority | Issue | Component | Effort | Impact |
| :---: | :--- | :--- | :---: | :--- |
| **P0** | **Fix Lucide reference in `mock_interview.html`** | Frontend UI | 5 min | Restores full functionality to the Mock Interview room |
| **P0** | **Fix `sys.path` in `app/scripts/seed_db.py`** | Database CLI | 2 min | Enables database seeding as documented in `AGENTS.md` |
| **P1** | **Fix DevOps role string & add fallbacks in `mock_interview.html`** | Frontend UI | 10 min | Eliminates silent selection failures in the dropdown |
| **P1** | **Connect new dashboard UI (`frontend/*.html`) to Flask REST APIs** | Architecture | 45 min | Unlocks real XGBoost predictions & DB persistence in the UI |
| **P2** | **Make `career.html` table and radar chart dynamically bound** | Frontend JS | 20 min | Reflects actual student profile edits on analytical screens |
| **P2** | **Fix relative URLs in `frontend/html/index.html`** | Navigation | 5 min | Resolves 404 navigation errors |
| **P3** | **Defensive type checks in `github_fetcher.py`** | Integrations | 5 min | Prevents edge-case miscounting on empty repos |
