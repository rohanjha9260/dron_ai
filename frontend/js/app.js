/**
 * Dron-AI Main Dashboard Controller
 *
 * Entry point for index.html (Dashboard Hub).
 * Loads real summary statistics across Profile, Placement, Career, and Roadmap modules.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Guard authentication (redirects to login.html if not authenticated)
    if (typeof checkAuth === "function") {
        checkAuth();
    }

    // 2. Safely initialize modular sections if present on legacy pages
    if (typeof initProfileSection === "function") initProfileSection();
    if (typeof initMetricsSection === "function") initMetricsSection();
    if (typeof initPlacementSection === "function") initPlacementSection();
    if (typeof initCareerSection === "function") initCareerSection();
    if (typeof loadProfile === "function") loadProfile();

    // 3. Load Hub Overview Cards
    loadDashboardHubData();
});

/**
 * Fetch and populate high-level summary cards on the Dashboard Hub.
 */
async function loadDashboardHubData() {
    if (typeof apiRequest !== "function") return;

    // A. Academic Profile Data
    try {
        const profileData = await apiRequest("/users/profile", { method: "GET" });
        if (profileData) {
            const academics = profileData.academics && profileData.academics.length > 0
                ? profileData.academics[0]
                : null;

            const cgpaEl = document.getElementById("hub-cgpa");
            if (cgpaEl && academics && academics.cgpa !== undefined) {
                cgpaEl.textContent = Number(academics.cgpa).toFixed(2);
            }
        }
    } catch (err) {
        console.warn("Could not load profile metrics for dashboard hub:", err.message);
    }

    // B. Placement Prediction Data
    try {
        const predData = await apiRequest("/predictions/placement", { method: "POST" });
        if (predData) {
            const probPct = Math.round((predData.placement_probability || 0) * 100);
            const placementPctEl = document.getElementById("hub-placement-pct");
            const navProbEl = document.getElementById("nav-placement-prob");
            const tierBadge = document.getElementById("hub-placement-tier");

            if (placementPctEl) placementPctEl.textContent = `${probPct}%`;
            if (navProbEl) navProbEl.innerHTML = `<span class="badge-dot"></span> ${probPct}% Ready`;

            if (tierBadge && predData.readiness_tier) {
                tierBadge.innerHTML = `<span class="badge-dot"></span> ${predData.readiness_tier}`;
                if (probPct >= 75) {
                    tierBadge.className = "badge badge-success";
                } else if (probPct >= 50) {
                    tierBadge.className = "badge badge-warning";
                } else {
                    tierBadge.className = "badge badge-danger";
                }
            }
        }
    } catch (err) {
        console.warn("Could not load placement prediction for dashboard hub:", err.message);
    }

    // C. Career Recommendations
    try {
        const careerData = await apiRequest("/career/recommend", { method: "POST" });
        if (careerData && careerData.recommendations && careerData.recommendations.length > 0) {
            const top = careerData.recommendations[0];
            const roleName = top.career_name || top.target_role || top.career || "Software Engineer";
            const topCareerEl = document.getElementById("hub-top-career");
            const navTargetRole = document.getElementById("nav-target-role");

            if (topCareerEl) topCareerEl.textContent = roleName;
            if (navTargetRole) navTargetRole.textContent = roleName;
        }
    } catch (err) {
        console.warn("Could not load career recommendations for dashboard hub:", err.message);
    }

    // D. Roadmap & Gap Analysis
    try {
        const roadmapData = await apiRequest("/roadmap/generate", { method: "POST" });
        if (roadmapData && roadmapData.gaps) {
            const gapCount = Array.isArray(roadmapData.gaps)
                ? roadmapData.gaps.length
                : Object.keys(roadmapData.gaps).length;
            const gapsEl = document.getElementById("hub-gaps-count");
            if (gapsEl) gapsEl.textContent = `${gapCount} Target Areas`;
        }
    } catch (err) {
        // Fallback for roadmap if target role not specified yet
        const gapsEl = document.getElementById("hub-gaps-count");
        if (gapsEl && gapsEl.textContent === "--") gapsEl.textContent = "Analysis Ready";
    }
}
