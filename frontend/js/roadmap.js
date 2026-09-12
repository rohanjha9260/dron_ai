/**
 * Dron-AI Roadmap & Skill Gap Module
 *
 * Handles:
 *   - Calling /api/roadmap/generate for the selected career target
 *   - Rendering the Vector Subtraction skill gap table
 *   - Rendering the Phased Remediation Roadmap timeline with milestones & tasks
 */

const SKILL_DISPLAY_NAMES = {
    dsa_score: "DSA Mastery",
    python_prof: "Python Proficiency",
    cpp_prof: "C++ Proficiency",
    aiml_knowledge: "AI / ML Knowledge",
    total_commits: "GitHub Commit Activity",
    problems_solved: "LeetCode Practice",
    contest_rating: "Contest Rating",
    project_count: "Completed Projects",
    communication_score: "Communication & Soft Skills",
    internship_exp: "Internship Exposure",
};

let _activeRoadmapRequestId = 0;

/**
 * Generate and render personalized roadmap & skill gaps.
 * @param {string} targetCareer - The target career role (e.g. "Software Engineer")
 * @param {number} [requestId] - Optional monotonic request ID to prevent stale responses
 */
async function generateRoadmap(targetCareer, requestId) {
    const myRequestId = requestId ?? ++_activeRoadmapRequestId;
    _activeRoadmapRequestId = Math.max(_activeRoadmapRequestId, myRequestId);
    const timeline = document.getElementById("roadmap-timeline");
    const gapTbody = document.getElementById("gap-analysis-tbody");
    const gapBadge = document.getElementById("roadmap-gap-badge");

    if (timeline) {
        timeline.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">
                <span class="spinner" style="display: inline-block; width: 24px; height: 24px; border: 2px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
                <p style="margin-top: 10px; font-size: var(--font-size-sm);">Calculating skill gaps & generating learning roadmap for ${targetCareer}...</p>
            </div>
        `;
    }

    try {
        const data = await apiRequest("/roadmap/generate", {
            method: "POST",
            body: { target_career: targetCareer },
        });

        const skillGaps = data.skill_gaps || [];
        const roadmap = data.roadmap || [];

        // Guard against stale responses
        if (myRequestId !== _activeRoadmapRequestId) return;

        // 1. Update Gap Badge
        if (gapBadge) {
            if (skillGaps.length > 0) {
                gapBadge.className = "badge badge-warning";
                gapBadge.innerHTML = `<span class="badge-dot"></span> ${skillGaps.length} Weakness Gaps Identified`;
            } else {
                gapBadge.className = "badge badge-success";
                gapBadge.innerHTML = `<span class="badge-dot"></span> Profile Meets All Baseline Targets`;
            }
        }

        // 2. Render Skill Gap Analysis Table
        if (gapTbody) {
            gapTbody.innerHTML = "";

            if (skillGaps.length === 0) {
                gapTbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
                            No significant skill gaps detected for this role! Your profile exceeds baseline thresholds.
                        </td>
                    </tr>
                `;
            } else {
                skillGaps.forEach((item) => {
                    const skillKey = item.skill;
                    const label = SKILL_DISPLAY_NAMES[skillKey] || skillKey;
                    const currentVal = Number(item.current || 0);
                    const requiredVal = Number(item.required || 0);
                    const gapVal = Number(item.gap || 0);

                    // Clamp percentages for visual bars
                    const maxVal = Math.max(requiredVal, 100);
                    const currentPct = Math.min(100, Math.max(0, (currentVal / maxVal) * 100));
                    const requiredPct = Math.min(100, Math.max(0, (requiredVal / maxVal) * 100));

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${label}</strong></td>
                        <td>
                            <div style="font-size: 11px; margin-bottom: 4px; color: var(--color-text-secondary);">
                                ${currentVal.toFixed(0)} / ${requiredVal.toFixed(0)}
                            </div>
                            <div class="gap-bar-bg" style="position: relative; height: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                                <div class="gap-bar-current" style="width: ${currentPct}%; height: 100%; background: ${currentPct >= requiredPct ? "var(--color-success)" : "var(--color-primary-light)"}; border-radius: 4px;"></div>
                                <div class="gap-bar-required" style="position: absolute; left: ${requiredPct}%; top: 0; bottom: 0; width: 2px; background: #FFFFFF; opacity: 0.8;"></div>
                            </div>
                        </td>
                        <td><span class="badge badge-warning">-${gapVal.toFixed(0)} pts</span></td>
                    `;
                    gapTbody.appendChild(tr);
                });
            }
        }

        // 3. Render Phased Action Roadmap Timeline
        if (timeline) {
            timeline.innerHTML = "";

            if (roadmap.length === 0) {
                timeline.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
                        <p>No active remediation phases required. Focus on advanced elective projects and mock interviews!</p>
                    </div>
                `;
                return;
            }

            roadmap.forEach((phase, idx) => {
                const stepEl = document.createElement("div");
                stepEl.className = "timeline-step";

                const isFirst = idx === 0;
                const priorityClass = phase.priority === "high" ? "badge-warning" : "badge-info";

                const tasksListHtml = (phase.tasks || []).map((task, tIdx) => {
                    const taskId = `phase-${phase.phase}-task-${tIdx}`;
                    return `
                        <li class="task-item">
                            <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="${taskId}" class="task-checkbox" style="margin-top: 3px; accent-color: var(--color-primary);" onchange="toggleTaskCheckbox(this.closest('.task-item'))">
                                <span class="task-text">${task}</span>
                            </label>
                        </li>
                    `;
                }).join("");

                stepEl.innerHTML = `
                    <div class="timeline-node ${isFirst ? "" : ""}">
                        ${phase.phase}
                    </div>
                    <div class="step-header">
                        <div class="step-title-row">
                            <span class="badge badge-primary">Phase ${phase.phase}</span>
                            <span class="step-title">${phase.title}</span>
                        </div>
                        <span class="badge ${priorityClass}">${phase.duration} • ${phase.priority ? phase.priority.toUpperCase() : "NORMAL"}</span>
                    </div>
                    ${phase.milestone ? `<div style="font-size: 11px; color: var(--color-accent-light); margin-bottom: 8px; font-weight: 500;">🎯 Goal: ${phase.milestone}</div>` : ""}
                    <ul class="step-tasks-list">
                        ${tasksListHtml}
                    </ul>
                `;

                timeline.appendChild(stepEl);
            });
        }

    } catch (error) {
        console.error("Failed to generate roadmap:", error);
        // Guard against stale error responses
        if (myRequestId !== _activeRoadmapRequestId) return;
        if (timeline) {
            timeline.innerHTML = `<div style="padding: 1rem; color: var(--color-danger);">Failed to load roadmap: ${error.message}</div>`;
        }
        if (gapTbody) {
            gapTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-danger); padding: 1.5rem;">Failed to load skill gap data.</td></tr>`;
        }
        if (gapBadge) {
            gapBadge.className = "badge badge-danger";
            gapBadge.innerHTML = `<span class="badge-dot"></span> Analysis Failed`;
        }
    }
}

/**
 * Interactive helper for task checkboxes in roadmap.
 */
function toggleTaskCheckbox(itemEl) {
    if (!itemEl) return;
    itemEl.classList.toggle("checked");
    const checkSpan = itemEl.querySelector(".custom-checkbox");
    if (checkSpan) {
        checkSpan.textContent = itemEl.classList.contains("checked") ? "✓" : "";
    }
}
