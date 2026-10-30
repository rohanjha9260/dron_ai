/**
 * DRON AI: Developer Platform Telemetry Controller & Visualizer
 * File: frontend/js/telemetry.js
 *
 * Handles:
 *   - Live synchronization with Flask backend (/api/metrics/fetch & /api/metrics/telemetry)
 *   - Chart.js LeetCode Easy/Medium/Hard Donut Chart with center cutout totals
 *   - Chart.js GitHub Language Distribution Horizontal Bar Chart with true empty-state support
 *   - Mobile navigation drawer toggle
 *   - In-flight request guards and request generation tracking
 *   - Account-scoped localStorage cache preventing guest/cross-account data leakage
 *   - 13D ML Feature Vector explainer connection
 */

// Global Chart.js instances
let leetcodeChartInstance = null;
let githubLangChartInstance = null;

// In-flight synchronization guard and generation tracker
let isSyncInProgress = false;
let syncRequestGeneration = 0;

// Baseline fallback telemetry data (when unauthenticated or demo mode ONLY)
const DEMO_TELEMETRY = {
    github_handle: "rohanjha9260",
    leetcode_username: "rohanjha9260",
    last_synced: new Date().toISOString(),
    dsa_score: 80.7,
    github: {
        total_commits: 184,
        repos: 14,
        stars: 32,
        forks: 9,
        followers: 18,
        name: "Rohan Jha",
        bio: "Pre-Final Year CSE Student | Machine Learning, Algorithms & Full-Stack Systems",
        avatar_url: "https://avatars.githubusercontent.com/u/9919?v=4",
        top_language: "Python",
        languages: ["Python", "C++", "JavaScript", "HTML/CSS", "Shell", "SQL"],
        language_distribution: {
            "Python": 8,
            "C++": 3,
            "JavaScript": 2,
            "HTML/CSS": 1
        }
    },
    leetcode: {
        problems_solved: 242,
        easy: 110,
        medium: 105,
        hard: 27,
        rating: 1640.5,
        ranking: 38240,
        real_name: "Rohan Jha",
        reputation: 45,
        attended_contests: 12,
        top_percentage: 14.8
    }
};

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Format relative or localized date string.
 */
function formatSyncTime(isoString) {
    if (!isoString) return "Never synced";
    try {
        const date = new Date(isoString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    } catch {
        return isoString;
    }
}

/**
 * Extract active user identity from token or student storage.
 */
function getActiveUserId() {
    const token = typeof getToken === "function" ? getToken() : (sessionStorage.getItem("dron_ai_token") || localStorage.getItem("dron_ai_token"));
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            if (payload && payload.sub) {
                return String(payload.sub);
            }
        }
    } catch {
        // ignore parse error
    }
    const studentId = sessionStorage.getItem("dron_student_id") || localStorage.getItem("dron_student_id");
    return studentId ? String(studentId) : null;
}

/**
 * Account-scoped cache key helper.
 */
function getTelemetryCacheKey(userId) {
    return userId ? `dron_telemetry_cache_${userId}` : null;
}

/**
 * Explicit cache key for guest/unauthenticated sessions.
 */
const GUEST_TELEMETRY_CACHE_KEY = "dron_telemetry_cache_guest";

/**
 * Initialize Telemetry Dashboard.
 */
document.addEventListener("DOMContentLoaded", async () => {
    initMobileNav();
    initSyncForm();
    await loadInitialTelemetry();
});

/**
 * Initialize mobile navigation toggle.
 */
function initMobileNav() {
    const toggleBtn = document.getElementById("mobile-nav-toggle");
    const sidebar = document.querySelector(".app-sidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove("open");
            }
        });
    }
}

/**
 * Load initial telemetry data from API or account-scoped cache.
 */
