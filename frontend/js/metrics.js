/**
 * Dron-AI Developer Metrics Module
 *
 * Handles:
 *   - Triggering GitHub + LeetCode data fetch
 *   - Rendering fetched stats (commits, repos, problems solved, etc.)
 *   - Loading states during fetch
 */

/**
 * Fetch GitHub and LeetCode metrics for the current user.
 */
async function fetchMetrics() {
    const githubContainer = document.getElementById("github-stats");
    const leetcodeContainer = document.getElementById("leetcode-stats");
    const fetchBtn = document.getElementById("fetch-metrics-btn");

    fetchBtn.disabled = true;
    fetchBtn.textContent = "Fetching...";

    try {
        // TODO: Get handles from profile or prompt user
        const data = await apiRequest("/metrics/fetch", {
            method: "POST",
            body: {
                github_handle: "", // TODO: Get from profile
                leetcode_username: "", // TODO: Get from profile
            },
        });

        // TODO: Render GitHub stats
        // - Total repos, total commits, top language, languages list

        // TODO: Render LeetCode stats
        // - Problems solved (easy/medium/hard), contest rating
    } catch (error) {
        console.error("Failed to fetch metrics:", error.message);
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = "Refresh Data";
    }
}

/**
 * Initialize metrics section event listeners.
 */
function initMetricsSection() {
    const fetchBtn = document.getElementById("fetch-metrics-btn");
    if (fetchBtn) {
        fetchBtn.addEventListener("click", fetchMetrics);
    }
}
