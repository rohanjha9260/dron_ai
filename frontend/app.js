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
    // 1. Header Greeting & User Avatar
    const greetingEl = document.getElementById("header-greeting-name");
    if (greetingEl) {
        greetingEl.textContent = profile.fullName ? profile.fullName.split(" ")[0] : "Student";
    }

    const sidebarNameEl = document.getElementById("sidebar-user-name");
    if (sidebarNameEl) {
        sidebarNameEl.textContent = profile.fullName || "Student Profile";
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
        } else {
            chip.classList.remove("active");
        }

        chip.addEventListener("click", () => {
            chip.classList.toggle("active");
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
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            // Extract selected technical skills
            const activeChips = document.querySelectorAll(".skill-chip.active");
            const skillsArray = Array.from(activeChips).map((c) => c.getAttribute("data-skill"));

            const updatedProfile = {
                ...profile,
                fullName: document.getElementById("input-full-name")?.value || "Rohan Jha",
                branch: document.getElementById("input-branch")?.value || "Computer Science & Engineering",
                cohortYear: document.getElementById("input-cohort")?.value || "2026",
                currentSem: document.getElementById("input-sem")?.value || "Semester 6",
                tenthPct: Number(document.getElementById("input-tenth")?.value) || 90.0,
                twelfthPct: Number(document.getElementById("input-twelfth")?.value) || 88.0,
                cgpa: Number(document.getElementById("input-cgpa")?.value) || 8.5,
                attendancePct: Number(document.getElementById("input-attendance")?.value) || 85.0,
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

            // Redirect to Mentorship Dashboard
            window.location.href = "dashboard.html";
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// Page 2: Main Mentorship Dashboard Handlers (dashboard.html)
// ═══════════════════════════════════════════════════════════════
function initDashboardPage() {
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

    const readinessScore = calculatePlacementReadiness(profile);
    const careerMatches = calculateCareerMatches(profile);

    // 2. Render Card 1: Academic Trajectory Line Chart (Chart.js)
    renderAcademicTrajectoryChart(profile);

    // 3. Render Card 2: Placement Readiness Semi-Circle Donut Gauge (Chart.js)
    renderPlacementGaugeChart(readinessScore);

    // 4. Render Card 3: Career Direction Top Matches
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
                    borderColor: "#00d2ff",
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return "rgba(0, 210, 255, 0.1)";
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, "rgba(0, 210, 255, 0.35)");
                        gradient.addColorStop(1, "rgba(0, 210, 255, 0.0)");
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#00d2ff",
                    pointBorderColor: "#0c1017",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: "AI Projected Trajectory",
                    data: projectionData,
                    borderColor: "#a855f7",
                    borderDash: [6, 4],
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.35,
                    pointBackgroundColor: "#a855f7",
                    pointBorderColor: "#0c1017",
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
                        color: "#94a3b8",
                        font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
                        boxWidth: 12,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: "#161f30",
                    titleColor: "#f8fafc",
                    bodyColor: "#38bdf8",
                    borderColor: "#23324d",
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
                        color: "rgba(35, 50, 77, 0.5)",
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
                        color: "#94a3b8",
                        font: { size: 11 },
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
                        "#00d2ff",
                        "#1e293b"
                    ],
                    hoverBackgroundColor: [
                        "#38bdf8",
                        "#1e293b"
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
    if (!container) return;

    container.innerHTML = matches.slice(0, 3).map((match, idx) => `
        <div class="career-item-card">
            <div class="career-item-header">
                <div class="career-title-wrap">
                    <span class="career-rank-pill ${match.rankClass}">#${idx + 1}</span>
                    <span class="career-name">${match.role}</span>
                </div>
                <span class="career-score-pill">${match.matchPct}% Match</span>
            </div>
            <div class="career-progress-bar-bg">
                <div class="career-progress-fill ${match.fillClass}" style="width: ${match.matchPct}%;"></div>
            </div>
        </div>
    `).join("");
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
                        borderColor: "#00d2ff",
                        backgroundColor: "rgba(0, 210, 255, 0.15)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                    },
                    {
                        label: "University Cohort Benchmark (CSE)",
                        data: [7.80, 7.90, 8.00, 8.10, 8.15, 8.20, 8.25, 8.30],
                        borderColor: "rgba(148, 163, 184, 0.4)",
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#94a3b8" } }
                },
                scales: {
                    y: { min: 7.0, max: 10.0, grid: { color: "#23324d" }, ticks: { color: "#64748b" } },
                    x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
                }
            }
        });
    }
}

