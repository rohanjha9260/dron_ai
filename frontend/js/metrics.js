/**
 * Dron-AI Developer Metrics Module
 *
 * Handles:
 *   - Auto-fetching live stats from GitHub and LeetCode on dashboard load
 *   - Manual re-sync with animated spinner state
 *   - Color-coded LeetCode difficulty counters (Emerald, Amber, Ruby)
 *   - Dynamic GitHub language badge distribution (.language-pill)
 *   - Unlinked/Empty states with CTA to link accounts in Edit Profile
 *   - Resilient partial-failure handling (isolated per-platform error fallbacks)
 */

/**
 * Cache for platform handles loaded from student profile.
 */
let cachedHandles = {
    github_handle: null,
    leetcode_username: null,
    isLoaded: false,
};

/**
 * Fetch or retrieve user platform handles from profile endpoint.
 * @returns {Promise<{github_handle: string, leetcode_username: string}>}
 */
async function getUserHandles() {
    try {
        const profileData = await apiRequest("/users/profile", { method: "GET" });
        const links = profileData.platform_links || profileData.links || {};

        cachedHandles = {
            github_handle: (links.github_username || links.github_handle || "").trim(),
            leetcode_username: (links.leetcode_username || "").trim(),
            isLoaded: true,
        };
        return cachedHandles;
    } catch (error) {
        console.warn("Could not fetch profile handles for metrics:", error.message);
        return cachedHandles;
    }
}

/**
 * Fetch GitHub and LeetCode metrics for the current user.
 */
async function fetchMetrics() {
    const githubContainer = document.getElementById("github-stats");
    const leetcodeContainer = document.getElementById("leetcode-stats");
    const fetchBtn = document.getElementById("fetch-metrics-btn");

    if (!githubContainer || !leetcodeContainer) return;

    // Set Refresh button into active syncing state
    if (fetchBtn) {
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = `
            <span class="spinner"></span>
            <span>Syncing...</span>
        `;
    }

    try {
        // 1. Retrieve handles from profile
        const handles = await getUserHandles();
        const ghHandle = handles.github_handle;
        const lcHandle = handles.leetcode_username;

        // 2. Handle Case: Neither handle is linked
        if (!ghHandle && !lcHandle) {
            renderEmptyState(
                githubContainer,
                "GitHub",
                "Connect your GitHub username in Edit Profile to sync repositories, commits, and language stats."
            );
            renderEmptyState(
                leetcodeContainer,
                "LeetCode",
                "Connect your LeetCode username in Edit Profile to sync solved problems, contest rating, and ranks."
            );
            return;
        }

        // 3. Render loading skeletons for active platforms, or empty state for missing ones
        if (ghHandle) {
            renderSkeleton(githubContainer, "GitHub");
        } else {
            renderEmptyState(
                githubContainer,
                "GitHub",
                "Connect your GitHub username in Edit Profile to sync repositories, commits, and language stats."
            );
        }

        if (lcHandle) {
            renderSkeleton(leetcodeContainer, "LeetCode");
        } else {
            renderEmptyState(
                leetcodeContainer,
                "LeetCode",
                "Connect your LeetCode username in Edit Profile to sync solved problems, contest rating, and ranks."
            );
        }

        // 4. Trigger backend metrics sync endpoint
        let responseData = null;
        try {
            responseData = await apiRequest("/metrics/fetch", {
                method: "POST",
                body: {
                    github_handle: ghHandle || undefined,
                    leetcode_username: lcHandle || undefined,
                },
            });
        } catch (apiErr) {
            console.error("Backend metrics sync failed:", apiErr.message);
            // Handle complete fetch failure with isolated per-platform fallbacks
            if (ghHandle) {
                renderPartialError(
                    githubContainer,
                    "GitHub",
                    "GitHub data temporarily unavailable. Rate limit or connection issue."
                );
            }
            if (lcHandle) {
                renderPartialError(
                    leetcodeContainer,
                    "LeetCode",
                    "LeetCode data temporarily unavailable. Rate limit or connection issue."
                );
            }
            return;
        }

        // 5. Render GitHub stats or partial fallback
        if (ghHandle) {
            if (responseData && responseData.github) {
                renderGithubStats(responseData.github, ghHandle);
            } else {
                renderPartialError(
                    githubContainer,
                    "GitHub",
                    "GitHub data unavailable. Verify handle or try refreshing again."
                );
            }
        }

        // 6. Render LeetCode stats or partial fallback
        if (lcHandle) {
            if (responseData && responseData.leetcode) {
                renderLeetcodeStats(responseData.leetcode, lcHandle);
            } else {
                renderPartialError(
                    leetcodeContainer,
                    "LeetCode",
                    "LeetCode data unavailable. Verify username or try refreshing again."
                );
            }
        }
    } catch (error) {
        console.error("Unexpected error in fetchMetrics:", error);
    } finally {
        if (fetchBtn) {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = `<span>Refresh Data</span>`;
        }
    }
}

