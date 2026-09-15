/**
 * Dron-AI Placement Readiness Module
 *
 * Handles:
 *   - Triggering XGBoost placement prediction via POST /api/v1/predictions/placement
 *   - Rendering the animated circular SVG readiness gauge
 *   - Dynamic number animation via requestAnimationFrame (0% to target %)
 *   - Dynamic tier badge logic with score thresholds & color classes
 *   - Spam-click prevention and loading state management
 */

let isPlacementAnalyzing = false;

/**
 * Animate a numeric display smoothly from start to end percentage.
 *
 * @param {HTMLElement} element - Target DOM element (gauge label)
 * @param {number} start - Starting number (e.g. 0)
 * @param {number} end - Target percentage value (e.g. 84)
 * @param {number} duration - Animation duration in ms (default: 1000)
 */
function animateValue(element, start, end, duration = 1000) {
    if (!element) return;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out calculation for smooth slowdown
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + (end - start) * ease);

        element.innerText = `${value}%`;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.innerText = `${end}%`;
        }
    };

    window.requestAnimationFrame(step);
}

/**
 * Update the tier badge text and CSS color class based on the percentage score threshold:
 *   - > 80%: "High Readiness" (Metallic Gold / Emerald)
 *   - 50% - 79%: "Moderate Readiness" (Amber)
 *   - < 50%: "Needs Improvement" (Crimson / Red)
 *
 * @param {HTMLElement} element - Target .tier-badge DOM element
 * @param {number} percentage - Placement percentage (0 to 100)
 */
function updateTierBadge(element, percentage) {
    if (!element) return;

    // Reset previous tier classes while keeping base class
    element.className = "tier-badge";

    if (percentage >= 80) {
        element.innerText = "High Readiness";
        element.classList.add("tier-high", "tier-gold", "tier-emerald");
    } else if (percentage >= 50) {
        element.innerText = "Moderate Readiness";
        element.classList.add("tier-moderate", "tier-amber");
    } else {
        element.innerText = "Needs Improvement";
        element.classList.add("tier-low", "tier-red");
    }
}

/**
 * Set SVG circular gauge stroke-dashoffset based on probability.
 *
 * @param {SVGElement} circle - Progress circle element
 * @param {number} probability - Score between 0.0 and 1.0
 */
function setGaugeProgress(circle, probability) {
    if (!circle) return;

    const radius = circle.r ? circle.r.baseVal.value : 80;
    const circumference = 2 * Math.PI * radius;
    const clampedProb = Math.min(Math.max(probability, 0), 1);
    const targetOffset = circumference * (1 - clampedProb);

    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = targetOffset;
}

/**
 * Run placement readiness analysis.
 * Manages loading states, triggers prediction API, and animates gauge & counters.
 */
async function analyzePlacement() {
    if (isPlacementAnalyzing) return;

    const predictBtn = document.getElementById("predict-btn");
    const gaugeLabel = document.getElementById("gauge-label");
    const tierBadge = document.querySelector(".tier-badge") || document.getElementById("readiness-tier");
    const progressCircle = document.getElementById("gauge-progress") || document.getElementById("gauge-fill");

    isPlacementAnalyzing = true;
    if (predictBtn) {
        predictBtn.disabled = true;
        predictBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
    }

    try {
        const data = await apiRequest("/api/v1/predictions/placement", {
            method: "POST",
        });

        // Extract placement_probability (0.0 - 1.0)
        const probability = typeof data.placement_probability === "number" ? data.placement_probability : 0;
        const targetPercent = Math.round(probability * 100);

        // 1. Calculate stroke-dashoffset and animate the SVG gauge
        setGaugeProgress(progressCircle, probability);

        // 2. Animate counter number smoothly from 0 to targetPercent
        if (gaugeLabel) {
            animateValue(gaugeLabel, 0, targetPercent, 1000);
        }

        // 3. Update dynamic status badge based on score threshold
        if (tierBadge) {
            updateTierBadge(tierBadge, targetPercent);
        }
    } catch (error) {
        if (tierBadge) {
            tierBadge.innerText = error.message || "Analysis failed";
            tierBadge.className = "tier-badge tier-error";
        }
        if (gaugeLabel) {
            gaugeLabel.innerText = "--";
        }
    } finally {
        if (predictBtn) {
            predictBtn.disabled = false;
            predictBtn.textContent = "Analyze Readiness";
        }
        isPlacementAnalyzing = false;
    }
}

/**
 * Initialize placement section event listeners and initial gauge position.
 */
function initPlacementSection() {
    const predictBtn = document.getElementById("predict-btn");
    if (predictBtn) {
        predictBtn.addEventListener("click", analyzePlacement);
    }

    // Initialize progress circle to 0% fill
    const progressCircle = document.getElementById("gauge-progress") || document.getElementById("gauge-fill");
    if (progressCircle) {
        const radius = progressCircle.r ? progressCircle.r.baseVal.value : 80;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference}`;
        progressCircle.style.strokeDashoffset = `${circumference}`;
    }
}

// Export for Node/CommonJS test runners if applicable
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        analyzePlacement,
        animateValue,
        updateTierBadge,
        setGaugeProgress,
        initPlacementSection,
    };
}
