/**
 * Dron-AI Main Application Controller
 *
 * Coordinates authentication verification, profile state, live slider updates,
 * API mutations, and invokes ML inference, career recommendations, and roadmaps.
 */

let cachedStudentData = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Enforce authentication guard
    if (typeof checkAuth === "function") {
        checkAuth();
    }

    // 2. Setup interactive UI listeners
    setupSliderListeners();
    setupProfileActions();
    setupLogout();

    // 3. Initialize feature sections
    if (typeof initPlacementSection === "function") {
        initPlacementSection();
    }
    if (typeof initMetricsSection === "function") {
        initMetricsSection();
    }

    // 4. Load full student profile and kick off ML analysis
    await loadInitialDashboard();
});

/**
 * Load full student profile and populate dashboard fields.
 */
async function loadInitialDashboard() {
    try {
        const data = await apiRequest("/users/profile", { method: "GET" });
        cachedStudentData = data;
        populateDashboardFields(data);

        // Run initial placement prediction and career recommendations
        if (typeof analyzePlacement === "function") {
            analyzePlacement();
        }
        if (typeof getCareerRecommendations === "function") {
            getCareerRecommendations();
        }
    } catch (error) {
        console.error("Dashboard initialization error:", error);
        if (error.message && error.message.includes("401")) {
            clearToken();
            window.location.href = "login.html";
        }
    }
}

/**
 * Populate all inputs, sliders, and navbar with profile data.
 */
function populateDashboardFields(data) {
    if (!data) return;

    const user = data.user || {};
    const academics = Array.isArray(data.academics) ? data.academics : [];
    const links = data.platform_links || data.links || {};
    const skills = data.skills || {};

    // 1. Navbar
    const navName = document.getElementById("nav-username");
    const navAvatar = document.getElementById("nav-avatar");
    const navRole = document.getElementById("nav-user-role");

    if (navName && user.full_name) {
        navName.textContent = user.full_name;
    }
    if (navAvatar && user.full_name) {
        const initials = user.full_name
            .trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
        navAvatar.textContent = initials || "ST";
    }
    if (navRole) {
        const branch = user.academic_branch || "Engineering";
        const cohort = user.cohort_year ? ` • Class of ${user.cohort_year}` : "";
        navRole.textContent = `${branch}${cohort}`;
    }

    // 2. Student Demographics Form
    const inputName = document.getElementById("input-full-name");
    const inputBranch = document.getElementById("input-branch");
    const inputCohort = document.getElementById("input-cohort");

    if (inputName && user.full_name) inputName.value = user.full_name;
    if (inputBranch && user.academic_branch) inputBranch.value = user.academic_branch;
    if (inputCohort && user.cohort_year) inputCohort.value = user.cohort_year;

    // 3. Academic Metrics (Latest semester)
    let latestSem = academics.length > 0
        ? [...academics].sort((a, b) => (b.semester || 0) - (a.semester || 0))[0]
        : { cgpa: 8.5, attendance_pct: 88.0, active_backlogs: 0 };

    const inputCgpa = document.getElementById("input-cgpa");
    const inputAttendance = document.getElementById("input-attendance");
    const inputBacklogs = document.getElementById("input-backlogs");

    if (inputCgpa && latestSem.cgpa !== undefined) inputCgpa.value = latestSem.cgpa;
    if (inputAttendance && latestSem.attendance_pct !== undefined) inputAttendance.value = latestSem.attendance_pct;
    if (inputBacklogs && latestSem.active_backlogs !== undefined) inputBacklogs.value = latestSem.active_backlogs;

    // 4. Platform Handles
    const inputGithub = document.getElementById("input-github");
    const inputLeetcode = document.getElementById("input-leetcode");

    if (inputGithub && (links.github_username || links.github_handle)) {
        inputGithub.value = links.github_username || links.github_handle;
    }
    if (inputLeetcode && links.leetcode_username) {
        inputLeetcode.value = links.leetcode_username;
    }

    // 5. 10D Skill Sliders
    setSliderValue("slider-dsa", "val-dsa", skills.dsa_score !== undefined ? skills.dsa_score : 80, "/ 100");
    setSliderValue("slider-python", "val-python", skills.python_prof !== undefined ? skills.python_prof : 85, "/ 100");
    setSliderValue("slider-cpp", "val-cpp", skills.cpp_prof !== undefined ? skills.cpp_prof : 75, "/ 100");
    setSliderValue("slider-aiml", "val-aiml", skills.aiml_knowledge !== undefined ? skills.aiml_knowledge : 70, "/ 100");
    setSliderValue("slider-comm", "val-comm", skills.communication_score !== undefined ? skills.communication_score : 70, "/ 100");
    setSliderValue("slider-internship", "val-internship", skills.internship_exp !== undefined ? skills.internship_exp : 3, " Mos");

    // Secondary platform counts
    const inputCommits = document.getElementById("input-commits");
    const inputSolved = document.getElementById("input-solved");
    const inputRating = document.getElementById("input-rating");

    if (inputCommits && skills.total_commits !== undefined) inputCommits.value = skills.total_commits;
    if (inputSolved && skills.problems_solved !== undefined) inputSolved.value = skills.problems_solved;
    if (inputRating && skills.contest_rating !== undefined) inputRating.value = Math.round(skills.contest_rating);

    // Sync metric card counters
    const gCommits = document.getElementById("metric-github-commits");
    const lSolved = document.getElementById("metric-leetcode-solved");
    const lRating = document.getElementById("metric-leetcode-rating");

    if (gCommits && skills.total_commits !== undefined) gCommits.textContent = skills.total_commits;
    if (lSolved && skills.problems_solved !== undefined) lSolved.textContent = skills.problems_solved;
    if (lRating && skills.contest_rating !== undefined) lRating.textContent = Math.round(skills.contest_rating);
}