/**
 * Render GitHub statistics card with repo count, commit count, and language pills.
 * @param {object} githubData - GitHub statistics payload
 * @param {string} username - GitHub username
 */
function renderGithubStats(githubData, username) {
    const container = document.getElementById("github-stats");
    if (!container) return;

    const commits = (githubData.total_commits || 0).toLocaleString();
    const repos = (githubData.repos || 0).toLocaleString();
    const languages = Array.isArray(githubData.languages) ? githubData.languages : [];
    const topLanguage = githubData.top_language || (languages.length > 0 ? languages[0] : null);

    let languagePillsHtml = "";
    if (languages.length > 0) {
        languagePillsHtml = languages
            .map((lang) => {
                const isTop = topLanguage && lang.toLowerCase() === topLanguage.toLowerCase();
                const badgeClass = isTop ? "language-pill top-lang" : "language-pill";
                return `<span class="${badgeClass}">${escapeMetricsHtml(lang)}</span>`;
            })
            .join("");
    } else {
        languagePillsHtml = `<span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">No public language statistics found</span>`;
    }

    container.innerHTML = `
        <div class="metric-header">
            <div class="metric-title-group">
                <div class="metric-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                        <path d="M9 18c-4.51 2-5-2-7-2"/>
                    </svg>
                </div>
                <h3>GitHub</h3>
            </div>
            <a href="https://github.com/${encodeURIComponent(username || "")}" target="_blank" rel="noopener noreferrer" class="metric-handle-badge" title="View GitHub Profile">
                <span>@${escapeMetricsHtml(username)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
            </a>
        </div>

        <div class="metric-stats-row">
            <div class="stat-box">
                <span class="stat-box-value highlight-gold">${commits}</span>
                <span class="stat-box-label">Commits (1 Year)</span>
            </div>
            <div class="stat-box">
                <span class="stat-box-value">${repos}</span>
                <span class="stat-box-label">Public Repos</span>
            </div>
        </div>

        <div class="languages-section">
            <div class="languages-header">
                <span>Languages</span>
                ${topLanguage ? `<span class="badge-gold" style="font-size: 0.65rem;">Top: ${escapeMetricsHtml(topLanguage)}</span>` : ""}
            </div>
            <div class="language-pills-container">
                ${languagePillsHtml}
            </div>
        </div>
    `;
}

/**
 * Render LeetCode statistics card with color-coded difficulty metrics and contest rating.
 * @param {object} leetcodeData - LeetCode statistics payload
 * @param {string} username - LeetCode username
 */
function renderLeetcodeStats(leetcodeData, username) {
    const container = document.getElementById("leetcode-stats");
    if (!container) return;

    const totalSolved = leetcodeData.problems_solved || 0;
    const easy = leetcodeData.easy || 0;
    const medium = leetcodeData.medium || 0;
    const hard = leetcodeData.hard || 0;
    const rating = leetcodeData.rating || leetcodeData.contest_rating || 0;
    const ranking = leetcodeData.ranking || 0;

    // Calculate difficulty distribution percentages for the progress bar
    const totalSolvedForPct = easy + medium + hard;
    let easyPct = 0, mediumPct = 0, hardPct = 0;
    if (totalSolvedForPct > 0) {
        easyPct = Math.round((easy / totalSolvedForPct) * 100);
        mediumPct = Math.round((medium / totalSolvedForPct) * 100);
        hardPct = Math.max(0, 100 - easyPct - mediumPct);
    }

    const formattedRating = rating > 0 ? Math.round(rating) : "Unrated";
    const formattedRanking = ranking > 0 ? `#${ranking.toLocaleString()}` : "Unranked";

    container.innerHTML = `
        <div class="metric-header">
            <div class="metric-title-group">
                <div class="metric-icon" aria-hidden="true" style="color: var(--color-accent);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                    </svg>
                </div>
                <h3>LeetCode</h3>
            </div>
            <a href="https://leetcode.com/u/${encodeURIComponent(username)}" target="_blank" rel="noopener noreferrer" class="metric-handle-badge" title="View LeetCode Profile">
                <span>@${escapeMetricsHtml(username)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
            </a>
        </div>

        <div class="metric-stats-row" style="margin-bottom: var(--space-sm);">
            <div class="stat-box" style="grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; padding: 0.65rem 1rem;">
                <span class="stat-box-label" style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Total Solved</span>
                <span class="stat-box-value highlight-gold" style="font-size: var(--font-size-2xl);">${totalSolved.toLocaleString()}</span>
            </div>
        </div>

        <!-- Color-Coded Difficulty Distribution (Emerald = Easy, Amber = Medium, Ruby = Hard) -->
        <div class="difficulty-grid">
            <div class="difficulty-box diff-easy" title="Easy Problems Solved">
                <span class="diff-count text-emerald-500">${easy.toLocaleString()}</span>
                <span class="diff-label">Easy</span>
            </div>
            <div class="difficulty-box diff-medium" title="Medium Problems Solved">
                <span class="diff-count text-amber-500">${medium.toLocaleString()}</span>
                <span class="diff-label">Medium</span>
            </div>
            <div class="difficulty-box diff-hard" title="Hard Problems Solved">
                <span class="diff-count text-ruby-500">${hard.toLocaleString()}</span>
                <span class="diff-label">Hard</span>
            </div>
        </div>

        <!-- Visual Multi-segment Distribution Bar -->
        <div class="diff-progress-bar" title="Easy: ${easyPct}% | Medium: ${mediumPct}% | Hard: ${hardPct}%">
            <div class="progress-segment easy" style="width: ${easyPct}%;"></div>
            <div class="progress-segment medium" style="width: ${mediumPct}%;"></div>
            <div class="progress-segment hard" style="width: ${hardPct}%;"></div>
        </div>

        <div class="leetcode-meta-row">
            <div class="meta-pill">
                <span>Rating:</span>
                <strong>${formattedRating}</strong>
            </div>
            <div class="meta-pill">
                <span>Global Rank:</span>
                <strong>${formattedRanking}</strong>
            </div>
        </div>
    `;
}

