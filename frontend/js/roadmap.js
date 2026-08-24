/**
 * Dron-AI Roadmap Module
 *
 * Handles:
 *   - Triggering personalized roadmap generation
 *   - Rendering the phased action plan timeline
 *   - Displaying skill gaps and improvement tasks
 */

/**
 * Generate a personalized roadmap for the selected career.
 * @param {string} targetCareer - The target career path
 */
async function generateRoadmap(targetCareer) {
    const timeline = document.getElementById("roadmap-timeline");

    timeline.innerHTML = `<p class="placeholder-text">Generating roadmap for ${targetCareer}...</p>`;

    try {
        const data = await apiRequest("/roadmap/generate", {
            method: "POST",
            body: { target_career: targetCareer },
        });

        // TODO: Render roadmap
        // 1. Clear placeholder
        // 2. For each phase, create a roadmap-phase element
        // 3. Show phase number, title, duration, and tasks
        timeline.innerHTML = "";

        const roadmap = data.roadmap || [];
        if (roadmap.length === 0) {
            timeline.innerHTML = `<p class="placeholder-text">No roadmap available</p>`;
            return;
        }

        roadmap.forEach((phase) => {
            const phaseEl = document.createElement("div");
            phaseEl.className = "roadmap-phase";

            const tasksHTML = phase.tasks
                .map((task) => `<li>${task}</li>`)
                .join("");

            phaseEl.innerHTML = `
                <div class="phase-header">
                    <span class="phase-number">Phase ${phase.phase}</span>
                    <span class="phase-duration">${phase.duration}</span>
                </div>
                <h3 class="phase-title">${phase.title}</h3>
                <ul class="phase-tasks">${tasksHTML}</ul>
            `;

            timeline.appendChild(phaseEl);
        });
    } catch (error) {
        timeline.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}
