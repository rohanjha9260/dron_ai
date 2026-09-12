/**
 * Dron-AI Student Profile Module
 *
 * Handles:
 *   - Fetching and displaying the unified student profile
 *   - Skeleton loading states
 *   - Dynamic skill progress bars calculation (0-100%)
 *   - Tabbed profile editing modal (Personal, Academic, Handles, Skills)
 *   - Client-side validation and live dashboard updates
 */

// Cache currently loaded profile data for immediate modal pre-filling
let cachedProfileData = null;

/**
 * Helper: Escape HTML strings to prevent XSS injection.
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Helper: Extract user initials from name for avatar display.
 */
function getInitials(name) {
    if (!name || typeof name !== "string" || name.trim() === "") return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Load and render the student's profile in the dashboard.
 */
async function loadProfile() {
    const container = document.getElementById("profile-content");
    if (!container) return;

    // Show skeleton loader if available
    const existingSkeleton = document.getElementById("profile-skeleton");
    if (existingSkeleton) {
        existingSkeleton.style.display = "flex";
    }

    try {
        const data = await apiRequest("/users/profile", { method: "GET" });
        cachedProfileData = data;
        renderProfile(data);
    } catch (error) {
        console.error("Failed to load profile:", error);
        container.innerHTML = `
            <div class="error-message">
                <p>Failed to load profile data: ${escapeHtml(error.message)}</p>
                <button type="button" class="btn btn-small btn-outline" style="margin-top: 8px;" onclick="loadProfile()">
                    Retry
                </button>
            </div>
        `;
    }
}

/**
 * Render the student profile panel with statistics, handles, and dynamic skill progress bars.
 *
 * @param {object} data - Profile payload from GET /api/users/profile
 */
function renderProfile(data) {
    const container = document.getElementById("profile-content");
    if (!container) return;

    const user = (data && data.user) || {};
    const academics = Array.isArray(data && data.academics) ? data.academics : [];
    const links = (data && (data.platform_links || data.links)) || {};
    const skills = (data && data.skills) || {};

    // 1. Resolve Academic Highlights (latest semester record)
    let latestSem = null;
    if (academics.length > 0) {
        latestSem = [...academics].sort((a, b) => (b.semester || 0) - (a.semester || 0))[0];
    }

    const cgpaDisplay = latestSem && latestSem.cgpa !== null && latestSem.cgpa !== undefined
        ? Number(latestSem.cgpa).toFixed(2)
        : "--";
    const attendanceDisplay = latestSem && latestSem.attendance_pct !== null && latestSem.attendance_pct !== undefined
        ? `${Number(latestSem.attendance_pct).toFixed(1)}%`
        : "--";
    const backlogsDisplay = latestSem && latestSem.active_backlogs !== null && latestSem.active_backlogs !== undefined
        ? String(latestSem.active_backlogs)
        : "0";
    const semesterDisplay = latestSem && latestSem.semester
        ? `Sem ${latestSem.semester}`
        : "--";

    // 2. Primary Technical Skills for Progress Bars (0 - 100)
    const technicalSkills = [
        { label: "DSA & Algorithms", key: "dsa_score", val: Number(skills.dsa_score) || 0 },
        { label: "Python Proficiency", key: "python_prof", val: Number(skills.python_prof) || 0 },
        { label: "C++ Proficiency", key: "cpp_prof", val: Number(skills.cpp_prof) || 0 },
        { label: "AI / ML Knowledge", key: "aiml_knowledge", val: Number(skills.aiml_knowledge) || 0 },
        { label: "Communication", key: "communication_score", val: Number(skills.communication_score) || 0 },
    ];

    // Build Dynamic Skill Bars HTML
    const skillBarsHtml = technicalSkills.map((skill) => {
        const clampedScore = Math.max(0, Math.min(100, Math.round(skill.val)));
        return `
            <div class="skill-bar-item">
                <div class="skill-bar-header">
                    <span class="skill-name">${escapeHtml(skill.label)}</span>
                    <span class="skill-score">${clampedScore}%</span>
                </div>
                <div class="skill-track">
                    <div class="skill-fill" style="width: ${clampedScore}%;"></div>
                </div>
            </div>
        `;
    }).join("");

    // 3. Platform Handles HTML
    const githubHtml = links.github_username
        ? `<a href="https://github.com/${encodeURIComponent(links.github_username)}" target="_blank" rel="noopener noreferrer" class="handle-chip">
             🐙 @${escapeHtml(links.github_username)}
           </a>`
        : `<span class="handle-chip empty">🐙 GitHub: Not set</span>`;

    const leetcodeHtml = links.leetcode_username
        ? `<a href="https://leetcode.com/${encodeURIComponent(links.leetcode_username)}" target="_blank" rel="noopener noreferrer" class="handle-chip">
             ⚡ @${escapeHtml(links.leetcode_username)}
           </a>`
        : `<span class="handle-chip empty">⚡ LeetCode: Not set</span>`;

    const linkedinHtml = links.linkedin_url
        ? `<a href="${escapeHtml(links.linkedin_url)}" target="_blank" rel="noopener noreferrer" class="handle-chip">
             💼 LinkedIn Profile
           </a>`
        : `<span class="handle-chip empty">💼 LinkedIn: Not set</span>`;

    // 4. Secondary Platform & Project Metrics
    const projectCount = skills.project_count !== undefined && skills.project_count !== null ? skills.project_count : 0;
    const internshipMonths = skills.internship_exp !== undefined && skills.internship_exp !== null ? skills.internship_exp : 0;
    const contestRating = skills.contest_rating ? Math.round(skills.contest_rating) : "--";

    // Assemble Full Profile Card HTML
    container.innerHTML = `
        <div class="profile-container">
            <!-- Header Section: Avatar & Details -->
            <div class="profile-header-wrap">
                <div class="profile-avatar" id="profile-avatar-initials">
                    ${getInitials(user.full_name)}
                </div>
                <div class="profile-user-info">
                    <h3 class="profile-user-name">${escapeHtml(user.full_name || "Student")}</h3>
                    <div class="profile-user-meta">
                        ${user.academic_branch ? `<span class="profile-badge-tag">${escapeHtml(user.academic_branch)}</span>` : ""}
                        ${user.cohort_year ? `<span>Cohort ${escapeHtml(user.cohort_year)}</span>` : ""}
                        ${user.email ? `<span>• ${escapeHtml(user.email)}</span>` : ""}
                    </div>
                </div>
            </div>

            <!-- Platform Handles -->
            <div class="profile-handles">
                ${githubHtml}
                ${leetcodeHtml}
                ${linkedinHtml}
            </div>

            <!-- Academic Stat Badges -->
            <div class="academic-badges-grid">
                <div class="academic-badge">
                    <span class="academic-badge-label">CGPA</span>
                    <span class="academic-badge-value accent-gold">${cgpaDisplay}</span>
                </div>
                <div class="academic-badge">
                    <span class="academic-badge-label">Attendance</span>
                    <span class="academic-badge-value">${attendanceDisplay}</span>
                </div>
                <div class="academic-badge">
                    <span class="academic-badge-label">Backlogs</span>
                    <span class="academic-badge-value ${Number(backlogsDisplay) > 0 ? "danger" : ""}">${backlogsDisplay}</span>
                </div>
                <div class="academic-badge">
                    <span class="academic-badge-label">Semester</span>
                    <span class="academic-badge-value">${semesterDisplay}</span>
                </div>
            </div>

            <!-- Skill Matrix & Dynamic Progress Bars -->
            <div class="skills-section">
                <div class="skills-section-header">
                    <span class="skills-section-title">Skill Breakdown & Proficiency</span>
                </div>
                <div class="skill-bars-list">
                    ${skillBarsHtml}
                </div>
                <!-- Secondary Quick Metrics -->
                <div class="secondary-skills-grid">
                    <div class="secondary-chip">
                        <strong>${projectCount}</strong> Projects
                    </div>
                    <div class="secondary-chip">
                        <strong>${internshipMonths} mo</strong> Experience
                    </div>
                    <div class="secondary-chip">
                        <strong>${contestRating}</strong> Contest Rating
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open the Edit Profile Modal and pre-fill its form fields with cached data.
 */
function openEditProfileModal() {
    const modal = document.getElementById("profile-modal");
    const errorDiv = document.getElementById("modal-form-error");
    if (!modal) return;

    if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
    }

    const data = cachedProfileData || {};
    const user = data.user || {};
    const academics = Array.isArray(data.academics) ? data.academics : [];
    const links = data.platform_links || data.links || {};
    const skills = data.skills || {};

    let latestSem = null;
    if (academics.length > 0) {
        latestSem = [...academics].sort((a, b) => (b.semester || 0) - (a.semester || 0))[0];
    }

    // Populate Tab 1: Personal
    const nameInput = document.getElementById("edit-full-name");
    const branchInput = document.getElementById("edit-branch");
    const cohortInput = document.getElementById("edit-cohort");
    if (nameInput) nameInput.value = user.full_name || "";
    if (branchInput) branchInput.value = user.academic_branch || "";
    if (cohortInput) cohortInput.value = user.cohort_year || "";

    // Populate Tab 2: Academic
    const semInput = document.getElementById("edit-semester");
    const cgpaInput = document.getElementById("edit-cgpa");
    const attInput = document.getElementById("edit-attendance");
    const backlogsInput = document.getElementById("edit-backlogs");
    if (semInput) semInput.value = latestSem && latestSem.semester ? latestSem.semester : 1;
    if (cgpaInput) cgpaInput.value = latestSem && latestSem.cgpa !== null && latestSem.cgpa !== undefined ? latestSem.cgpa : "";
    if (attInput) attInput.value = latestSem && latestSem.attendance_pct !== null && latestSem.attendance_pct !== undefined ? latestSem.attendance_pct : "";
    if (backlogsInput) backlogsInput.value = latestSem && latestSem.active_backlogs !== null && latestSem.active_backlogs !== undefined ? latestSem.active_backlogs : 0;

    // Populate Tab 3: Handles
    const ghInput = document.getElementById("edit-github");
    const lcInput = document.getElementById("edit-leetcode");
    const liInput = document.getElementById("edit-linkedin");
    if (ghInput) ghInput.value = links.github_username || "";
    if (lcInput) lcInput.value = links.leetcode_username || "";
    if (liInput) liInput.value = links.linkedin_url || "";

    // Populate Tab 4: Skills
    const dsaInput = document.getElementById("edit-dsa");
    const pyInput = document.getElementById("edit-python");
    const cppInput = document.getElementById("edit-cpp");
    const aimlInput = document.getElementById("edit-aiml");
    const commInput = document.getElementById("edit-communication");
    const projInput = document.getElementById("edit-projects");
    const internInput = document.getElementById("edit-internship");
    const contestInput = document.getElementById("edit-contest");

    if (dsaInput) dsaInput.value = skills.dsa_score !== undefined ? skills.dsa_score : "";
    if (pyInput) pyInput.value = skills.python_prof !== undefined ? skills.python_prof : "";
    if (cppInput) cppInput.value = skills.cpp_prof !== undefined ? skills.cpp_prof : "";
    if (aimlInput) aimlInput.value = skills.aiml_knowledge !== undefined ? skills.aiml_knowledge : "";
    if (commInput) commInput.value = skills.communication_score !== undefined ? skills.communication_score : "";
    if (projInput) projInput.value = skills.project_count !== undefined ? skills.project_count : "";
    if (internInput) internInput.value = skills.internship_exp !== undefined ? skills.internship_exp : "";
    if (contestInput) contestInput.value = skills.contest_rating !== undefined ? skills.contest_rating : "";

    // Switch to first tab (Personal) by default
    switchModalTab("tab-personal");

    // Display modal and lock body scroll
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/**
 * Close the Edit Profile Modal and restore body scrolling.
 */
function closeEditProfileModal() {
    const modal = document.getElementById("profile-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
}

/**
 * Switch active modal tab and toggle visible form pane.
 *
 * @param {string} targetTabId - The ID of the tab pane to activate (e.g., 'tab-personal')
 */
function switchModalTab(targetTabId) {
    const tabs = document.querySelectorAll(".modal-tab");
    const panes = document.querySelectorAll(".tab-pane");

    tabs.forEach((tab) => {
        const isMatch = tab.getAttribute("data-tab") === targetTabId;
        tab.classList.toggle("active", isMatch);
        tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    panes.forEach((pane) => {
        const isMatch = pane.id === targetTabId;
        pane.style.display = isMatch ? "block" : "none";
        pane.classList.toggle("active", isMatch);
    });
}

/**
 * Validate and handle submission of the Edit Profile form.
 *
 * @param {Event} event - Submit event
 */
async function handleProfileFormSubmit(event) {
    event.preventDefault();

    const errorDiv = document.getElementById("modal-form-error");
    const submitBtn = document.getElementById("save-profile-btn");
    if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
    }

    // 1. Gather and Validate Personal Fields
    const fullName = (document.getElementById("edit-full-name")?.value || "").trim();
    const academicBranch = (document.getElementById("edit-branch")?.value || "").trim();
    const cohortYearRaw = document.getElementById("edit-cohort")?.value;
    const cohortYear = cohortYearRaw !== "" && cohortYearRaw !== undefined ? parseInt(cohortYearRaw, 10) : null;

    if (!fullName) {
        showModalError("Full Name is required.", "tab-personal");
        return;
    }

    if (cohortYear !== null && (isNaN(cohortYear) || cohortYear < 1900 || cohortYear > 2100)) {
        showModalError("Cohort year must be a valid year between 1900 and 2100.", "tab-personal");
        return;
    }

    // 2. Gather and Validate Academic Fields
    const semesterRaw = document.getElementById("edit-semester")?.value;
    const cgpaRaw = document.getElementById("edit-cgpa")?.value;
    const attendanceRaw = document.getElementById("edit-attendance")?.value;
    const backlogsRaw = document.getElementById("edit-backlogs")?.value;

    const semester = semesterRaw ? parseInt(semesterRaw, 10) : 1;
    if (isNaN(semester) || semester < 1 || semester > 12) {
        showModalError("Semester must be between 1 and 12.", "tab-academic");
        return;
    }

    if (cgpaRaw === "" || cgpaRaw === undefined) {
        showModalError("Cumulative GPA is required.", "tab-academic");
        return;
    }
    const cgpa = parseFloat(cgpaRaw);
    if (isNaN(cgpa) || cgpa < 0.0 || cgpa > 10.0) {
        showModalError("CGPA must be a number between 0.00 and 10.00.", "tab-academic");
        return;
    }

    let attendance = 0.0;
    if (attendanceRaw !== "" && attendanceRaw !== undefined) {
        attendance = parseFloat(attendanceRaw);
        if (isNaN(attendance) || attendance < 0.0 || attendance > 100.0) {
            showModalError("Attendance percentage must be between 0 and 100.", "tab-academic");
            return;
        }
    }

    let activeBacklogs = 0;
    if (backlogsRaw !== "" && backlogsRaw !== undefined) {
        activeBacklogs = parseInt(backlogsRaw, 10);
        if (isNaN(activeBacklogs) || activeBacklogs < 0) {
            showModalError("Active backlogs cannot be negative.", "tab-academic");
            return;
        }
    }

    // 3. Gather Handles
    const githubUsername = (document.getElementById("edit-github")?.value || "").trim();
    const leetcodeUsername = (document.getElementById("edit-leetcode")?.value || "").trim();
    const linkedinUrl = (document.getElementById("edit-linkedin")?.value || "").trim();

    // 4. Gather and Validate Skills
    function parseSkill(fieldId, label, min = 0, max = 100) {
        const valRaw = document.getElementById(fieldId)?.value;
        if (valRaw === "" || valRaw === undefined) return 0;
        const val = parseFloat(valRaw);
        if (isNaN(val) || val < min || val > max) {
            throw new Error(`${label} must be between ${min} and ${max}.`);
        }
        return val;
    }

    let skillsPayload = {};
    try {
        skillsPayload = {
            dsa_score: parseSkill("edit-dsa", "DSA Score", 0, 100),
            python_prof: parseSkill("edit-python", "Python Proficiency", 0, 100),
            cpp_prof: parseSkill("edit-cpp", "C++ Proficiency", 0, 100),
            aiml_knowledge: parseSkill("edit-aiml", "AI/ML Knowledge", 0, 100),
            communication_score: parseSkill("edit-communication", "Communication Score", 0, 100),
            project_count: parseInt(document.getElementById("edit-projects")?.value || 0, 10),
            internship_exp: parseInt(document.getElementById("edit-internship")?.value || 0, 10),
            contest_rating: parseFloat(document.getElementById("edit-contest")?.value || 0),
        };

        if (skillsPayload.project_count < 0) throw new Error("Project count cannot be negative.");
        if (skillsPayload.internship_exp < 0) throw new Error("Internship experience cannot be negative.");
        if (skillsPayload.contest_rating < 0) throw new Error("Contest rating cannot be negative.");
    } catch (err) {
        showModalError(err.message, "tab-skills");
        return;
    }

    // 5. Construct Final PUT Payload
    const payload = {
        full_name: fullName,
        cohort_year: cohortYear,
        academic_branch: academicBranch || null,
        academics: [
            {
                semester: semester,
                cgpa: cgpa,
                attendance_pct: attendance,
                active_backlogs: activeBacklogs,
            },
        ],
        platform_links: {
            github_username: githubUsername || null,
            leetcode_username: leetcodeUsername || null,
            linkedin_url: linkedinUrl || null,
        },
        skills: skillsPayload,
    };

    // 6. Submit via PUT /api/v1/users/profile
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
    }

    try {
        const response = await apiRequest("/users/profile", {
            method: "PUT",
            body: payload,
        });

        // Update cached data and re-render dashboard panel instantly
        const updatedProfile = (response && response.profile) || response;
        cachedProfileData = updatedProfile;
        renderProfile(updatedProfile);

        // Synchronize navbar user display
        const navUsername = document.getElementById("nav-username");
        if (navUsername && fullName) {
            navUsername.textContent = fullName;
        }

        // Close modal
        closeEditProfileModal();
    } catch (error) {
        showModalError(error.message || "Failed to update profile.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Changes";
        }
    }
}

/**
 * Display an error message within the edit modal and optionally focus the relevant tab.
 */
function showModalError(message, targetTabId = null) {
    const errorDiv = document.getElementById("modal-form-error");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }
    if (targetTabId) {
        switchModalTab(targetTabId);
    }
}

/**
 * Initialize profile section event listeners and modal interactions.
 */
function initProfileSection() {
    // 1. "Edit Profile" button trigger
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) {
        editBtn.addEventListener("click", openEditProfileModal);
    }

    // 2. Modal Close and Cancel buttons
    const closeBtn = document.getElementById("close-profile-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeEditProfileModal);
    }

    const cancelBtn = document.getElementById("cancel-profile-btn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeEditProfileModal);
    }

    // 3. Click outside modal dialog to dismiss
    const modalBackdrop = document.getElementById("profile-modal");
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) {
                closeEditProfileModal();
            }
        });
    }

    // 4. Press Escape to close modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.getElementById("profile-modal");
            if (modal && modal.style.display !== "none") {
                closeEditProfileModal();
            }
        }
    });

    // 5. Tab bar switching listeners
    const tabButtons = document.querySelectorAll(".modal-tab");
    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            if (targetTab) {
                switchModalTab(targetTab);
            }
        });
    });

    // 6. Modal Form Submit handler
    const form = document.getElementById("edit-profile-form");
    if (form) {
        form.addEventListener("submit", handleProfileFormSubmit);
    }
}
