/**
 * Dron-AI Career Recommendation Module
 *
 * Handles:
 *   - Fetching Cosine Similarity career match rankings
 *   - Rendering interactive career recommendation cards
 *   - Selecting target roles to drive skill gap analysis & roadmaps
 */

let selectedCareer = "Software Engineer";

/**
 * Fetch and render career recommendations.
 */
async function getCareerRecommendations() {
    const container = document.getElementById("career-recommendation-list");
    if (!container) return;

    try {
        const data = await apiRequest("/career/recommend", {
            method: "POST",
        });

        const recommendations = data.recommendations || [];
        if (recommendations.length === 0) {
            container.innerHTML = `<p class="placeholder-text" style="padding: 1rem; color: var(--color-text-muted);">No career paths matched your profile yet.</p>`;
            return;
        }

        container.innerHTML = "";

        recommendations.forEach((rec, index) => {
            const isSelected = rec.career === selectedCareer || (index === 0 && !selectedCareer);
            if (isSelected && !selectedCareer) {
                selectedCareer = rec.career;
            }

            const card = document.createElement("div");
            card.className = `career-match-card ${isSelected ? "active-target" : ""}`;
            card.setAttribute("data-career", rec.career);

            const matchFormatted = `${Number(rec.match_pct || 0).toFixed(1)}%`;

            card.innerHTML = `
                <div class="career-info">
                    <div class="career-name-row">
                        <span class="career-name">${rec.career}</span>
                        ${isSelected ? '<span class="badge badge-success btn-small" style="padding: 2px 8px; font-size: 10px;">Target Active</span>' : ""}
                    </div>
                    <span class="career-desc">${rec.description || "Specialized engineering pathway"}</span>
                </div>
                <div class="career-score-wrap">
                    <span class="score-badge" style="${isSelected ? "" : "color: var(--color-primary-light);"}">${matchFormatted}</span>
                    ${!isSelected ? '<button class="btn btn-outline btn-small select-career-btn" type="button">Select</button>' : ""}
                </div>
            `;

            // Click listener on card or button to select career
            card.addEventListener("click", () => {
                selectCareer(rec.career);
            });

            container.appendChild(card);
        });

        // Trigger roadmap for current selected career if not already loaded
        if (typeof generateRoadmap === "function" && selectedCareer) {
            generateRoadmap(selectedCareer);
        }

    } catch (error) {
        console.error("Failed to load career recommendations:", error);
        container.innerHTML = `<p class="error-message" style="color: var(--color-danger); padding: 1rem;">Failed to load recommendations: ${error.message}</p>`;
    }
}

/**
 * Select a career path as active target and update dashboard state.
 * @param {string} careerName - The target career role
 */
function selectCareer(careerName) {
    selectedCareer = careerName;

    // Update Navbar indicator
    const navTarget = document.getElementById("nav-target-role");
    if (navTarget) {
        navTarget.textContent = careerName;
    }

    // Update Roadmap subtitle
    const roadmapTitle = document.getElementById("roadmap-target-title");
    if (roadmapTitle) {
        roadmapTitle.textContent = `Target: ${careerName} Role Requirements`;
    }

    // Update active class on cards
    const cards = document.querySelectorAll(".career-match-card");
    cards.forEach((card) => {
        const cName = card.getAttribute("data-career");
        const scoreWrap = card.querySelector(".career-score-wrap");
        const nameRow = card.querySelector(".career-name-row");

        if (cName === careerName) {
            card.classList.add("active-target");
            if (nameRow && !nameRow.querySelector(".badge-success")) {
                const badge = document.createElement("span");
                badge.className = "badge badge-success btn-small";
                badge.style.cssText = "padding: 2px 8px; font-size: 10px;";
                badge.textContent = "Target Active";
                nameRow.appendChild(badge);
            }
            if (scoreWrap) {
                const btn = scoreWrap.querySelector(".select-career-btn");
                if (btn) btn.remove();
            }
        } else {
            card.classList.remove("active-target");
            if (nameRow) {
                const badge = nameRow.querySelector(".badge-success");
                if (badge) badge.remove();
            }
            if (scoreWrap && !scoreWrap.querySelector(".select-career-btn")) {
                const btn = document.createElement("button");
                btn.className = "btn btn-outline btn-small select-career-btn";
                btn.type = "button";
                btn.textContent = "Select";
                scoreWrap.appendChild(btn);
            }
        }
    });

    // Trigger roadmap generation for the newly selected career
    if (typeof generateRoadmap === "function") {
        generateRoadmap(careerName);
    }
}

/**
 * Initialize career section.
 */
function initCareerSection() {
    getCareerRecommendations();
}
