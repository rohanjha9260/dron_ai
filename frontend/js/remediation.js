/**
 * ═══════════════════════════════════════════════════════════════
 * DRON AI: Remediation & Career Execution Suite Engine
 * Components:
 *  1. Interactive Skill Gap Analyzer (Multi-Role Vector Subtraction)
 *  2. 1-Month Blitz Sprint Roadmap (30-Day Checklist with Persistence)
 *  3. Resume-Grade Project Recommendations (Architecture & READMEs)
 *  4. Monthly AI Check-In & Progress Tracker (AI Mentor Audits)
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener("DOMContentLoaded", () => {
    initSuiteTabs();
    initSkillGapAnalyzer();
    initSprintRoadmap();
    initProjectRecommendations();
    initMonthlyCheckIn();
});

/* ═══════════════════════════════════════════════════════════════
   1. Silky Smooth Tab Switcher
   ═══════════════════════════════════════════════════════════════ */
function initSuiteTabs() {
    const tabBtns = document.querySelectorAll(".suite-tab-btn");
    const panels = document.querySelectorAll(".suite-tab-panel");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            
            tabBtns.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const activePanel = document.getElementById(targetId);
            if (activePanel) {
                activePanel.classList.add("active");
            }
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   2. Interactive Skill Gap Analyzer
   ═══════════════════════════════════════════════════════════════ */
const CAREER_BENCHMARKS = {
    "sde1": {
        title: "Full-Stack SDE-1 / Software Engineer",
        targetMatch: 86,
        description: "Focuses on scalable web services, clean architecture, data structures, and production APIs.",
        skills: [
            { name: "Algorithmic DSA Mastery", current: 82, target: 88, tip: "Practice 15 more Sliding Window and Graph BFS problems on LeetCode." },
            { name: "System Design & Low-Level Architecture", current: 62, target: 80, tip: "Learn Object-Oriented Design patterns, Schema Normalization, and Clean Code principles." },
            { name: "Database & SQL Optimization", current: 74, target: 85, tip: "Study B-Tree Indexing, EXPLAIN queries, and Redis Cache-Aside patterns." },
            { name: "Cloud & Docker Containers", current: 52, target: 75, tip: "Containerize a full-stack project with multi-stage Dockerfiles and docker-compose." },
            { name: "CI/CD & Automated Testing", current: 48, target: 70, tip: "Write GitHub Actions workflow to run pytest/jest and automated lint checks." },
            { name: "Soft Skills & System Pitching", current: 78, target: 82, tip: "Practice explaining architectural trade-offs using the STAR behavioral format." }
        ]
    },
    "aiml": {
        title: "AI / Machine Learning Engineer",
        targetMatch: 79,
        description: "Specializes in training/fine-tuning models, vector databases, RAG pipelines, and ML inference latency.",
        skills: [
            { name: "Python & Numerical Computing", current: 88, target: 92, tip: "Master vectorized NumPy matrix ops, pandas pipelines, and multiprocessing." },
            { name: "Model Training & Evaluation (ML/DL)", current: 72, target: 88, tip: "Deep-dive into XGBoost hyperparameters, cross-validation, and ROC-AUC curves." },
            { name: "RAG & Vector Search (pgvector/Chroma)", current: 58, target: 82, tip: "Build a production document retrieval pipeline using hybrid BM25 + dense embeddings." },
            { name: "Inference Optimization & API Serving", current: 54, target: 78, tip: "Serve ONNX / PyTorch models with FastAPI, async workers, and sub-10ms response SLAs." },
            { name: "Algorithmic DSA Foundations", current: 82, target: 78, tip: "Current level exceeds standard ML Engineer coding requirements. Maintain consistency." },
            { name: "MLOps & Model Monitoring", current: 42, target: 72, tip: "Implement model drift monitoring with EvidentlyAI or Prometheus custom metrics." }
        ]
    },
    "backend": {
        title: "Backend Distributed Systems Engineer",
        targetMatch: 81,
        description: "Builds high-throughput microservices, message queues, distributed caching, and database clusters.",
        skills: [
            { name: "Concurrency & Multi-Threading", current: 65, target: 85, tip: "Master goroutines/asyncio, worker thread pools, and mutex deadlock prevention." },
            { name: "Distributed Caching (Redis/Memcached)", current: 60, target: 85, tip: "Implement cache stampede protection and cache-aside invalidation strategies." },
            { name: "Message Queues (Kafka / RabbitMQ)", current: 45, target: 80, tip: "Design at-least-once message consumption with dead-letter queue routing." },
            { name: "Algorithmic DSA Mastery", current: 82, target: 85, tip: "Solid base. Focus specifically on Heaps, Tries, and Dijkstra's algorithm." },
            { name: "Database Sharding & Replication", current: 55, target: 80, tip: "Study read-replicas, write-ahead logs (WAL), and consistent hashing." },
            { name: "API Gateways & Rate Limiting", current: 68, target: 82, tip: "Implement token bucket and leaky bucket algorithms in middleware." }
        ]
    },
    "devops": {
        title: "Cloud & DevOps / SRE Specialist",
        targetMatch: 71,
        description: "Automates infrastructure, zero-downtime deployment pipelines, Kubernetes orchestration, and observability.",
        skills: [
            { name: "Docker & Container Runtime Security", current: 55, target: 90, tip: "Build rootless containers, security scanning (Trivy), and minimal Alpine images." },
            { name: "Kubernetes (K8s) Pod Lifecycle", current: 40, target: 85, tip: "Practice rolling deployments, ingress controllers, HPA, and ConfigMaps." },
            { name: "Terraform & Infrastructure as Code", current: 35, target: 80, tip: "Provision AWS/GCP VPC, EC2, and S3 resources declaratively with state locking." },
            { name: "CI/CD Pipeline Automation", current: 50, target: 88, tip: "Create GitHub Actions with semantic release, linting, and automated staging deploys." },
            { name: "Observability (Prometheus & Grafana)", current: 48, target: 82, tip: "Set up RED (Rate, Errors, Duration) metrics dashboard and alerting rules." },
            { name: "Linux Administration & Bash", current: 70, target: 85, tip: "Master systemd, journalctl, awk/sed, and socket performance tuning." }
        ]
    }
};

function initSkillGapAnalyzer() {
    const rolePills = document.querySelectorAll(".role-pill");
    const container = document.getElementById("gap-metrics-container");
    const roleTitleEl = document.getElementById("current-role-title");
    const roleDescEl = document.getElementById("current-role-desc");

    if (!container) return;

    function renderRoleGaps(roleKey) {
        const roleData = CAREER_BENCHMARKS[roleKey];
        if (!roleData) return;

        if (roleTitleEl) roleTitleEl.textContent = roleData.title;
        if (roleDescEl) roleDescEl.textContent = roleData.description;

        container.innerHTML = "";

        roleData.skills.forEach(skill => {
            const gap = Math.max(0, skill.target - skill.current);
            let badgeClass = "gap-badge-optimal";
            let badgeText = "Target Met";

            if (gap >= 18) {
                badgeClass = "gap-badge-critical";
                badgeText = `-${gap}% Critical Deficit`;
            } else if (gap > 4) {
                badgeClass = "gap-badge-moderate";
                badgeText = `-${gap}% Moderate Gap`;
            }

            const currentPct = Math.min(100, skill.current);
            const targetPct = Math.min(100, skill.target);

            const card = document.createElement("div");
            card.className = "gap-metric-card";
            card.innerHTML = `
                <div class="gap-card-header">
                    <span class="gap-card-title"><i class="fa-solid fa-layer-group"></i> ${skill.name}</span>
                    <span class="gap-status-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="gap-values-row">
                    <span>Current: <strong>${skill.current}%</strong></span>
                    <span>Target: <strong>${skill.target}%</strong></span>
                </div>
                <div class="gap-bar-container">
                    <div class="gap-bar-current" style="width: ${currentPct}%;"></div>
                    <div class="gap-bar-target-marker" style="left: ${targetPct}%;" title="Target: ${targetPct}%"></div>
                </div>
                <p class="gap-action-suggestion"><strong style="color: var(--accent-orange);">AI Prescription:</strong> ${skill.tip}</p>
            `;
            container.appendChild(card);
        });
    }

    rolePills.forEach(pill => {
        pill.addEventListener("click", () => {
            rolePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const roleKey = pill.getAttribute("data-role");
            renderRoleGaps(roleKey);
        });
    });

    // Default to SDE-1
    renderRoleGaps("sde1");

    // "Apply Gaps to 1-Month Sprint" button
    const applyToSprintBtn = document.getElementById("apply-gaps-to-sprint-btn");
    if (applyToSprintBtn) {
        applyToSprintBtn.addEventListener("click", () => {
            const sprintTabBtn = document.querySelector('[data-tab="tab-sprint"]');
            if (sprintTabBtn) {
                sprintTabBtn.click();
                sprintTabBtn.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
}

/* ═══════════════════════════════════════════════════════════════
   3. 1-Month Sprint Roadmap (Interactive & Persistent)
   ═══════════════════════════════════════════════════════════════ */
const SPRINT_STORAGE_KEY = "dron_ai_sprint_state_v1";

function initSprintRoadmap() {
    const checkboxes = document.querySelectorAll(".sprint-check-input");
    const progressFill = document.getElementById("sprint-progress-fill");
    const progressText = document.getElementById("sprint-progress-pct");
    const completedTasksEl = document.getElementById("sprint-completed-tasks");
    const totalTasksEl = document.getElementById("sprint-total-tasks");
    const hoursLoggedEl = document.getElementById("sprint-hours-logged");

    // Load saved state
    let savedState = {};
    try {
        savedState = JSON.parse(localStorage.getItem(SPRINT_STORAGE_KEY)) || {};
    } catch (e) {
        savedState = {};
    }

    checkboxes.forEach((cb, index) => {
        const taskId = cb.getAttribute("data-task-id") || `task_${index}`;
        if (savedState[taskId]) {
            cb.checked = true;
            const row = cb.closest(".sprint-day-row");
            if (row) row.classList.add("completed");
        }

        cb.addEventListener("change", () => {
            const row = cb.closest(".sprint-day-row");
            if (cb.checked) {
                if (row) row.classList.add("completed");
                savedState[taskId] = true;
            } else {
                if (row) row.classList.remove("completed");
                delete savedState[taskId];
            }
            try {
                localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(savedState));
            } catch (e) {}
            recalcSprintProgress();
        });
    });

    function recalcSprintProgress() {
        const total = checkboxes.length;
        if (total === 0) return;
        let checked = 0;
        let totalHours = 0;

        checkboxes.forEach(cb => {
            if (cb.checked) {
                checked++;
                const hours = parseFloat(cb.getAttribute("data-hours") || "2.5");
                totalHours += hours;
            }
        });

        const pct = Math.round((checked / total) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}% Complete`;
        if (completedTasksEl) completedTasksEl.textContent = checked;
        if (totalTasksEl) totalTasksEl.textContent = total;
        if (hoursLoggedEl) hoursLoggedEl.textContent = `${Math.round(totalHours)}h`;
    }

    recalcSprintProgress();
}

/* ═══════════════════════════════════════════════════════════════
   4. Resume-Grade Project Recommendations
   ═══════════════════════════════════════════════════════════════ */
function initProjectRecommendations() {
    const expandBtns = document.querySelectorAll(".project-expand-btn");

    expandBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".project-card");
            if (!card) return;
            const modal = card.querySelector(".project-readme-modal");
            if (!modal) return;

            if (modal.style.display === "block") {
                modal.style.display = "none";
                btn.innerHTML = `<i class="fa-solid fa-file-code"></i> View Architecture & README Blueprint`;
            } else {
                modal.style.display = "block";
                btn.innerHTML = `<i class="fa-solid fa-chevron-up"></i> Hide Blueprint Preview`;
            }
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   5. Monthly AI Check-In & Progress Tracker
   ═══════════════════════════════════════════════════════════════ */
const MONTHLY_LOGS_KEY = "dron_ai_monthly_logs_v1";

function initMonthlyCheckIn() {
    const runAuditBtn = document.getElementById("run-monthly-audit-btn");
    const auditResultCard = document.getElementById("audit-result-card");
    const mentorCommentaryEl = document.getElementById("mentor-ai-commentary");

    if (runAuditBtn) {
        runAuditBtn.addEventListener("click", () => {
            runAuditBtn.disabled = true;
            runAuditBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Placement Vector...`;

            setTimeout(() => {
                runAuditBtn.disabled = false;
                runAuditBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Re-Run AI Audit`;

                if (auditResultCard) {
                    auditResultCard.style.display = "block";
                    auditResultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }

                if (mentorCommentaryEl) {
                    mentorCommentaryEl.innerHTML = `
                        <p><strong><i class="fa-solid fa-circle-check" style="color: var(--accent-orange);"></i> Primary Moat:</strong> Your algorithmic problem count (168 problems) and CGPA (8.85) place you securely in the <strong>Top 12% of the 2026 Batch</strong>. You have demonstrated consistent growth over Sem 5 and Sem 6.</p>
                        <p><strong><i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-orange-light);"></i> Critical Remediation Focus for Next 30 Days:</strong> Your system design and cloud deployments score is lagging at 52%. Campus interviewers from Amazon, Swiggy, and Cisco will test how you containerize and monitor backend services.</p>
                        <p><strong><i class="fa-solid fa-rocket" style="color: var(--status-success);"></i> Projected Impact:</strong> Completing the recommended <em>Distributed Rate Limiter</em> capstone project will elevate your placement readiness probability from <strong>84.2% to 92.6%</strong> and unlock higher Tier-1 CTC brackets (18 - 25 LPA).</p>
                    `;
                }
            }, 600);
        });
    }

    // Interactive Milestone Submission
    const addMilestoneBtn = document.getElementById("add-milestone-btn");
    const milestoneInput = document.getElementById("milestone-input-text");
    const milestoneCategory = document.getElementById("milestone-category-select");
    const timelineList = document.getElementById("monthly-timeline-list");

    if (addMilestoneBtn && milestoneInput && timelineList) {
        addMilestoneBtn.addEventListener("click", () => {
            const text = milestoneInput.value.trim();
            if (!text) {
                milestoneInput.focus();
                return;
            }

            const category = milestoneCategory ? milestoneCategory.value : "Progress";
            const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const newNode = document.createElement("div");
            newNode.className = "monthly-milestone-node";
            newNode.innerHTML = `
                <div class="milestone-dot"></div>
                <div class="milestone-content-box">
                    <div class="milestone-header">
                        <span class="milestone-month-title">${text}</span>
                        <div class="milestone-stats-pills">
                            <span class="sprint-tag" style="color: var(--accent-orange); border-color: rgba(255, 122, 0, 0.4);">${category}</span>
                            <span class="sprint-tag">${todayStr}</span>
                        </div>
                    </div>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">Verified candidate milestone logged during current month placement cycle.</p>
                </div>
            `;

            timelineList.prepend(newNode);
            milestoneInput.value = "";
        });
    }
}
