/**
 * Dron-AI Placement Readiness Module
 *
 * Handles:
 *   - Triggering XGBoost placement prediction
 *   - Rendering the readiness gauge visual score indicator
 *   - Displaying readiness tier and feature influences
 */

/**
 * Run placement readiness analysis.
 */
async function analyzePlacement() {
    const gaugeLabel = document.getElementById("gauge-label");
    const tierLabel = document.getElementById("readiness-tier");
    const gaugeArc = document.getElementById("gauge-fill-arc");
    const predictBtn = document.getElementById("predict-btn");
    const summaryText = document.getElementById("prediction-summary-text");
    const factorList = document.getElementById("feature-influence-list");

    if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.innerHTML = `
            <span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
            <span>Running Inference...</span>
        `;
    }

    try {
        const data = await apiRequest("/predictions/placement", {
            method: "POST",
        });

        const probability = data.placement_probability || 0;
        const pct = Math.round(probability * 100);
        const tier = data.readiness_tier || "Analysis Complete";

        if (gaugeLabel) gaugeLabel.textContent = `${pct}%`;

        // Update Gauge Arc (arc length is approx 440 in SVG viewBox)
        if (gaugeArc) {
            // stroke-dasharray is 440. 100% -> dashoffset 0, 0% -> dashoffset 440
            const offset = Math.max(0, Math.min(440, 440 - (440 * (pct / 100))));
            gaugeArc.style.strokeDashoffset = offset;
            if (pct >= 75) {
                gaugeArc.style.stroke = "var(--color-success)";
            } else if (pct >= 50) {
                gaugeArc.style.stroke = "var(--color-primary)";
            } else {
                gaugeArc.style.stroke = "var(--color-danger)";
            }
        }

        // Update Tier Badge
        if (tierLabel) {
            tierLabel.innerHTML = `<span class="badge-dot"></span> Tier: ${tier}`;
            if (pct >= 75) {
                tierLabel.className = "badge badge-success";
            } else if (pct >= 50) {
                tierLabel.className = "badge badge-warning";
            } else {
                tierLabel.className = "badge badge-danger";
            }
        }

        // Update Summary Text
        if (summaryText) {
            summaryText.textContent = `Model predicted placement readiness at ${pct}%. Student status is categorized as ${tier}.`;
        }

        // Update Navbar probability indicator
        const navProb = document.getElementById("nav-placement-prob");
        if (navProb) {
            navProb.innerHTML = `<span class="badge-dot"></span> ${pct}% Ready`;
        }

        // Render dynamic top factors if available
        if (factorList && data.top_factors && Array.isArray(data.top_factors) && data.top_factors.length > 0) {
            factorList.innerHTML = data.top_factors.map((factor, idx) => {
                const formattedName = factor.replace(/_/g, " ").toUpperCase();
                return `
                    <div class="influence-item">
                        <span class="name">${formattedName}</span>
                        <span class="impact-pos">Top Factor #${idx + 1}</span>
                    </div>
                `;
            }).join("");
        }
    } catch (error) {
        if (tierLabel) tierLabel.innerHTML = `<span class="badge-dot"></span> Error`;
        if (gaugeLabel) gaugeLabel.textContent = "--";
        if (gaugeArc) gaugeArc.style.strokeDashoffset = 440;
        if (summaryText) summaryText.textContent = error.message;
        const navProb = document.getElementById("nav-placement-prob");
        if (navProb) navProb.innerHTML = `<span class="badge-dot"></span> --% Ready`;
        if (factorList) factorList.innerHTML = "";
    } finally {
        if (predictBtn) {
            predictBtn.disabled = false;
            predictBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                <span>Run Placement Analysis</span>
            `;
        }
    }
}

/**
 * Initialize placement section event listeners and auto-load.
 */
function initPlacementSection() {
    const predictBtn = document.getElementById("predict-btn");
    if (predictBtn) {
        predictBtn.addEventListener("click", analyzePlacement);
    }
    // Auto-analyze on predictions page
    const file = window.location.pathname.split("/").pop();
    if (file === "predictions.html") {
        analyzePlacement();
    }
}

document.addEventListener("DOMContentLoaded", initPlacementSection);