async function loadInitialTelemetry() {
    setLoadingState(true);

    const hasToken = typeof getToken === "function" && Boolean(getToken());
    const activeUserId = getActiveUserId();
    let telemetryData = null;

    if (hasToken) {
        try {
            telemetryData = await apiRequest("/metrics/telemetry", { method: "GET" });
        } catch (err) {
            console.warn("Could not fetch telemetry from /metrics/telemetry:", err.message);
        }

        const hasPayload = telemetryData && (telemetryData.github || telemetryData.leetcode);

        if (hasPayload) {
            // Persist valid snapshot scoped to this specific authenticated user
            try {
                const cacheKey = getTelemetryCacheKey(activeUserId);
                if (cacheKey) {
                    localStorage.setItem(cacheKey, JSON.stringify(telemetryData));
                }
            } catch (e) {
                console.warn("Could not cache telemetry in localStorage:", e);
            }
        } else {
            // Check only the cache key belonging to this specific user account
            try {
                const cacheKey = getTelemetryCacheKey(activeUserId);
                if (cacheKey) {
                    const userCached = localStorage.getItem(cacheKey);
                    if (userCached) {
                        const parsed = JSON.parse(userCached);
                        if (parsed && (parsed.github || parsed.leetcode)) {
                            telemetryData = {
                                ...telemetryData,
                                ...parsed,
                                github_handle: telemetryData?.github_handle || parsed.github_handle,
                                leetcode_username: telemetryData?.leetcode_username || parsed.leetcode_username,
                            };
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed reading account telemetry cache:", e);
            }

            // CRITICAL: Do NOT fall back to guest data or DEMO_TELEMETRY for authenticated accounts.
            // If the authenticated user has not synced yet, render honest baseline/empty telemetry.
            if (!telemetryData || (!telemetryData.github && !telemetryData.leetcode)) {
                telemetryData = {
                    github_handle: telemetryData?.github_handle || "",
                    leetcode_username: telemetryData?.leetcode_username || "",
                    last_synced: telemetryData?.last_synced || null,
                    dsa_score: telemetryData?.dsa_score || 0.0,
                    github: null,
                    leetcode: null,
                };
            }
        }
    } else {
        // Explicitly unauthenticated or Guest session
        try {
            const guestCached = localStorage.getItem(GUEST_TELEMETRY_CACHE_KEY);
            if (guestCached) {
                telemetryData = JSON.parse(guestCached);
            }
        } catch (e) {
            console.warn("Failed reading guest telemetry cache:", e);
        }

        if (!telemetryData || (!telemetryData.github && !telemetryData.leetcode)) {
            telemetryData = DEMO_TELEMETRY;
        }
    }

    renderTelemetryDashboard(telemetryData);
    setLoadingState(false);
}

/**
 * Setup sync form submit and refresh buttons.
 */
function initSyncForm() {
    const syncBtn = document.getElementById("sync-telemetry-btn");
    const refreshBtn = document.getElementById("quick-refresh-btn");

    if (syncBtn) {
        syncBtn.addEventListener("click", handleSyncTrigger);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener("click", handleSyncTrigger);
    }

    const ghInput = document.getElementById("github-handle-input");
    const lcInput = document.getElementById("leetcode-username-input");

    const onEnterKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSyncTrigger();
        }
    };

    if (ghInput) ghInput.addEventListener("keydown", onEnterKey);
    if (lcInput) lcInput.addEventListener("keydown", onEnterKey);
}

/**
 * Trigger synchronization with backend /api/metrics/fetch.
 * Includes in-flight guards across all entrypoints and generation tracking.
 */
async function handleSyncTrigger() {
    if (isSyncInProgress) {
        return; // Guard against overlapping clicks/keypresses
    }

    const ghInput = document.getElementById("github-handle-input");
    const lcInput = document.getElementById("leetcode-username-input");
    const syncBtn = document.getElementById("sync-telemetry-btn");
    const refreshBtn = document.getElementById("quick-refresh-btn");
    const statusText = document.getElementById("sync-status-text");
    const statusBadge = document.getElementById("sync-status-badge");

    const ghHandle = (ghInput ? ghInput.value : "").trim();
    const lcUsername = (lcInput ? lcInput.value : "").trim();

    if (!ghHandle && !lcUsername) {
        showToast("Please enter at least a GitHub handle or LeetCode username", "warning");
        return;
    }

    isSyncInProgress = true;
    const thisGeneration = ++syncRequestGeneration;

    // UI Loading state across all entrypoints
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Syncing Platforms...</span>`;
    }
    if (refreshBtn) {
        refreshBtn.disabled = true;
    }
    if (statusText) statusText.textContent = "Syncing...";
    if (statusBadge) {
        statusBadge.className = "badge badge-neutral";
        statusBadge.innerHTML = `<span class="badge-dot"></span> Fetching Live Data...`;
    }

    try {
        const hasToken = typeof getToken === "function" && Boolean(getToken());
        const activeUserId = getActiveUserId();
        let syncedData = null;

        if (hasToken) {
            syncedData = await apiRequest("/metrics/fetch", {
                method: "POST",
                body: {
                    github_handle: ghHandle || undefined,
                    leetcode_username: lcUsername || undefined,
                },
            });
        } else {
            // Guest or demo simulation
            await new Promise((resolve) => setTimeout(resolve, 800));
            syncedData = {
                ...DEMO_TELEMETRY,
                github_handle: ghHandle || DEMO_TELEMETRY.github_handle,
                leetcode_username: lcUsername || DEMO_TELEMETRY.leetcode_username,
                last_synced: new Date().toISOString(),
            };
        }

        // Discard responses from superseded requests
        if (thisGeneration !== syncRequestGeneration) {
            console.log("Discarding superseded telemetry sync response.");
            return;
        }

        // Cache latest telemetry strictly scoped to current user
        try {
            if (hasToken) {
                const cacheKey = getTelemetryCacheKey(activeUserId);
                if (cacheKey) {
                    localStorage.setItem(cacheKey, JSON.stringify(syncedData));
                }
            } else {
                localStorage.setItem(GUEST_TELEMETRY_CACHE_KEY, JSON.stringify(syncedData));
            }
        } catch (e) {
            console.warn("Could not cache telemetry in localStorage:", e);
        }

        renderTelemetryDashboard(syncedData);
        showToast("Telemetry successfully synchronized!", "success");

        if (statusBadge) {
            statusBadge.className = "badge badge-success";
            statusBadge.innerHTML = `<span class="badge-dot"></span> Synced Just Now`;
        }
    } catch (err) {
        if (thisGeneration !== syncRequestGeneration) return;
        console.error("Telemetry sync error:", err);
        showToast(`Sync warning: ${err.message || "Failed to fetch remote statistics"}`, "danger");

        if (statusBadge) {
            statusBadge.className = "badge badge-warning";
            statusBadge.innerHTML = `<span class="badge-dot"></span> Partial / Cached View`;
        }
    } finally {
        if (thisGeneration === syncRequestGeneration) {
            isSyncInProgress = false;
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> <span>Sync Developer Telemetry</span>`;
            }
            if (refreshBtn) {
                refreshBtn.disabled = false;
            }
        }
    }
}

