/**
 * Dron-AI Main Application
 *
 * Entry point for the dashboard page (index.html).
 * Initializes all dashboard modules after verifying authentication.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication — redirect to login if no token
    checkAuth();

    // Initialize all dashboard sections
    initProfileSection();
    initMetricsSection();
    initPlacementSection();
    initCareerSection();

    // Load initial data
    loadProfile();

    // Display username in navbar
    loadNavbarUser();
});

/**
 * Fetch and display the user's name in the navbar.
 */
async function loadNavbarUser() {
    const usernameSpan = document.getElementById("nav-username");
    try {
        const data = await apiRequest("/auth/me", { method: "GET" });
        if (usernameSpan && data.full_name) {
            usernameSpan.textContent = data.full_name;
        }
    } catch (error) {
        // Silently fail — user can still use the dashboard
        console.warn("Could not load user info for navbar");
    }
}