/**
 * Helper to update slider and its corresponding display span.
 */
function setSliderValue(sliderId, labelId, val, unit) {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    const num = Math.round(Number(val) || 0);

    if (slider) slider.value = num;
    if (label) label.textContent = `${num} ${unit}`;
}

/**
 * Bind live input events to all range sliders so they update text immediately.
 */
function setupSliderListeners() {
    const sliders = [
        { slider: "slider-dsa", label: "val-dsa", unit: "/ 100" },
        { slider: "slider-python", label: "val-python", unit: "/ 100" },
        { slider: "slider-cpp", label: "val-cpp", unit: "/ 100" },
        { slider: "slider-aiml", label: "val-aiml", unit: "/ 100" },
        { slider: "slider-comm", label: "val-comm", unit: "/ 100" },
        { slider: "slider-internship", label: "val-internship", unit: "Mos" },
    ];

    sliders.forEach(({ slider, label, unit }) => {
        const sliderEl = document.getElementById(slider);
        const labelEl = document.getElementById(label);
        if (sliderEl && labelEl) {
            sliderEl.addEventListener("input", (e) => {
                labelEl.textContent = `${e.target.value} ${unit}`;
            });
        }
    });
}

/**
 * Handle "Save Profile Vector" and "Reset Defaults".
 */
function setupProfileActions() {
    const saveBtn = document.getElementById("btn-save-profile");
    const resetBtn = document.getElementById("btn-reset-profile");
    const statusSpan = document.getElementById("profile-save-status");

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (cachedStudentData) {
                populateDashboardFields(cachedStudentData);
                showStatusMessage("Profile reset to saved values", "info");
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving...";

            const payload = {
                full_name: document.getElementById("input-full-name")?.value?.trim() || "Student",
                academic_branch: document.getElementById("input-branch")?.value || "Computer Science",
                cohort_year: parseInt(document.getElementById("input-cohort")?.value) || 2026,
                academics: [
                    {
                        semester: cachedStudentData?.academics?.[0]?.semester ?? 6,
                        cgpa: (() => { const v = parseFloat(document.getElementById("input-cgpa")?.value); return Number.isFinite(v) ? v : 8.0; })(),
                        attendance_pct: (() => { const v = parseFloat(document.getElementById("input-attendance")?.value); return Number.isFinite(v) ? v : 85.0; })(),
                        active_backlogs: parseInt(document.getElementById("input-backlogs")?.value) || 0,
                    },
                ],
                platform_links: {
                    github_username: document.getElementById("input-github")?.value?.trim() || "",
                    leetcode_username: document.getElementById("input-leetcode")?.value?.trim() || "",
                },
                skills: {
                    dsa_score: parseFloat(document.getElementById("slider-dsa")?.value) || 0,
                    python_prof: parseFloat(document.getElementById("slider-python")?.value) || 0,
                    cpp_prof: parseFloat(document.getElementById("slider-cpp")?.value) || 0,
                    aiml_knowledge: parseFloat(document.getElementById("slider-aiml")?.value) || 0,
                    communication_score: parseFloat(document.getElementById("slider-comm")?.value) || 0,
                    internship_exp: parseInt(document.getElementById("slider-internship")?.value) || 0,
                    total_commits: parseInt(document.getElementById("input-commits")?.value) || 0,
                    problems_solved: parseInt(document.getElementById("input-solved")?.value) || 0,
                    contest_rating: parseFloat(document.getElementById("input-rating")?.value) || 0,
                    project_count: cachedStudentData?.skills?.project_count ?? 4,
                },
            };

            try {
                const res = await apiRequest("/users/profile", {
                    method: "PUT",
                    body: payload,
                });

                cachedStudentData = res.profile || payload;
                showStatusMessage("✓ Profile vector saved! Re-calculating predictions...", "success");

                // Update navbar display immediately
                const navName = document.getElementById("nav-username");
                if (navName) navName.textContent = payload.full_name;

                // Automatically re-run placement and career analysis with the new vector
                if (typeof analyzePlacement === "function") {
                    await analyzePlacement();
                }
                if (typeof getCareerRecommendations === "function") {
                    await getCareerRecommendations();
                }

            } catch (error) {
                console.error("Save profile failed:", error);
                showStatusMessage(`Error saving profile: ${error.message}`, "error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Profile Vector";
            }
        });
    }
}

/**
 * Display toast / alert message for profile actions.
 */
function showStatusMessage(msg, type = "success") {
    const el = document.getElementById("profile-save-status");
    if (!el) return;

    el.textContent = msg;
    el.style.display = "inline-block";
    el.style.color = type === "success" ? "var(--color-success)" : type === "error" ? "var(--color-danger)" : "var(--color-accent-light)";

    setTimeout(() => {
        el.style.display = "none";
    }, 4000);
}

/**
 * Setup logout button handler.
 */
function setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearToken();
            window.location.href = "login.html";
        });
    }
}