/**
 * Render all metrics, badges, and charts from telemetry object.
 */
function renderTelemetryDashboard(data) {
    if (!data) return;

    // 1. Sync Inputs & Handles
    const ghInput = document.getElementById("github-handle-input");
    const lcInput = document.getElementById("leetcode-username-input");
    const lastSyncedTime = document.getElementById("last-synced-time");

    const gh = data.github_handle || (data.github ? data.github.username : "") || "";
    const lc = data.leetcode_username || (data.leetcode ? data.leetcode.username : "") || "";

    if (ghInput && gh && !ghInput.value) ghInput.value = gh;
    if (lcInput && lc && !lcInput.value) lcInput.value = lc;

    if (lastSyncedTime) {
        lastSyncedTime.textContent = formatSyncTime(data.last_synced);
    }

    const ghStats = data.github || {};
    const lcStats = data.leetcode || {};

    // 2. KPI Ribbon Counters
    const totalCommitsEl = document.getElementById("metric-total-commits");
    const problemsSolvedEl = document.getElementById("metric-problems-solved");
    const contestRatingEl = document.getElementById("metric-contest-rating");
    const dsaScoreEl = document.getElementById("metric-dsa-score");

    const commits = ghStats.total_commits || 0;
    const solved = lcStats.problems_solved || 0;
    const rating = lcStats.rating || lcStats.contest_rating || 0;
    const dsaScore = data.dsa_score || (solved > 0 ? Math.min(100.0, Math.round((solved / 3.0) * 10) / 10) : 0.0);

    if (totalCommitsEl) totalCommitsEl.textContent = commits.toLocaleString();
    if (problemsSolvedEl) problemsSolvedEl.textContent = solved.toLocaleString();
    if (contestRatingEl) contestRatingEl.textContent = rating > 0 ? Math.round(rating) : "Unrated";
    if (dsaScoreEl) dsaScoreEl.textContent = `${dsaScore.toFixed(1)} / 100`;

    // 3. Render LeetCode Panel & Chart
    renderLeetCodeSection(lcStats, lc);

    // 4. Render GitHub Panel & Chart
    renderGitHubSection(ghStats, gh);

    // 5. Update Profile Links
    const ghLink = document.getElementById("gh-profile-external-link");
    const lcLink = document.getElementById("lc-profile-external-link");

    if (ghLink) {
        if (gh) {
            ghLink.href = `https://github.com/${encodeURIComponent(gh)}`;
            ghLink.style.display = "inline-flex";
            const text = ghLink.querySelector(".handle-text");
            if (text) text.textContent = `@${gh}`;
        } else {
            ghLink.style.display = "none";
        }
    }

    if (lcLink) {
        if (lc) {
            lcLink.href = `https://leetcode.com/u/${encodeURIComponent(lc)}`;
            lcLink.style.display = "inline-flex";
            const text = lcLink.querySelector(".handle-text");
            if (text) text.textContent = `@${lc}`;
        } else {
            lcLink.style.display = "none";
        }
    }
}