/**
 * Render an empty state CTA when a platform handle is missing.
 * @param {HTMLElement} container - Card container element
 * @param {string} platform - Platform name ('GitHub' or 'LeetCode')
 * @param {string} description - Explanation message
 */
function renderEmptyState(container, platform, description) {
    if (!container) return;

    const iconSvg =
        platform === "GitHub"
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
               </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
               </svg>`;

    container.innerHTML = `
        <div class="metric-header">
            <div class="metric-title-group">
                <div class="metric-icon" aria-hidden="true">${iconSvg}</div>
                <h3>${platform}</h3>
            </div>
            <span class="badge-gold" style="font-size: 0.65rem;">Unlinked</span>
        </div>
        <div class="metric-empty-state">
            <div class="empty-state-icon">${iconSvg}</div>
            <h4 class="empty-state-title">${platform} Not Connected</h4>
            <p class="empty-state-text">${escapeMetricsHtml(description)}</p>
            <button class="empty-state-btn" onclick="triggerEditProfile()" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Link your accounts in Edit Profile</span>
            </button>
        </div>
    `;
}

/**
 * Render an isolated partial failure card if an external API fails.
 * @param {HTMLElement} container - Card container element
 * @param {string} platform - Platform name
 * @param {string} message - Error description
 */
function renderPartialError(container, platform, message) {
    if (!container) return;

    container.innerHTML = `
        <div class="metric-header">
            <div class="metric-title-group">
                <h3>${platform}</h3>
            </div>
            <span class="badge-gold" style="border-color: var(--color-danger); color: #FCA5A5; font-size: 0.65rem;">Unavailable</span>
        </div>
        <div class="metric-error-state">
            <div class="error-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <h4 class="error-state-title">${platform} Data Unavailable</h4>
            <p class="error-state-text">${escapeMetricsHtml(message)}</p>
            <button class="error-retry-btn" onclick="fetchMetrics()" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <span>Retry Sync</span>
            </button>
        </div>
    `;
}

/**
 * Render loading skeleton inside a metric card.
 * @param {HTMLElement} container - Card container element
 * @param {string} platform - Platform name
 */
function renderSkeleton(container, platform) {
    if (!container) return;

    container.innerHTML = `
        <div class="metric-header">
            <div class="metric-title-group">
                <h3>${platform}</h3>
            </div>
            <span class="badge-gold" style="font-size: 0.65rem;">Syncing...</span>
        </div>
        <div class="skeleton-loader" style="padding: var(--space-md) 0;">
            <div class="skeleton-line" style="height: 48px;"></div>
            <div class="skeleton-line" style="height: 32px; width: 80%;"></div>
            <div class="skeleton-line short"></div>
        </div>
    `;
}

/**
 * Programmatically trigger edit profile modal or scroll to profile section.
 */
function triggerEditProfile() {
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) {
        editBtn.click();
    }
    const profileSection = document.getElementById("profile-section");
    if (profileSection) {
        profileSection.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Escape HTML special characters for secure injection into DOM strings.
 * @param {string} str - Raw string
 * @returns {string} Sanitized string
 */
function escapeMetricsHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Initialize metrics section event listeners and trigger initial data load.
 */
function initMetricsSection() {
    const fetchBtn = document.getElementById("fetch-metrics-btn");
    if (fetchBtn) {
        fetchBtn.addEventListener("click", () => fetchMetrics());
    }

    // Auto-trigger metrics fetch if user is authenticated
    if (typeof getToken === "function" && getToken()) {
        fetchMetrics();
    }
}
