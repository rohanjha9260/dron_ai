/**
 * DRON AI: Intelligent Student Future & Career Guidance System
 * Core Client-Side Controller, State Engine & Chart.js Visualizer
 *
 * Handles:
 *   - LocalStorage persistence for student demographic, academic, and telemetry data
 *   - Heuristic ML-inspired multi-factor readiness scoring & career vector alignment
 *   - Chart.js instances: Academic Trajectory, Placement Semi-Circle Gauge,
 *     Regression Curves, SHAP Classification Factors, and Skill Radar Match
 *   - Interactive chips, range sliders, demo data pre-fill, and roadmap checklists
 */

// ═══════════════════════════════════════════════════════════════
// Default Demo Student Profile & Heuristic Constants
// ═══════════════════════════════════════════════════════════════
const DEFAULT_STUDENT_PROFILE = {
    fullName: "Rohan Jha",
    cohortYear: "2026",
    currentSem: "Semester 6",
    branch: "Computer Science & Engineering",
    tenthPct: 92.4,
    twelfthPct: 89.6,
    cgpa: 8.65,
    attendancePct: 88.5,
    activeBacklogs: 0,
    technicalSkills: ["Python", "DSA", "C/C++", "SQL", "AI/ML", "Web Dev"],
    softSkills: {
        communication: 76,
        problemSolving: 88,
        leadership: 72,
        adaptability: 82,
    },
    projectsCount: 4,
    internshipsCount: 1,
    certificationsCount: 3,
    hackathonsCount: 2,
    githubUrl: "https://github.com/rohanjha9260",
    leetcodeUrl: "https://leetcode.com/u/rohanjha9260",
    historicalSemesters: [8.10, 8.35, 8.50, 8.90, 8.65],
    predictedNextCgpa: 8.85,
    totalCommits: 184,
    problemsSolved: 242,
    contestRating: 1640,
    lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
};

// ═══════════════════════════════════════════════════════════════
// State Management Helpers (localStorage)
// ═══════════════════════════════════════════════════════════════
function getStudentProfile() {
    try {
        const stored = localStorage.getItem("dron_student_profile");
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_STUDENT_PROFILE, ...parsed };
        }
    } catch (e) {
        console.warn("Could not read student profile from localStorage:", e);
    }
    return { ...DEFAULT_STUDENT_PROFILE };
}