/**
 * Render LeetCode section numbers, difficulty progress bar & donut chart.
 */
function renderLeetCodeSection(lc, username) {
    const easyCount = lc.easy || lc.easy_solved || 0;
    const mediumCount = lc.medium || lc.medium_solved || 0;
    const hardCount = lc.hard || lc.hard_solved || 0;
    const total = lc.problems_solved || (easyCount + mediumCount + hardCount);
    const ranking = lc.ranking || 0;
    const rating = lc.rating || lc.contest_rating || 0;
    const attended = lc.attended_contests || 0;

    // Numerical counts
    const easyEl = document.getElementById("lc-easy-count");
    const mediumEl = document.getElementById("lc-medium-count");
    const hardEl = document.getElementById("lc-hard-count");
    const totalEl = document.getElementById("lc-total-solved-badge");
    const rankEl = document.getElementById("lc-global-rank-val");
    const ratingEl = document.getElementById("lc-contest-rating-val");
    const attendedEl = document.getElementById("lc-contests-attended-val");

    if (easyEl) easyEl.textContent = easyCount.toLocaleString();
    if (mediumEl) mediumEl.textContent = mediumCount.toLocaleString();
    if (hardEl) hardEl.textContent = hardCount.toLocaleString();
    if (totalEl) totalEl.textContent = `${total.toLocaleString()} Solved`;
    if (rankEl) rankEl.textContent = ranking > 0 ? `#${ranking.toLocaleString()}` : "Unranked";
    if (ratingEl) ratingEl.textContent = rating > 0 ? Math.round(rating) : "Unrated";
    if (attendedEl) attendedEl.textContent = attended > 0 ? `${attended} Contests` : "0 Contests";

    // Progress bar distribution (reset to 0% when total is 0)
    const progressBar = document.getElementById("lc-diff-progress-bar");
    if (progressBar) {
        if (total > 0) {
            const easyPct = Math.round((easyCount / total) * 100);
            const mediumPct = Math.round((mediumCount / total) * 100);
            const hardPct = Math.max(0, 100 - easyPct - mediumPct);

            progressBar.innerHTML = `
                <div class="progress-segment easy" style="width: ${easyPct}%;" title="Easy: ${easyCount} (${easyPct}%)"></div>
                <div class="progress-segment medium" style="width: ${mediumPct}%;" title="Medium: ${mediumCount} (${mediumPct}%)"></div>
                <div class="progress-segment hard" style="width: ${hardPct}%;" title="Hard: ${hardCount} (${hardPct}%)"></div>
            `;
        } else {
            progressBar.innerHTML = `
                <div class="progress-segment easy" style="width: 0%;"></div>
                <div class="progress-segment medium" style="width: 0%;"></div>
                <div class="progress-segment hard" style="width: 0%;"></div>
            `;
        }
    }

    // Chart.js Donut
    renderLeetCodeDonutChart(easyCount, mediumCount, hardCount, total);
}

/**
 * Render or re-render LeetCode Donut Chart.
 */
