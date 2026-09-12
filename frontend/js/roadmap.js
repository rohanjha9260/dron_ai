/**
 * Dron-AI Roadmap & Skill Gap Module
 *
 * Handles:
 *   - Triggering personalized roadmap generation
 *   - Rendering the phased action plan timeline
 *   - Displaying skill gaps table and deficit indicators
 */

/**
 * Generate a personalized roadmap for the target career.
 * @param {string} targetCareer - The target career role
 */
async function generateRoadmap(targetCareer) {
    const timeline = document.getElementById("roadmap-timeline");
    const tbody = document.getElementById("gap-analysis-tbody");
    const gapBadge = document.getElementById("gap-count-badge");
    const targetSubtitle = document.getElementById("gap-target-subtitle");
    const generateBtn = document.getElementById("generate-roadmap-btn");

    if (!targetCareer) {
        targetCareer = document.getElementById("roadmap-target-select")?.value || "Software Engineer";
    }

    if (targetSubtitle) {
        targetSubtitle.textContent = `Target: ${targetCareer}`;
    }

    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
            <span>Synthesizing...</span>
        `;
    }

    if (timeline) {
        timeline.innerHTML = `<p class="placeholder-text" style="text-align:center;padding:2rem;color:var(--color-text-muted);">Generating milestone roadmap for ${targetCareer}...</p>`;
    }

    try {
        const data = await apiRequest("/roadmap/generate", {
            method: "POST",
            body: { target_career: targetCareer },
        });

        // 1. Render Skill Gaps Table
        const gaps = data.skill_gaps || data.gaps || {};
        const gapEntries = Array.isArray(gaps) ? gaps : Object.entries(gaps);

        if (tbody) {
            tbody.innerHTML = "";
            let gapCount = 0;

            if (gapEntries.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align:center;padding:1.5rem;color:var(--color-success);">
                            No significant skill gaps detected! Your profile aligns strongly with ${targetCareer}.
                        </td>
                    </tr>
                `;
            } else {
                gapEntries.forEach((entry) => {
                    const skillName = Array.isArray(entry) ? entry[0] : entry.skill;
                    const gapVal = Array.isArray(entry) ? entry[1] : (entry.deficit || entry.gap || 0);

                    if (gapVal > 0) gapCount++;

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">
                            ${skillName.replace(/_/g, " ").toUpperCase()}
                        </td>
                        <td style="color: var(--color-text-secondary);">
                            <span>Deficit: ${Number(gapVal).toFixed(1)} pts</span>
                        </td>
                        <td>
                            ${gapVal > 0 
                                ? `<span class="badge badge-warning" style="font-size:0.7rem;padding:2px 8px;">-${Number(gapVal).toFixed(0)} Gap</span>`
                                : `<span class="badge badge-success" style="font-size:0.7rem;padding:2px 8px;">Aligned</span>`
                            }
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            if (gapBadge) {
                gapBadge.innerHTML = `<span class="badge-dot"></span> ${gapCount} Weakness Gaps Identified`;
                gapBadge.className = gapCount > 0 ? "badge badge-warning" : "badge badge-success";
            }
        }

        // 2. Render Roadmap Timeline
        const milestones = data.milestones || data.roadmap || [];
        if (timeline) {
            timeline.innerHTML = "";

            if (milestones.length === 0) {
                timeline.innerHTML = `
                    <div style="text-align:center;padding:2.5rem;background:rgba(212,175,55,0.04);border-radius:var(--radius-md);">
                        <p style="color:var(--color-primary-light);font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:6px;">
                            Optimal Placement Preparation Reached
                        </p>
                        <p style="color:var(--color-text-secondary);font-size:var(--font-size-xs);">
                            Your current metrics exceed target role requirements for ${targetCareer}. Keep practicing mock interviews and system architecture design.
                        </p>
                    </div>
                `;
                return;
            }

            milestones.forEach((m, idx) => {
                const stepEl = document.createElement("div");
                stepEl.className = "timeline-item";
                stepEl.style.cssText = "display: flex; gap: 1rem; margin-bottom: 1.5rem; position: relative;";

                const tasks = m.tasks || (m.action_items ? m.action_items : []);
                const tasksHtml = tasks.map(t => `<li style="margin-bottom:4px;color:var(--color-text-secondary);font-size:var(--font-size-xs);">${t}</li>`).join("");

                stepEl.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:#000;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">
                            ${idx + 1}
                        </div>
                        <div style="flex:1;width:2px;background:rgba(212,175,55,0.2);margin-top:4px;"></div>
                    </div>
                    <div style="flex:1;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:1rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <h3 style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);color:var(--color-primary-light);">
                                ${m.title || m.milestone || `Phase ${idx + 1}`}
                            </h3>
                            <span class="badge badge-info" style="font-size:0.65rem;">${m.duration || m.timeframe || "Weeks " + (idx * 3 + 1) + "-" + ((idx + 1) * 3)}</span>
                        </div>
                        <p style="font-size:var(--font-size-xs);color:var(--color-text-secondary);margin-bottom:8px;">
                            ${m.description || "Focus area to close target capability deficiency."}
                        </p>
                        ${tasks.length > 0 ? `<ul style="padding-left:1.2rem;margin:0;">${tasksHtml}</ul>` : ""}
                    </div>
                `;

                timeline.appendChild(stepEl);
            });
        }

    } catch (error) {
        if (timeline) timeline.innerHTML = `<p class="error-message" style="color:var(--color-danger);padding:1rem;">${error.message}</p>`;
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                <span>Generate Plan</span>
            `;
        }
    }
}

/**
 * Initialize roadmap page handlers on DOM ready.
 */
function initRoadmapSection() {
    const generateBtn = document.getElementById("generate-roadmap-btn");
    const selectEl = document.getElementById("roadmap-target-select");

    // Read target from URL query param if present (?target=...)
    const params = new URLSearchParams(window.location.search);
    const targetParam = params.get("target") || localStorage.getItem("dron_target_career") || "Software Engineer";

    if (selectEl) {
        // Set select option matching target if exists
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value.toLowerCase() === targetParam.toLowerCase()) {
                selectEl.selectedIndex = i;
                break;
            }
        }

        selectEl.addEventListener("change", () => {
            generateRoadmap(selectEl.value);
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener("click", () => {
            const chosen = selectEl ? selectEl.value : targetParam;
            generateRoadmap(chosen);
        });
    }

    // Auto-generate on roadmap page
    const file = window.location.pathname.split("/").pop();
    if (file === "roadmap.html") {
        const chosen = selectEl ? selectEl.value : targetParam;
        generateRoadmap(chosen);
    }
}

document.addEventListener("DOMContentLoaded", initRoadmapSection);