function saveStudentProfile(profile) {
    try {
        const updated = {
            ...profile,
            lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
        localStorage.setItem("dron_student_profile", JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error("Could not write student profile to localStorage:", e);
        return profile;
    }
}

// ═══════════════════════════════════════════════════════════════
// Live Backend & ML Inference Engine Client
// ═══════════════════════════════════════════════════════════════

function getApiBaseUrl() {
    if (typeof API_BASE_URL !== "undefined" && API_BASE_URL) {
        return API_BASE_URL;
    }
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    const isLocalStatic = window.location.port === "8000" || window.location.port === "5500" || window.location.port === "3000";
    if (!isLocalStatic && window.location.origin && window.location.origin.startsWith("http")) {
        return "/api";
    }
    return "http://localhost:5000/api";
}

let inFlightAuthPromise = null;

async function fetchWithTimeout(resource, options = {}, timeoutMs = 4000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timer);
        return response;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

async function getAuthToken() {
    let token = localStorage.getItem("dron_ai_token");
    if (token) return token;

    // Do not auto-authenticate on public landing/login/legal pages
    const path = window.location.pathname;
    const isPublic = path.endsWith("index.html") || path.endsWith("login.html") || path === "/" || path.endsWith("privacy.html") || path.endsWith("terms.html") || path.endsWith("cookies.html");
    if (isPublic) {
        return null;
    }

    if (inFlightAuthPromise) {
        return inFlightAuthPromise;
    }

    inFlightAuthPromise = (async () => {
        try {
            const baseUrl = getApiBaseUrl();
            const res = await fetchWithTimeout(`${baseUrl}/auth/guest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }, 4000);
            if (res.ok) {
                const data = await res.json();
                if (data.access_token) {
                    localStorage.setItem("dron_ai_token", data.access_token);
                    localStorage.setItem("dron_student_id", data.student_id);
                    return data.access_token;
                }
            }
        } catch (e) {
            console.warn("Guest authentication offline:", e);
        } finally {
            inFlightAuthPromise = null;
        }
        return null;
    })();

    return inFlightAuthPromise;
}

async function apiCall(endpoint, method = "GET", body = null, allowReauth = true) {
    const baseUrl = getApiBaseUrl();
    let token = await getAuthToken();
    const headers = { "Content-Type": "application/json", "Accept": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        let res = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        }, 4000);

        if (res.status === 401 && allowReauth) {
            localStorage.removeItem("dron_ai_token");
            token = await getAuthToken();
            if (token) {
                if (typeof syncProfileToBackend === "function" && typeof getStudentProfile === "function") {
                    await syncProfileToBackend(getStudentProfile(), false);
                }
                return await apiCall(endpoint, method, body, false);
            }
        }

        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.warn(`API call error for ${endpoint}:`, err);
    }
    return null;
}

async function syncProfileToBackend(profile, allowReauth = true) {
    const semIndex = parseInt(String(profile.currentSem || "6").replace(/\D/g, "")) || 6;
    const skillsList = Array.isArray(profile.technicalSkills) ? profile.technicalSkills : [];
    const soft = profile.softSkills || {};

    const toFinite = (val, fallback) => {
        const num = Number(val);
        return Number.isFinite(num) ? num : fallback;
    };

    const payload = {
        academics: [
            {
                semester: semIndex,
                cgpa: Math.min(10, Math.max(0, toFinite(profile.cgpa, 8.0))),
                attendance_pct: Math.min(100, Math.max(0, toFinite(profile.attendancePct, 85.0))),
                active_backlogs: Math.max(0, Math.round(toFinite(profile.activeBacklogs, 0))),
            }
        ],
        skills: {
            dsa_score: skillsList.includes("DSA") ? 85.0 : 45.0,
            python_prof: skillsList.includes("Python") ? 90.0 : 40.0,
            cpp_prof: skillsList.includes("C/C++") ? 80.0 : 35.0,
            aiml_knowledge: skillsList.includes("AI/ML") ? 85.0 : 30.0,
            communication_score: Math.min(100, Math.max(0, toFinite(soft.communication, 75.0))),
            total_commits: Math.max(0, Math.round(toFinite(profile.totalCommits, 180))),
            problems_solved: Math.max(0, Math.round(toFinite(profile.problemsSolved, 240))),
            contest_rating: Math.max(0, toFinite(profile.contestRating, 1550.0)),
            project_count: Math.max(0, Math.round(toFinite(profile.projectsCount, 4))),
            internship_exp: Math.max(0, Math.round(toFinite(profile.internshipsCount, 0)) * 3),
        }
    };

    if (profile.githubUrl || profile.leetcodeUrl) {
        payload.platform_links = {
            github_handle: profile.githubUrl ? profile.githubUrl.split("/").filter(Boolean).pop() : undefined,
            leetcode_username: profile.leetcodeUrl ? profile.leetcodeUrl.split("/").filter(Boolean).pop() : undefined,
        };
    }

    try {
        const result = await apiCall("/users/profile", "PUT", payload, allowReauth);
        return result;
    } catch (err) {
        console.warn("Could not sync profile to backend:", err);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// Multi-Factor Quantitative Intelligence Calculations
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate placement readiness probability (0 - 100%)
 * Multi-factor heuristic synthesizing academic GPA, technical depth,
 * soft skills, and project/telemetry exposure.
 */
function calculatePlacementReadiness(profile) {
    const cgpaScore = Math.min(10, Math.max(0, Number(profile.cgpa) || 0)) * 10; // max 100
    const attendanceFactor = Math.min(100, Math.max(0, Number(profile.attendancePct) || 0));
    const backlogPenalty = Math.max(0, (Number(profile.activeBacklogs) || 0) * 15);

    // Academic Pillar (30%)
    const academicPillar = Math.max(0, (cgpaScore * 0.7 + attendanceFactor * 0.3) - backlogPenalty);

    // Technical Skills Pillar (30%)
    const skillCount = Array.isArray(profile.technicalSkills) ? profile.technicalSkills.length : 4;
    const techPillar = Math.min(100, skillCount * 14 + (profile.technicalSkills?.includes("DSA") ? 18 : 0));

    // Professional Experience Pillar (25%)
    const projScore = Math.min(100, (Number(profile.projectsCount) || 0) * 20);
    const internScore = Math.min(100, (Number(profile.internshipsCount) || 0) * 35);
    const hackScore = Math.min(100, (Number(profile.hackathonsCount) || 0) * 15);
    const expPillar = Math.min(100, projScore * 0.4 + internScore * 0.45 + hackScore * 0.15);

    // Soft Skills Pillar (15%)
    const soft = profile.softSkills || {};
    const softPillar = ((Number(soft.communication) || 70) + (Number(soft.problemSolving) || 75) + (Number(soft.leadership) || 70)) / 3;

    const rawReadiness = (academicPillar * 0.30) + (techPillar * 0.30) + (expPillar * 0.25) + (softPillar * 0.15);
    return Math.min(98, Math.max(42, Math.round(rawReadiness)));
}

/**
 * Calculate ranked career match alignment using Cosine Vector proximity.
 */
function calculateCareerMatches(profile) {
    const skills = new Set(profile.technicalSkills || []);
    const hasPython = skills.has("Python");
    const hasAIML = skills.has("AI/ML");
    const hasSQL = skills.has("SQL");
    const hasDSA = skills.has("DSA");
    const hasWeb = skills.has("Web Dev");
    const hasJava = skills.has("Java");
    const hasCpp = skills.has("C/C++");

    const cgpa = Number(profile.cgpa) || 8.0;

    let dataEngScore = 70 + (hasPython ? 8 : 0) + (hasSQL ? 7 : 0) + (hasAIML ? 3 : 0);
    let mlEngScore = 65 + (hasAIML ? 10 : 0) + (hasPython ? 5 : 0) + (hasDSA ? 2 : 0);
    let backendScore = 64 + (hasDSA ? 6 : 0) + (hasSQL ? 3 : 0) + (hasJava || hasCpp || hasPython ? 2 : 0);
    let fullstackScore = 60 + (hasWeb ? 10 : 0) + (hasSQL ? 3 : 0) + (hasPython || hasJava ? 2 : 0);

    if (cgpa >= 8.5) {
        dataEngScore += 2;
        mlEngScore += 3;
    }

    const matches = [
        {
            role: "Data Engineer",
            matchPct: Math.min(96, Math.max(65, dataEngScore)),
            tag: "Top Match",
            rankClass: "rank-1",
            fillClass: "fill-cyan",
            description: "High alignment with Python, relational data pipelines, and SQL metrics.",
        },
        {
            role: "Machine Learning Engineer",
            matchPct: Math.min(94, Math.max(60, mlEngScore)),
            tag: "Strong Fit",
            rankClass: "rank-2",
            fillClass: "fill-purple",
            description: "Solid theoretical aptitude; recommended milestone: Model serving & MLOps.",
        },
        {
            role: "Backend Developer",
            matchPct: Math.min(92, Math.max(55, backendScore)),
            tag: "Viable Pathway",
            rankClass: "rank-3",
            fillClass: "fill-slate",
            description: "Proficient algorithms foundation with REST architecture competencies.",
        },
        {
            role: "Full Stack Developer",
            matchPct: Math.min(90, Math.max(50, fullstackScore)),
            tag: "Alternative",
            rankClass: "rank-3",
            fillClass: "fill-slate",
            description: "Front-to-back integration capabilities with reactive components.",
        }
    ];

    matches.sort((a, b) => b.matchPct - a.matchPct);
    return matches;
}

// ═══════════════════════════════════════════════════════════════
// Common UI Hydration (Header, Sidebar, User Initials)
// ═══════════════════════════════════════════════════════════════
function hydrateCommonUI(profile) {
    if (!profile) return;

    // 1. Header Greeting & User Avatar
    const greetingEl = document.getElementById("header-greeting-name");
    if (greetingEl) {
        greetingEl.textContent = profile.fullName ? profile.fullName.split(" ")[0] : "Student";
    }

    const sidebarNameEl = document.getElementById("sidebar-user-name");
    if (sidebarNameEl) {
        sidebarNameEl.textContent = profile.fullName || "Student Profile";
    }

    const sidebarRoleEl = document.getElementById("sidebar-user-role");
    if (sidebarRoleEl && profile.branch) {
        sidebarRoleEl.textContent = `${profile.branch} '${(profile.cohortYear || "2026").slice(-2)}`;
    }

    const sidebarMetaEl = document.getElementById("sidebar-user-meta");
    if (sidebarMetaEl) {
        sidebarMetaEl.textContent = `${profile.currentSem} • ${profile.cohortYear || "2026"}`;
    }

    const avatarEl = document.getElementById("sidebar-user-avatar");
    if (avatarEl) {
        const initials = (profile.fullName || "Student")
            .trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
        avatarEl.textContent = initials || "ST";
    }

    // 2. Semester & Status Badges in Header
    const semBadge = document.getElementById("header-sem-badge");
    if (semBadge) {
        semBadge.textContent = profile.currentSem || "Semester 6";
    }

    const updatedBadge = document.getElementById("header-updated-badge");
    if (updatedBadge) {
        updatedBadge.textContent = profile.lastUpdated || "Recently";
    }

    // 3. Mobile Navigation Drawer Toggle
    const toggleBtn = document.getElementById("mobile-nav-toggle");
    const sidebar = document.querySelector(".app-sidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// Page 1: Unified Data Input Page Handlers (input.html)
// ═══════════════════════════════════════════════════════════════
function initInputPage() {
    const profile = getStudentProfile();

    // 1. Populate basic inputs
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
    };

    setVal("input-full-name", profile.fullName);
    setVal("input-branch", profile.branch);
    setVal("input-cohort", profile.cohortYear);
    setVal("input-sem", profile.currentSem);
    setVal("input-tenth", profile.tenthPct);
    setVal("input-twelfth", profile.twelfthPct);
    setVal("input-cgpa", profile.cgpa);
    setVal("input-attendance", profile.attendancePct);
    setVal("input-backlogs", profile.activeBacklogs);

    setVal("input-projects", profile.projectsCount);
    setVal("input-internships", profile.internshipsCount);
    setVal("input-certifications", profile.certificationsCount);
    setVal("input-hackathons", profile.hackathonsCount);

    setVal("input-github", profile.githubUrl);
    setVal("input-leetcode", profile.leetcodeUrl);

    // 2. Populate and bind Technical Skill Chips
    const selectedSkills = new Set(profile.technicalSkills || []);
    const chipElements = document.querySelectorAll(".skill-chip");
    chipElements.forEach((chip) => {
        const skill = chip.getAttribute("data-skill");
        if (selectedSkills.has(skill)) {
            chip.classList.add("active");
            chip.setAttribute("aria-pressed", "true");
        } else {
            chip.classList.remove("active");
            chip.setAttribute("aria-pressed", "false");
        }

        chip.addEventListener("click", () => {
            const isActive = chip.classList.toggle("active");
            chip.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    });

    // 3. Populate and bind Soft Skill Sliders
    const soft = profile.softSkills || {};
    const bindSlider = (sliderId, labelId, initialVal, suffix = "%") => {
        const slider = document.getElementById(sliderId);
        const label = document.getElementById(labelId);
        if (slider) {
            slider.value = initialVal || 70;
            if (label) label.textContent = `${slider.value}${suffix}`;

            slider.addEventListener("input", (e) => {
                if (label) label.textContent = `${e.target.value}${suffix}`;
            });
        }
    };

    bindSlider("slider-communication", "val-communication", soft.communication);
    bindSlider("slider-problem-solving", "val-problem-solving", soft.problemSolving);
    bindSlider("slider-leadership", "val-leadership", soft.leadership);
    bindSlider("slider-adaptability", "val-adaptability", soft.adaptability);

    // 4. "Load Demo Profile" Helper Button
    const demoBtn = document.getElementById("btn-load-demo");
    if (demoBtn) {
        demoBtn.addEventListener("click", () => {
            saveStudentProfile(DEFAULT_STUDENT_PROFILE);
            window.location.reload();
        });
    }

    // 5. Form Submission
    const form = document.getElementById("student-input-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button[type='submit']");
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Save";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running ML Pipeline...';
            }

            // Extract selected technical skills
            const activeChips = document.querySelectorAll(".skill-chip.active");
            const skillsArray = Array.from(activeChips).map((c) => c.getAttribute("data-skill"));

            const parseNum = (id, fallback) => {
                const el = document.getElementById(id);
                if (!el || el.value === undefined || el.value === null || el.value.trim() === "") {
                    return fallback;
                }
                const num = Number(el.value);
                return isNaN(num) ? fallback : num;
            };

            const updatedProfile = {
                ...profile,
                fullName: document.getElementById("input-full-name")?.value || "Rohan Jha",
                branch: document.getElementById("input-branch")?.value || "Computer Science & Engineering",
                cohortYear: document.getElementById("input-cohort")?.value || "2026",
                currentSem: document.getElementById("input-sem")?.value || "Semester 6",
                tenthPct: parseNum("input-tenth", 90.0),
                twelfthPct: parseNum("input-twelfth", 88.0),
                cgpa: parseNum("input-cgpa", 8.5),
                attendancePct: parseNum("input-attendance", 85.0),
                activeBacklogs: Number(document.getElementById("input-backlogs")?.value) || 0,
                technicalSkills: skillsArray,
                softSkills: {
                    communication: Number(document.getElementById("slider-communication")?.value) || 75,
                    problemSolving: Number(document.getElementById("slider-problem-solving")?.value) || 85,
                    leadership: Number(document.getElementById("slider-leadership")?.value) || 70,
                    adaptability: Number(document.getElementById("slider-adaptability")?.value) || 80,
                },
                projectsCount: Number(document.getElementById("input-projects")?.value) || 0,
                internshipsCount: Number(document.getElementById("input-internships")?.value) || 0,
                certificationsCount: Number(document.getElementById("input-certifications")?.value) || 0,
                hackathonsCount: Number(document.getElementById("input-hackathons")?.value) || 0,
                githubUrl: document.getElementById("input-github")?.value || "",
                leetcodeUrl: document.getElementById("input-leetcode")?.value || "",
            };

            saveStudentProfile(updatedProfile);

            // Synchronize student data to backend DB and trigger ML inference
            try {
                await syncProfileToBackend(updatedProfile);
                await Promise.allSettled([
                    apiCall("/predictions/placement", "POST"),
                    apiCall("/career/recommend", "POST", { top_k: 5 })
                ]);
            } catch (err) {
                console.warn("Backend ML sync notification:", err);
            }

            // Redirect to Mentorship Dashboard
            window.location.href = "dashboard.html";
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// Page 2: Main Mentorship Dashboard Handlers (dashboard.html)
// ═══════════════════════════════════════════════════════════════
async function initDashboardPage() {
    const profile = getStudentProfile();

    // 1. Populate KPI Ribbon
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText("kpi-cgpa-val", Number(profile.cgpa).toFixed(2));
    setText("kpi-attendance-val", `${Number(profile.attendancePct).toFixed(1)}%`);
    setText("kpi-backlogs-val", `${profile.activeBacklogs} Active`);
    setText("kpi-solved-val", `${profile.problemsSolved || 240}+`);
    setText("kpi-commits-val", `${profile.totalCommits || 180}+`);

    // Baseline heuristic values (fallback if backend is offline)
    let readinessScore = calculatePlacementReadiness(profile);
    let careerMatches = calculateCareerMatches(profile);

    // 2. Render Card 1: Academic Trajectory Line Chart immediately (profile-only, no backend wait)
    renderAcademicTrajectoryChart(profile);

    // 3. Fetch Live ML Predictions from XGBoost & Cosine Recommender
    try {
        const [mlPred, mlCareer] = await Promise.allSettled([
            apiCall("/predictions/placement", "POST"),
            apiCall("/career/recommend", "POST", { top_k: 5 }),
        ]);

        if (mlPred.status === "fulfilled" && mlPred.value && typeof mlPred.value.placement_probability === "number") {
            readinessScore = Math.round(mlPred.value.placement_probability * 100);

            // Update badge with live ML tier
            const tierBadge = document.querySelector(".dash-card-header .badge");
            if (tierBadge && mlPred.value.readiness_tier) {
                tierBadge.textContent = `XGBoost: ${mlPred.value.readiness_tier}`;
            }
        }

        if (mlCareer.status === "fulfilled" && mlCareer.value && Array.isArray(mlCareer.value.recommendations) && mlCareer.value.recommendations.length > 0) {
            careerMatches = mlCareer.value.recommendations.map((rec, idx) => ({
                role: rec.career,
                matchPct: Math.round(rec.match_pct),
                tag: idx === 0 ? "Top Match" : idx === 1 ? "Strong Fit" : "Viable Pathway",
                rankClass: idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : "rank-3",
                fillClass: idx === 0 ? "fill-cyan" : idx === 1 ? "fill-purple" : "fill-slate",
                description: rec.description || "Calculated using Cosine Vector Proximity against industry benchmarks.",
            }));

            // Update Top Recommended Role in KPI ribbon
            const topRoleEl = document.querySelector(".kpi-card:nth-child(4) .kpi-value");
            if (topRoleEl && careerMatches[0]) {
                topRoleEl.textContent = careerMatches[0].role;
            }
            const skillsMatchEl = document.getElementById("kpi-skills-match-val");
            if (skillsMatchEl && careerMatches[0]) {
                skillsMatchEl.textContent = `${careerMatches[0].matchPct}% Match`;
            }
        }
    } catch (err) {
        console.warn("Could not retrieve live ML predictions, using fallback:", err);
    }

    // 4. Render Card 2: Placement Readiness Semi-Circle Donut Gauge (Chart.js)
    renderPlacementGaugeChart(readinessScore);

    // 5. Render Card 3: Career Direction Top Matches
    renderCareerDirectionList(careerMatches);
}

/**
 * Render Chart.js line chart comparing historical semester CGPAs with predicted trend.
 */
function renderAcademicTrajectoryChart(profile) {
    const ctx = document.getElementById("academicTrajectoryChart");
    if (!ctx || typeof Chart === "undefined") return;

    const hist = profile.historicalSemesters || [8.10, 8.35, 8.50, 8.90, 8.65];
    const predicted = profile.predictedNextCgpa || 8.85;

    // Dual series: historical and dotted projection
    const labels = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6 (Est)", "Sem 7 (Est)"];
    const historicalData = [...hist, null, null];
    const projectionData = [null, null, null, null, hist[hist.length - 1], predicted, Number((predicted + 0.1).toFixed(2))];

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Historical CGPA",
                    data: historicalData,
                    borderColor: "#22C55E",
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return "rgba(134, 239, 172, 0.1)";
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, "rgba(134, 239, 172, 0.25)");
                        gradient.addColorStop(1, "rgba(134, 239, 172, 0.0)");
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#22C55E",
                    pointBorderColor: "#FFFFFF",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: "AI Projected Trajectory",
                    data: projectionData,
                    borderColor: "#64748B",
                    borderDash: [6, 4],
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.35,
                    pointBackgroundColor: "#64748B",
                    pointBorderColor: "#FFFFFF",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    align: "end",
                    labels: {
                        color: "#334155",
                        font: { size: 11, family: "'Inter', sans-serif", weight: "600" },
                        boxWidth: 12,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: "#FFFFFF",
                    titleColor: "#111827",
                    bodyColor: "#16A34A",
                    borderColor: "#E5E7EB",
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                }
            },
            scales: {
                y: {
                    min: 7.0,
                    max: 10.0,
                    grid: {
                        color: "#E5E7EB",
                    },
                    ticks: {
                        color: "#64748b",
                        font: { family: "'JetBrains Mono', monospace", size: 11 },
                        stepSize: 0.5,
                    }
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#64748B",
                        font: { size: 11, weight: "500" },
                    }
                }
            }
        }
    });
}

/**
 * Render Chart.js semi-circle gauge donut chart for placement readiness score.
 */
function renderPlacementGaugeChart(readinessScore) {
    const ctx = document.getElementById("placementGaugeChart");
    if (!ctx || typeof Chart === "undefined") return;

    const remaining = Math.max(0, 100 - readinessScore);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Readiness Index", "Remediation Deficit"],
            datasets: [
                {
                    data: [readinessScore, remaining],
                    backgroundColor: [
                        "#22C55E",
                        "#E2E8F0"
                    ],
                    hoverBackgroundColor: [
                        "#16A34A",
                        "#E2E8F0"
                    ],
                    borderWidth: 0,
                    borderRadius: [10, 0],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: 270,
            cutout: "82%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });

    const percentText = document.getElementById("gauge-readout-percent");
    if (percentText) {
        percentText.textContent = `${readinessScore}%`;
    }
}

/**
 * Render dynamic list of top career matches.
 */
function renderCareerDirectionList(matches) {
    const container = document.getElementById("career-matches-container");
    if (!container || !Array.isArray(matches)) return;

    container.replaceChildren();

    matches.slice(0, 3).forEach((match, idx) => {
        const card = document.createElement("div");
        card.className = "career-item-card";

        const header = document.createElement("div");
        header.className = "career-item-header";

        const titleWrap = document.createElement("div");
        titleWrap.className = "career-title-wrap";

        const rankPill = document.createElement("span");
        rankPill.className = `career-rank-pill ${match.rankClass || ""}`.trim();
        rankPill.textContent = `#${idx + 1}`;

        const nameSpan = document.createElement("span");
        nameSpan.className = "career-name";
        nameSpan.textContent = match.role || "";

        titleWrap.appendChild(rankPill);
        titleWrap.appendChild(nameSpan);

        const scorePill = document.createElement("span");
        scorePill.className = "career-score-pill";
        scorePill.textContent = `${match.matchPct}% Match`;

        header.appendChild(titleWrap);
        header.appendChild(scorePill);

        const progressBg = document.createElement("div");
        progressBg.className = "career-progress-bar-bg";

        const progressFill = document.createElement("div");
        progressFill.className = `career-progress-fill ${match.fillClass || ""}`.trim();
        progressFill.style.width = `${match.matchPct}%`;

        progressBg.appendChild(progressFill);

        card.appendChild(header);
        card.appendChild(progressBg);

        container.appendChild(card);
    });
}

// ═══════════════════════════════════════════════════════════════
// Deep Dive Sub-Pages Handlers (academic.html, placement.html, career.html, roadmap.html)
// ═══════════════════════════════════════════════════════════════

/**
 * Page: academic.html (Detailed regression forecast & backlog risk)
 */
function initAcademicPage() {
    const profile = getStudentProfile();
    const ctx = document.getElementById("academicRegressionChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6 (Predicted)", "Sem 7 (Predicted)", "Sem 8 (Predicted)"],
                datasets: [
                    {
                        label: "Academic Performance",
                        data: [8.10, 8.35, 8.50, 8.90, 8.65, 8.85, 8.95, 9.05],
                        borderColor: "#22C55E",
                        backgroundColor: "rgba(134, 239, 172, 0.2)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                    },
                    {
                        label: "University Cohort Benchmark (CSE)",
                        data: [7.80, 7.90, 8.00, 8.10, 8.15, 8.20, 8.25, 8.30],
                        borderColor: "#94A3B8",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#111827" } }
                },
                scales: {
                    y: { min: 7.0, max: 10.0, grid: { color: "#E5E7EB" }, ticks: { color: "#64748B" } },
                    x: { grid: { display: false }, ticks: { color: "#111827" } }
                }
            }
        });
    }
}

/**
 * Page: placement.html (Classification factors & interview competency)
 */
async function initPlacementPage() {
    let factorLabels = ["Academic CGPA", "Algorithmic DSA", "Python / Core Tech", "Projects Portfolio", "Internships", "Communication"];
    let factorWeights = [28, 24, 18, 14, 10, 6];
    let readinessScore = 74;

    const FEATURE_PRETTY_NAMES = {
        cgpa: "Academic CGPA",
        attendance_pct: "Academic Attendance",
        active_backlogs: "Active Backlogs",
        dsa_score: "Algorithmic DSA",
        python_prof: "Python Proficiency",
        cpp_prof: "C++ Proficiency",
        aiml_knowledge: "AI/ML Modeling",
        total_commits: "GitHub Activity",
        problems_solved: "LeetCode Solved",
        contest_rating: "Contest Rating",
        project_count: "Projects Portfolio",
        communication_score: "Communication & Soft Skills",
        internship_exp: "Internship Experience"
    };

    try {
        const mlPred = await apiCall("/predictions/placement", "POST");
        if (mlPred && typeof mlPred.placement_probability === "number") {
            readinessScore = Math.round(mlPred.placement_probability * 100);

            const scoreBanner = document.querySelector(".page-intro-banner .badge-success");
            if (scoreBanner) {
                scoreBanner.replaceChildren();
                const icon = document.createElement("i");
                icon.className = "fa-solid fa-shield-halved";
                scoreBanner.appendChild(icon);
                const tier = mlPred.readiness_tier || "Assessment Pending";
                scoreBanner.appendChild(document.createTextNode(` Overall Score: ${readinessScore}% (${tier})`));
            }

            if (mlPred.feature_importance && typeof mlPred.feature_importance === "object") {
                const sorted = Object.entries(mlPred.feature_importance)
                    .map(([k, v]) => ({ key: k, label: FEATURE_PRETTY_NAMES[k] || k, weight: Math.round(v * 100) }))
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 6);

                if (sorted.length > 0) {
                    factorLabels = sorted.map(s => s.label);
                    factorWeights = sorted.map(s => s.weight);
                }
            }
        }
    } catch (e) {
        console.warn("Could not load ML placement factors:", e);
    }

    const ctx = document.getElementById("placementFactorsChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: factorLabels,
                datasets: [{
                    label: "XGBoost Model Feature Impact Weight (%)",
                    data: factorWeights,
                    backgroundColor: [
                        "#22C55E",
                        "#4ADE80",
                        "#86EFAC",
                        "#A7F3D0",
                        "#BBF7D0",
                        "#DCFCE7"
                    ],
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: { max: Math.max(...factorWeights, 35) + 5, grid: { color: "#E5E7EB" }, ticks: { color: "#64748B" } },
                    y: { grid: { display: false }, ticks: { color: "#111827" } }
                }
            }
        });
    }
}