function renderLeetCodeDonutChart(easy, medium, hard, total) {
    const canvas = document.getElementById("leetcodeDonutChart");
    if (!canvas) return;

    if (leetcodeChartInstance) {
        leetcodeChartInstance.destroy();
        leetcodeChartInstance = null;
    }

    const hasData = total > 0;
    const chartData = hasData ? [easy, medium, hard] : [1, 1, 1];
    const backgroundColors = hasData
        ? ["#10B981", "#F59E0B", "#EF4444"]
        : ["#E2E8F0", "#CBD5E1", "#94A3B8"];

    const ctx = canvas.getContext("2d");

    // Center text plugin for Donut
    const centerTextPlugin = {
        id: "centerTextPlugin",
        beforeDraw(chart) {
            const { width, height } = chart;
            const chartCtx = chart.ctx;
            chartCtx.restore();

            const fontSize = Math.min(width, height) / 8;
            chartCtx.font = `800 ${fontSize}px Inter, sans-serif`;
            chartCtx.textBaseline = "middle";
            chartCtx.textAlign = "center";
            chartCtx.fillStyle = "#0F172A";

            const text = hasData ? total.toLocaleString() : "0";
            const textX = width / 2;
            const textY = (height / 2) - (fontSize * 0.25);
            chartCtx.fillText(text, textX, textY);

            // Subtitle
            chartCtx.font = `600 ${fontSize * 0.42}px Inter, sans-serif`;
            chartCtx.fillStyle = "#64748B";
            chartCtx.fillText("SOLVED", textX, textY + fontSize * 0.85);

            chartCtx.save();
        }
    };

    leetcodeChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Easy", "Medium", "Hard"],
            datasets: [
                {
                    data: chartData,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                    hoverOffset: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "74%",
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: hasData,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label(context) {
                            const val = context.raw || 0;
                            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                            return ` ${context.label}: ${val} (${pct}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 900
            }
        },
        plugins: [centerTextPlugin]
    });
}

/**
 * Render GitHub Section stats, bio, and Language Chart.
 */
function renderGitHubSection(gh, username) {
    const reposCount = gh.repos || gh.total_repos || 0;
    const commitsCount = gh.total_commits || 0;
    const starsCount = gh.stars || gh.total_stars || 0;
    const forksCount = gh.forks || gh.total_forks || 0;
    const followersCount = gh.followers || 0;

    const reposEl = document.getElementById("gh-repos-count");
    const commitsEl = document.getElementById("gh-commits-count");
    const starsEl = document.getElementById("gh-stars-count");
    const forksEl = document.getElementById("gh-forks-count");
    const followersEl = document.getElementById("gh-followers-count");

    if (reposEl) reposEl.textContent = reposCount.toLocaleString();
    if (commitsEl) commitsEl.textContent = commitsCount.toLocaleString();
    if (starsEl) starsEl.textContent = starsCount.toLocaleString();
    if (forksEl) forksEl.textContent = forksCount.toLocaleString();
    if (followersEl) followersEl.textContent = followersCount.toLocaleString();

    // Profile card meta
    const avatarEl = document.getElementById("gh-avatar-img");
    const nameEl = document.getElementById("gh-profile-name");
    const bioEl = document.getElementById("gh-profile-bio");
    const topLangBadge = document.getElementById("gh-top-language-badge");

    if (avatarEl) {
        if (gh.avatar_url) {
            avatarEl.src = gh.avatar_url;
            avatarEl.style.display = "block";
        } else {
            avatarEl.src = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
        }
    }

    if (nameEl) nameEl.textContent = gh.name || username || "Developer Profile";
    if (bioEl) bioEl.textContent = gh.bio || "Active contributor across public repositories and open-source tooling.";

    const topLang = gh.top_language || (gh.languages && gh.languages.length > 0 ? gh.languages[0] : null);
    if (topLangBadge) {
        if (topLang) {
            topLangBadge.style.display = "inline-flex";
            topLangBadge.innerHTML = `<i class="fa-solid fa-code"></i> Top: ${escapeHtml(topLang)}`;
        } else {
            topLangBadge.style.display = "none";
        }
    }

    // Render language pills
    const pillsContainer = document.getElementById("gh-language-pills-container");
    if (pillsContainer) {
        const langs = Array.isArray(gh.languages) ? gh.languages : [];
        if (langs.length > 0) {
            pillsContainer.innerHTML = langs.map((l) => {
                const isTop = topLang && l.toLowerCase() === topLang.toLowerCase();
                const cls = isTop ? "language-pill top-lang" : "language-pill";
                return `<span class="${cls}"><span class="lang-dot"></span>${escapeHtml(l)}</span>`;
            }).join("");
        } else {
            pillsContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">No language telemetry available</span>`;
        }
    }

    // Render Language Bar Chart
    const langDist = gh.language_distribution || {};
    renderGitHubLanguagesChart(langDist, gh.languages);
}

/**
 * Render or re-render GitHub Language Distribution Chart.
 * Produces a clean empty-state chart without fabricated labels or counts when empty.
 */
function renderGitHubLanguagesChart(langDist, fallbackLangs) {
    const canvas = document.getElementById("githubLanguagesChart");
    if (!canvas) return;

    if (githubLangChartInstance) {
        githubLangChartInstance.destroy();
        githubLangChartInstance = null;
    }

    let labels = [];
    let counts = [];

    if (langDist && Object.keys(langDist).length > 0) {
        // Sort descending
        const sorted = Object.entries(langDist).sort((a, b) => b[1] - a[1]);
        labels = sorted.map((item) => item[0]);
        counts = sorted.map((item) => item[1]);
    } else if (Array.isArray(fallbackLangs) && fallbackLangs.length > 0) {
        labels = fallbackLangs.filter(Boolean);
        counts = labels.map(() => 1);
    } else {
        // Empty telemetry: no fabricated labels or decreasing counts
        labels = [];
        counts = [];
    }

    const hasData = labels.length > 0 && counts.some((c) => c > 0);
    const ctx = canvas.getContext("2d");

    // Palette: Mint & Modern Tech Hues
    const colors = [
        "#10B981", // Mint
        "#06B6D4", // Cyan
        "#3B82F6", // Blue
        "#8B5CF6", // Purple
        "#F59E0B", // Amber
        "#EC4899", // Pink
    ];

    // Center message plugin when empty
    const emptyStatePlugin = {
        id: "emptyStatePlugin",
        afterDraw(chart) {
            if (!hasData) {
                const { ctx: chartCtx, width, height } = chart;
                chartCtx.save();
                chartCtx.textAlign = "center";
                chartCtx.textBaseline = "middle";
                chartCtx.font = "600 13px Inter, sans-serif";
                chartCtx.fillStyle = "#94A3B8";
                chartCtx.fillText("No language telemetry available", width / 2, height / 2);
                chartCtx.restore();
            }
        }
    };

    const displayLabels = hasData ? labels : ["No Languages"];
    const displayCounts = hasData ? counts : [0];
    const displayColors = hasData ? colors.slice(0, labels.length) : ["#F1F5F9"];

    githubLangChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: displayLabels,
            datasets: [
                {
                    label: "Repositories Used",
                    data: displayCounts,
                    backgroundColor: displayColors,
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.65,
                }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: hasData,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label(context) {
                            return ` ${context.raw} repository usage(s)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: "#F1F5F9",
                        drawBorder: false,
                    },
                    ticks: {
                        stepSize: 1,
                        color: "#64748B",
                        font: {
                            family: "Inter",
                            size: 11
                        }
                    },
                    suggestedMax: hasData ? Math.max(...counts, 2) : 2
                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: hasData ? "#0F172A" : "transparent",
                        font: {
                            family: "Inter",
                            weight: "600",
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: hasData ? 800 : 0
            }
        },
        plugins: [emptyStatePlugin]
    });
}

/**
 * Loading state toggle.
 */
function setLoadingState(isLoading) {
    const loadingOverlay = document.getElementById("telemetry-loading-state");
    if (loadingOverlay) {
        loadingOverlay.style.display = isLoading ? "flex" : "none";
    }
}

/**
 * Toast Notification Helper.
 */
function showToast(message, type = "info") {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast-pill toast-${type}`;
    toast.style.cssText = `
        pointer-events: auto;
        background: #FFFFFF;
        border: 1px solid ${type === "success" ? "#86EFAC" : type === "warning" ? "#FCD34D" : type === "danger" ? "#FCA5A5" : "#BAE6FD"};
        border-left: 4px solid ${type === "success" ? "#16A34A" : type === "warning" ? "#F59E0B" : type === "danger" ? "#EF4444" : "#0284C7"};
        color: #0F172A;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        font-size: 0.88rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.65rem;
        animation: toastIn 0.25s ease;
    `;

    const iconClass =
        type === "success"
            ? "fa-circle-check text-success"
            : type === "warning"
            ? "fa-triangle-exclamation text-amber"
            : type === "danger"
            ? "fa-circle-xmark text-danger"
            : "fa-circle-info text-info";

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.25s ease";
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}
