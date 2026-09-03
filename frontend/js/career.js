/**
 * Dron-AI Career Recommendation Module
 *
 * Handles:
 *   - Triggering Cosine Similarity career matching
 *   - Rendering ranked career matches with percentage scores
 *   - Allowing career selection for roadmap generation
 */

// Store selected career for roadmap generation
let selectedCareer = null;

/**
 * Get career recommendations.
 */
async function getCareerRecommendations() {
    const careerList = document.getElementById("career-list");
    const recommendBtn = document.getElementById("recommend-btn");

    recommendBtn.disabled = true;
    recommendBtn.textContent = "Analyzing...";

    try {
        const data = await apiRequest("/career/recommend", {
            method: "POST",
        });

        // TODO: Render career recommendations
        // 1. Clear placeholder text
        // 2. For each recommendation, create a career-item element
        // 3. Show career name and match percentage
        // 4. Add click handler to select career for roadmap
        careerList.innerHTML = "";

        const recommendations = data.recommendations || [];
        if (recommendations.length === 0) {
            careerList.innerHTML = `<p class="placeholder-text">No recommendations available</p>`;
            return;
        }

        recommendations.forEach((rec, index) => {
            const item = document.createElement("div");
            item.className = "career-item";
            item.innerHTML = `
                <span class="career-name">${index + 1}. ${rec.career}</span>
                <span class="career-match">${rec.match_pct.toFixed(1)}%</span>
            `;
            item.addEventListener("click", () => selectCareer(rec.career));
            careerList.appendChild(item);
        });
    } catch (error) {
        careerList.innerHTML = `<p class="error-message">${error.message}</p>`;
    } finally {
        recommendBtn.disabled = false;
        recommendBtn.textContent = "Get Recommendations";
    }
}

/**
 * Select a career for roadmap generation.
 * @param {string} careerName - The selected career path
 */
function selectCareer(careerName) {
    selectedCareer = careerName;
    // Trigger roadmap generation
    if (typeof generateRoadmap === "function") {
        generateRoadmap(careerName);
    }
}

/**
 * Initialize career section event listeners.
 */
function initCareerSection() {
    const recommendBtn = document.getElementById("recommend-btn");
    if (recommendBtn) {
        recommendBtn.addEventListener("click", getCareerRecommendations);
    }
}