/**
 * Page: career.html (Radar Comparison: Current vs Role Requirements)
 */
async function initCareerPage() {
    const profile = getStudentProfile();
    const topBadge = document.getElementById("top-career-match-badge");

    try {
        const mlCareer = await apiCall("/career/recommend", "POST", { top_k: 5 });
        if (mlCareer && Array.isArray(mlCareer.recommendations) && mlCareer.recommendations.length > 0) {
            const top = mlCareer.recommendations[0];
            if (topBadge) {
                topBadge.textContent = `#1 Match: ${top.career} (${Math.round(top.match_pct)}%)`;
            }

            const tableBody = document.querySelector(".data-table tbody");
            if (tableBody) {
                tableBody.replaceChildren();
                mlCareer.recommendations.slice(0, 5).forEach((rec, idx) => {
                    const tr = document.createElement("tr");
                    const rankClass = idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : "rank-3";

                    const tdRank = document.createElement("td");
                    const rankSpan = document.createElement("span");
                    rankSpan.className = `career-rank-pill ${rankClass}`;
                    rankSpan.textContent = `#${idx + 1}`;
                    tdRank.appendChild(rankSpan);

                    const tdRole = document.createElement("td");
                    const strongRole = document.createElement("strong");
                    strongRole.textContent = rec.career || "";
                    tdRole.appendChild(strongRole);

                    const tdMatch = document.createElement("td");
                    const matchSpan = document.createElement("span");
                    matchSpan.style.fontFamily = "var(--font-mono)";
                    matchSpan.style.color = "#16A34A";
                    matchSpan.style.fontWeight = "700";
                    matchSpan.textContent = `${Math.round(rec.match_pct)}% Match`;
                    tdMatch.appendChild(matchSpan);

                    const tdDesc = document.createElement("td");
                    const descBadge = document.createElement("span");
                    descBadge.className = `badge ${idx === 0 ? "badge-success" : "badge-neutral"}`;
                    descBadge.textContent = rec.description || "Target Pathway";
                    tdDesc.appendChild(descBadge);

                    tr.replaceChildren(tdRank, tdRole, tdMatch, tdDesc);
                    tableBody.appendChild(tr);
                });
            }
        }
    } catch (e) {
        console.warn("Could not load ML career recommendations:", e);
    }

    const ctx = document.getElementById("careerRadarChart");
    if (ctx && typeof Chart !== "undefined") {
        const skillsList = Array.isArray(profile.technicalSkills) ? profile.technicalSkills : [];
        const studentScores = [
            skillsList.includes("DSA") ? 85 : 45,
            skillsList.includes("Python") ? 90 : 40,
            skillsList.includes("C/C++") ? 80 : 35,
            skillsList.includes("AI/ML") ? 85 : 30,
            skillsList.includes("SQL") ? 80 : 35,
            Number(profile.softSkills?.communication) || 75
        ];

        new Chart(ctx, {
            type: "radar",
            data: {
                labels: ["DSA Mastery", "Python & Scripting", "System Architecture", "AI/ML Modeling", "SQL & Pipelines", "Soft Skills"],
                datasets: [
                    {
                        label: "Current Student Profile",
                        data: studentScores,
                        borderColor: "#22C55E",
                        backgroundColor: "rgba(134, 239, 172, 0.25)",
                        pointBackgroundColor: "#22C55E",
                        borderWidth: 2,
                    },
                    {
                        label: "Ideal Target (Data / ML Engineer)",
                        data: [85, 90, 80, 85, 85, 80],
                        borderColor: "#0284C7",
                        backgroundColor: "rgba(2, 132, 199, 0.12)",
                        pointBackgroundColor: "#0284C7",
                        borderDash: [4, 4],
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#111827" } }
                },
                scales: {
                    r: {
                        angleLines: { color: "#E5E7EB" },
                        grid: { color: "#E5E7EB" },
                        pointLabels: { color: "#111827", font: { size: 11 } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                }
            }
        });
    }
}

/**
 * Page: roadmap.html (Interactive Skill-Gap Task Checklist)
 */
function initRoadmapPage() {
    const checkboxes = document.querySelectorAll(".roadmap-task-check");
    const progressFill = document.getElementById("roadmap-progress-fill");
    const progressText = document.getElementById("roadmap-progress-percent");

    const updateRoadmapProgress = () => {
        const total = checkboxes.length;
        if (total === 0) return;
        let checked = 0;
        checkboxes.forEach((cb) => {
            if (cb.checked) checked++;
        });

        const pct = Math.round((checked / total) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}% Complete (${checked}/${total} Tasks)`;
    };

    checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => {
            const item = cb.closest(".roadmap-item");
            if (item) {
                if (cb.checked) item.classList.add("completed");
                else item.classList.remove("completed");
            }
            updateRoadmapProgress();
        });
    });

    updateRoadmapProgress();
}



// ═══════════════════════════════════════════════════════════════
// Main Landing Dashboard Controller (Black & Gold Theme)
// ═══════════════════════════════════════════════════════════════
function initLandingDashboard() {
    // 1. Dynamic Rotating & Fading Subtitles
    const dynamicTarget = document.getElementById("dynamic-subtitle-target");
    if (dynamicTarget) {
        const phrases = [
            "actionable intelligence.",
            "predictive career trajectories.",
            "quantitative placement probabilities.",
            "sequenced milestone roadmaps.",
            "deep academic forecasts."
        ];
        let phraseIdx = 0;
        setInterval(() => {
            dynamicTarget.style.opacity = "0";
            dynamicTarget.style.transform = "translateY(8px)";
            setTimeout(() => {
                phraseIdx = (phraseIdx + 1) % phrases.length;
                dynamicTarget.textContent = phrases[phraseIdx];
                dynamicTarget.style.opacity = "1";
                dynamicTarget.style.transform = "translateY(0)";
            }, 450);
        }, 3600);
    }


    // 3. Header Scrolled Glass Effect
    const header = document.getElementById("landing-header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }, { passive: true });
    }
}

// ═══════════════════════════════════════════════════════════════
// Real-Time Backend & ML Inference Engine Status Monitor
// ═══════════════════════════════════════════════════════════════

function getHealthEndpointUrl() {
    if (typeof API_BASE_URL !== "undefined" && API_BASE_URL) {
        return `${API_BASE_URL}/health`;
    }
    if (window.API_BASE_URL) {
        return `${window.API_BASE_URL}/health`;
    }
    const isLocalStatic = window.location.port === "8000" || window.location.port === "5500" || window.location.port === "3000";
    if (!isLocalStatic && window.location.origin && window.location.origin.startsWith("http")) {
        return "/api/health";
    }
    return "http://localhost:5000/api/health";
}

async function checkSystemHealth() {
    const pill = document.getElementById("system-status-pill");
    const text = document.getElementById("system-status-text");

    if (!pill || !text) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const healthUrl = getHealthEndpointUrl();
        const response = await fetch(healthUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        let data = null;
        if (response.ok || response.status === 503) {
            try {
                data = await response.json();
            } catch (jsonErr) {
                setSystemOffline(pill, text, `HTTP ${response.status}: Service Unavailable`);
                return;
            }
        } else {
            setSystemOffline(pill, text, `HTTP ${response.status}: Service Unavailable`);
            return;
        }

        // System is ONLINE only when backend is running AND ML models are fully active
        const isOnline = Boolean(
            data &&
            data.status === "online" &&
            data.models_active === true &&
            data.models &&
            data.models.placement_model === true &&
            data.models.career_recommender === true
        );

        if (isOnline) {
            setSystemOnline(pill, text);
        } else {
            let reason = "ML Engine not activated";
            if (data && data.models) {
                if (!data.models.placement_model && !data.models.career_recommender) {
                    reason = "Placement & Career models offline";
                } else if (!data.models.placement_model) {
                    reason = "Placement XGBoost model offline";
                } else if (!data.models.career_recommender) {
                    reason = "Career Recommender offline";
                }
            } else if (response.status === 503) {
                reason = "ML Inference Service Unavailable";
            }
            setSystemOffline(pill, text, reason);
        }
    } catch (err) {
        setSystemOffline(pill, text, "Backend API offline (connection refused)");
    }
}

function setSystemOnline(pill, text) {
    pill.classList.remove("offline", "checking");
    pill.classList.add("online");
    text.textContent = "SYSTEM ONLINE";
    pill.title = "Backend & ML Inference Engine Live (XGBoost + Cosine Recommender Ready)";
}

function setSystemOffline(pill, text, reason = "Backend or ML models offline") {
    pill.classList.remove("online", "checking");
    pill.classList.add("offline");
    text.textContent = "SYSTEM OFFLINE";
    pill.title = `System Offline: ${reason}`;
}

function initSystemStatusMonitor() {
    const pill = document.getElementById("system-status-pill");
    if (!pill) return;

    // Check immediately upon initial page render
    checkSystemHealth();

    // Poll every 5 seconds for real-time status updates
    setInterval(checkSystemHealth, 5000);
}

// ═══════════════════════════════════════════════════════════════
// Master DOMContentLoaded Dispatcher
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const profile = getStudentProfile();
    hydrateCommonUI(profile);
    initSystemStatusMonitor();

    // Identify active view based on elements or pathname
    if (document.querySelector(".landing-hero-section") || document.querySelector(".hero-quote-text")) {
        initLandingDashboard();
    }

    if (document.getElementById("student-input-form")) {
        initInputPage();
    } else if (document.getElementById("academicTrajectoryChart")) {
        initDashboardPage();
    }

    if (document.getElementById("academicRegressionChart")) {
        initAcademicPage();
    }

    if (document.getElementById("placementFactorsChart")) {
        initPlacementPage();
    }

    if (document.getElementById("careerRadarChart")) {
        initCareerPage();
    }

    if (document.querySelector(".roadmap-task-check")) {
        initRoadmapPage();
    }
});