/**
 * Page: placement.html (Classification factors & interview competency)
 */
function initPlacementPage() {
    const ctx = document.getElementById("placementFactorsChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Academic CGPA", "Algorithmic DSA", "Python / Core Tech", "Projects Portfolio", "Internships", "Communication"],
                datasets: [{
                    label: "XGBoost Model Feature Impact Weight (%)",
                    data: [28, 24, 18, 14, 10, 6],
                    backgroundColor: [
                        "#00d2ff",
                        "#38bdf8",
                        "#818cf8",
                        "#a855f7",
                        "#c084fc",
                        "#e879f9"
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
                    x: { max: 35, grid: { color: "#23324d" }, ticks: { color: "#64748b" } },
                    y: { grid: { display: false }, ticks: { color: "#94a3b8" } }
                }
            }
        });
    }
}

/**
 * Page: career.html (Radar Comparison: Current vs Role Requirements)
 */
function initCareerPage() {
    const ctx = document.getElementById("careerRadarChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "radar",
            data: {
                labels: ["DSA Mastery", "Python & Scripting", "System Architecture", "AI/ML Modeling", "SQL & Pipelines", "Soft Skills"],
                datasets: [
                    {
                        label: "Current Student Profile",
                        data: [82, 88, 65, 80, 75, 76],
                        borderColor: "#00d2ff",
                        backgroundColor: "rgba(0, 210, 255, 0.25)",
                        pointBackgroundColor: "#00d2ff",
                        borderWidth: 2,
                    },
                    {
                        label: "Ideal Target (Data / ML Engineer)",
                        data: [85, 90, 80, 85, 85, 80],
                        borderColor: "#a855f7",
                        backgroundColor: "rgba(168, 85, 247, 0.15)",
                        pointBackgroundColor: "#a855f7",
                        borderDash: [4, 4],
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#94a3b8" } }
                },
                scales: {
                    r: {
                        angleLines: { color: "#23324d" },
                        grid: { color: "#23324d" },
                        pointLabels: { color: "#94a3b8", font: { size: 11 } },
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

/**
 * Hydrate shared sidebar and header student profile indicators safely if elements exist.
 */
function hydrateCommonUI(profile) {
    if (!profile) return;
    const nameEl = document.getElementById("sidebar-user-name");
    const roleEl = document.getElementById("sidebar-user-role");
    const avatarEl = document.getElementById("sidebar-user-avatar");
    if (nameEl && profile.fullName) nameEl.textContent = profile.fullName;
    if (roleEl && profile.branch) roleEl.textContent = `${profile.branch} '${(profile.cohortYear || "2026").slice(-2)}`;
    if (avatarEl && profile.fullName) {
        avatarEl.textContent = profile.fullName.trim().split(/\s+/).map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    }
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

    // 2. Interactive Spotlight & Glow Physics on the 4 Engine Navigation Cards
    const cards = document.querySelectorAll(".engine-card");
    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const glowLayer = card.querySelector(".card-glow-layer");
            if (glowLayer) {
                glowLayer.style.background = `radial-gradient(circle 300px at ${x}px ${y}px, rgba(255, 215, 0, 0.22) 0%, rgba(212, 175, 55, 0.06) 50%, transparent 80%)`;
                glowLayer.style.opacity = "1";
            }
        });

        card.addEventListener("mouseleave", () => {
            const glowLayer = card.querySelector(".card-glow-layer");
            if (glowLayer) {
                glowLayer.style.background = "";
                glowLayer.style.opacity = "";
            }
        });
    });

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
// Master DOMContentLoaded Dispatcher
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const profile = getStudentProfile();
    hydrateCommonUI(profile);

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
