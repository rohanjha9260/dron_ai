/**
 * Dron-AI Placement Readiness Module
 *
 * Handles:
 *   - Triggering XGBoost placement readiness prediction
 *   - Rendering the interactive SVG score gauge
 *   - Displaying readiness tier and contextual descriptions
 *   - Rendering SHAP / feature importance influence breakdown
 */

const FEATURE_LABELS = {
    cgpa: "Academic CGPA",
    attendance_pct: "Academic Attendance",
    active_backlogs: "Active Backlogs",
    dsa_score: "Data Structures & Algorithms",
    python_prof: "Python Proficiency",
    cpp_prof: "C++ Proficiency",
    aiml_knowledge: "AI/ML Knowledge",
    total_commits: "GitHub Commit Activity",
    problems_solved: "LeetCode Solved Problems",
    contest_rating: "Contest Rating",
    project_count: "Completed Projects",
    communication_score: "Soft Skills & Communication",
    internship_exp: "Internship Experience",
};

/**
 * Run placement readiness analysis.
 */
async function analyzePlacement() {
    const gaugePercent = document.getElementById("gauge-percent");
    const gaugeArc = document.getElementById("gauge-fill-arc");
    const tierBadge = document.getElementById("readiness-tier-badge");
    const tierText = document.getElementById("readiness-tier-text");
    const tierDesc = document.getElementById("readiness-tier-desc");
    const navProb = document.getElementById("nav-placement-prob");
    const influenceList = document.getElementById("feature-influence-list");
    const predictBtn = document.getElementById("predict-btn");
    const bannerBtn = document.getElementById("re-run-inference-btn");

    if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.textContent = "Analyzing Vector...";
    }
    if (bannerBtn) {
        bannerBtn.disabled = true;
    }

    try {
        const data = await apiRequest("/predictions/placement", {
            method: "POST",
        });

        const probability = typeof data.placement_probability === "number" ? data.placement_probability : 0.0;
        const tier = data.readiness_tier || "Assessment Pending";
        const percentFormatted = `${(probability * 100).toFixed(1)}%`;

        // 1. Update Gauge Arc and Percent text
        if (gaugePercent) {
            gaugePercent.textContent = percentFormatted;
        }
        if (gaugeArc) {
            const circumference = 440; // 2 * PI * 70
            const offset = Math.max(0, circumference - (circumference * probability));
            gaugeArc.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
            gaugeArc.style.strokeDashoffset = offset;
        }

        // 2. Update Navbar probability pill
        if (navProb) {
            navProb.innerHTML = `<span class="badge-dot"></span> ${percentFormatted}`;
            navProb.className = `badge ${probability >= 0.6 ? "badge-success" : probability >= 0.4 ? "badge-warning" : "badge-danger"}`;
        }

        // 3. Update Readiness Tier badge & description
        if (tierBadge && tierText) {
            tierText.textContent = `Tier: ${tier}`;
            if (probability >= 0.6) {
                tierBadge.className = "badge badge-success";
            } else if (probability >= 0.4) {
                tierBadge.className = "badge badge-warning";
            } else {
                tierBadge.className = "badge badge-danger";
            }
        }

        if (tierDesc) {
            if (probability >= 0.8) {
                tierDesc.textContent = "Student profile demonstrates high placement fitness for top-tier software engineering roles.";
            } else if (probability >= 0.6) {
                tierDesc.textContent = "Solid placement profile with competitive foundation. Fine-tuning core strengths will unlock top offers.";
            } else if (probability >= 0.4) {
                tierDesc.textContent = "Moderate placement foundation. Targeted remediation in weak skill dimensions recommended.";
            } else {
                tierDesc.textContent = "High priority action needed: Focus on core DSA, academic backlogs, and hands-on projects.";
            }
        }

        // 4. Render Feature Influence Breakdown
        if (influenceList && data.feature_importance) {
            influenceList.innerHTML = "";
            const entries = Object.entries(data.feature_importance);
            // Sort by importance descending
            entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

            // Display top 4 influential factors
            const topEntries = entries.slice(0, 4);
            topEntries.forEach(([feat, weight]) => {
                const item = document.createElement("div");
                item.className = "influence-item";
                const label = FEATURE_LABELS[feat] || feat;
                const weightPct = Math.round(weight * 100);
                const isPositive = weightPct > 0;
                item.innerHTML = `
                    <span class="name">${label}</span>
                    <span class="${isPositive ? "impact-pos" : "impact-neg"}">${isPositive ? "+" : ""}${weightPct}% Factor</span>
                `;
                influenceList.appendChild(item);
            });
        }

    } catch (error) {
        console.error("Failed to run placement prediction:", error);
        if (gaugePercent) {
            gaugePercent.textContent = "--%";
        }
        if (gaugeArc) {
            gaugeArc.style.transition = "stroke-dashoffset 0.6s ease";
            gaugeArc.style.strokeDashoffset = 440;
        }
        if (navProb) {
            navProb.innerHTML = `<span class="badge-dot"></span> N/A`;
            navProb.className = "badge badge-danger";
        }
        if (tierText) {
            tierText.textContent = "Analysis Error";
        }
        if (tierDesc) {
            tierDesc.textContent = error.message || "Could not complete prediction. Please verify profile data.";
        }
    } finally {
        if (predictBtn) {
            predictBtn.disabled = false;
            predictBtn.textContent = "Run Placement Prediction";
        }
        if (bannerBtn) {
            bannerBtn.disabled = false;
        }
    }
}

/**
 * Initialize placement section event listeners.
 */
function initPlacementSection() {
    const predictBtn = document.getElementById("predict-btn");
    if (predictBtn) {
        predictBtn.addEventListener("click", analyzePlacement);
    }
    const bannerBtn = document.getElementById("re-run-inference-btn");
    if (bannerBtn) {
        bannerBtn.addEventListener("click", analyzePlacement);
    }
}
