/**
 * Dron-AI Career Recommendation Module
 *
 * Handles:
 *   - Triggering Cosine Similarity career matching
 *   - Rendering ranked career matches with percentage scores
 *   - Selecting career target for roadmap generation
 */

// Track selected career in session
let selectedCareer = localStorage.getItem("dron_target_career") || "Software Engineer";

/**
 * Fetch and render career recommendations.
 */
async function getCareerRecommendations() {
    const careerList = document.getElementById("career-list");
    const recommendBtn = document.getElementById("recommend-btn");

    if (recommendBtn) {
        recommendBtn.disabled = true;
        recommendBtn.innerHTML = `
            <span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
            <span>Calculating...</span>
        `;
    }

    try {
        const data = await apiRequest("/career/recommend", {
            method: "POST",
        });

        const recommendations = data.recommendations || [];
        if (!careerList) return;

        if (recommendations.length === 0) {
            careerList.innerHTML = `<p class="placeholder-text" style="text-align:center;padding:2rem;color:var(--color-text-muted);">No recommendations available</p>`;
            return;
        }

        careerList.innerHTML = "";

        recommendations.forEach((rec, index) => {
            const roleName = rec.career || rec.career_name || rec.role || "Software Engineer";
            const matchPct = Number(rec.match_pct || 0).toFixed(1);
            const isSelected = roleName === selectedCareer || (index === 0 && !selectedCareer);

            if (isSelected) {
                selectedCareer = roleName;
                updateSelectedTargetUI(roleName);
            }

            const item = document.createElement("div");
            item.className = `career-match-card ${isSelected ? "active-target" : ""}`;
            item.style.cursor = "pointer";
            item.dataset.careerName = roleName;

            item.innerHTML = `
                <div class="career-info">
                    <div class="career-name-row">
                        <span class="career-name">${index + 1}. ${roleName}</span>
                        ${isSelected ? '<span class="badge badge-success btn-small" style="padding: 2px 8px; font-size: 10px;">Target Active</span>' : ''}
                    </div>
                    <span class="career-desc">${rec.description || "Synthesized profile fit based on technical strengths & academic vectors."}</span>
                </div>
                <div class="career-score-wrap">
                    <span class="score-badge">${matchPct}%</span>
                    <button class="btn ${isSelected ? "btn-primary" : "btn-outline"} btn-small" type="button">
                        ${isSelected ? "Selected" : "Select"}
                    </button>
                </div>
            `;

            item.addEventListener("click", () => selectCareer(roleName));
            careerList.appendChild(item);
        });

    } catch (error) {
        if (careerList) {
            careerList.innerHTML = `<p class="error-message" style="color:var(--color-danger);padding:1rem;">${error.message}</p>`;
        }
    } finally {
        if (recommendBtn) {
            recommendBtn.disabled = false;
            recommendBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                <span>Re-compute Matches</span>
            `;
        }
    }
}

/**
 * Select a career for roadmap generation and persist to storage.
 * @param {string} careerName - The selected career path
 */
function selectCareer(careerName) {
    selectedCareer = careerName;
    localStorage.setItem("dron_target_career", careerName);

    updateSelectedTargetUI(careerName);

    // Re-render highlight classes on cards
    const cards = document.querySelectorAll(".career-match-card");
    cards.forEach((c) => {
        if (c.dataset.careerName === careerName) {
            c.classList.add("active-target");
            const btn = c.querySelector("button");
            if (btn) {
                btn.className = "btn btn-primary btn-small";
                btn.textContent = "Selected";
            }
        } else {
            c.classList.remove("active-target");
            const btn = c.querySelector("button");
            if (btn) {
                btn.className = "btn btn-outline btn-small";
                btn.textContent = "Select";
            }
            const activeBadge = c.querySelector(".badge-success");
            if (activeBadge) activeBadge.remove();
        }
    });

    // Update top navbar target role
    const navTarget = document.getElementById("nav-target-role");
    if (navTarget) navTarget.textContent = careerName;
}

/**
 * Update the Selected Target card on the right column.
 */
function updateSelectedTargetUI(careerName) {
    const titleEl = document.getElementById("selected-career-title");
    if (titleEl) titleEl.textContent = careerName;

    const roadmapLink = document.getElementById("btn-view-roadmap");
    if (roadmapLink) {
        roadmapLink.href = `roadmap.html?target=${encodeURIComponent(careerName)}`;
    }
}

/**
 * Initialize career section on DOM ready.
 */
function initCareerSection() {
    const recommendBtn = document.getElementById("recommend-btn");
    if (recommendBtn) {
        recommendBtn.addEventListener("click", getCareerRecommendations);
    }

    // Auto-run if on career page
    const file = window.location.pathname.split("/").pop();
    if (file === "career.html") {
        getCareerRecommendations();
    }
}

document.addEventListener("DOMContentLoaded", initCareerSection);
