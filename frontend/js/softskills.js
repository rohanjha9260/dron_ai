/**
 * DRON AI: Soft Skills & Communication Hub Controller
 * Manages:
 *   - Real-time Elevator Pitch NLP Analysis (Pacing WPM, Filler Words, Action Verbs)
 *   - Web Speech API Speech Recognition dictation
 *   - 5D Soft Skills Diagnostic & Chart.js Radar visualization
 *   - LocalStorage synchronization with student profile & placement readiness
 *   - Outreach & Referral Message Generator with dynamic template rendering
 *   - Workplace Situational Judgment Scenarios with recruiter feedback
 */

// ═══════════════════════════════════════════════════════════════
// 1. Elevator Pitch & Filler Word Speech Sandbox
// ═══════════════════════════════════════════════════════════════
const FILLER_WORDS = [
    "basically", "like", "you know", "actually", "honestly",
    "literally", "sort of", "kind of", "umm", "uhh", "um", "uh", "i mean"
];

const POWER_ACTION_VERBS = [
    "architected", "spearheaded", "optimized", "developed", "deployed",
    "engineered", "streamlined", "reduced", "scaled", "automated",
    "refactored", "collaborated", "orchestrated", "implemented", "resolved"
];

const SAMPLE_PITCH = `Hello, I'm Rohan Jha, a 6th-semester Computer Science undergraduate specializing in backend architecture and machine learning systems. Recently, I architected an intelligent student placement engine that synthesizes 13 multidimensional academic and coding metrics with sub-2 millisecond inference latency. I spearheaded the integration of XGBoost predictive models and engineered scalable REST APIs. I also automated test pipelines and collaborated with team members to resolve complex schema bottlenecks. I am excited to apply my practical engineering and problem-solving focus to high-throughput software development.`;

let speechRecognitionInstance = null;
let isDictating = false;

function initSpeechSandbox() {
    const pitchTextarea = document.getElementById("pitchInputText");
    const dictateBtn = document.getElementById("voiceDictateBtn");
    const micIcon = document.getElementById("micIcon");
    const dictateLabel = document.getElementById("dictateBtnLabel");
    const sampleBtn = document.getElementById("loadSamplePitchBtn");
    const analyzeBtn = document.getElementById("analyzePitchBtn");

    if (!pitchTextarea || !analyzeBtn) return;

    // Load sample pitch
    if (sampleBtn) {
        sampleBtn.addEventListener("click", () => {
            pitchTextarea.value = SAMPLE_PITCH;
            runPitchAnalysis();
        });
    }

    // Web Speech API initialization
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.continuous = true;
        speechRecognitionInstance.interimResults = true;
        speechRecognitionInstance.lang = "en-US";

        speechRecognitionInstance.onresult = (event) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                const currentVal = pitchTextarea.value.trim();
                pitchTextarea.value = (currentVal ? currentVal + " " : "") + finalTranscript.trim();
                runPitchAnalysis();
            }
        };

        speechRecognitionInstance.onerror = (err) => {
            console.warn("Speech recognition error:", err);
            stopDictation();
        };

        speechRecognitionInstance.onend = () => {
            stopDictation();
        };
    } else if (dictateBtn) {
        dictateBtn.title = "Web Speech API not supported in this browser. Please type or paste.";
        dictateBtn.style.opacity = "0.6";
    }

    function startDictation() {
        if (!speechRecognitionInstance) {
            alert("Your browser does not support the Web Speech API. You can still type your pitch to analyze it!");
            return;
        }
        try {
            speechRecognitionInstance.start();
            isDictating = true;
            if (micIcon) {
                micIcon.className = "fa-solid fa-stop text-danger";
            }
            if (dictateLabel) dictateLabel.textContent = "Stop Dictation";
            if (dictateBtn) dictateBtn.classList.add("recording-active");
        } catch (e) {
            console.error("Could not start speech recognition:", e);
        }
    }

    function stopDictation() {
        const wasDictating = isDictating;
        isDictating = false;
        if (speechRecognitionInstance && wasDictating) {
            try {
                speechRecognitionInstance.stop();
            } catch (e) {
                console.warn("Speech recognition already stopped:", e);
            }
        }
        if (micIcon) {
            micIcon.className = "fa-solid fa-microphone";
        }
        if (dictateLabel) dictateLabel.textContent = "Start Speech Input (Mic)";
        if (dictateBtn) dictateBtn.classList.remove("recording-active");
    }

    if (dictateBtn) {
        dictateBtn.addEventListener("click", () => {
            if (isDictating) {
                stopDictation();
            } else {
                startDictation();
            }
        });
    }

    analyzeBtn.addEventListener("click", runPitchAnalysis);
    pitchTextarea.addEventListener("input", debounce(runPitchAnalysis, 500));
}

function runPitchAnalysis() {
    const pitchTextarea = document.getElementById("pitchInputText");
    if (!pitchTextarea) return;

    const text = pitchTextarea.value.trim();
    const wordCountEl = document.getElementById("statWordCount");
    const pacingWpmEl = document.getElementById("statPacingWpm");
    const pacingVerdictEl = document.getElementById("statPacingVerdict");
    const fillerCountEl = document.getElementById("statFillerCount");
    const fillerVerdictEl = document.getElementById("statFillerVerdict");
    const powerCountEl = document.getElementById("statPowerCount");
    const powerVerdictEl = document.getElementById("statPowerVerdict");
    const feedbackTitle = document.getElementById("feedbackTitle");
    const feedbackBody = document.getElementById("feedbackBody");

    if (!text) {
        if (wordCountEl) wordCountEl.textContent = "0";
        if (pacingWpmEl) pacingWpmEl.textContent = "0 WPM";
        if (pacingVerdictEl) pacingVerdictEl.textContent = "Awaiting input";
        if (fillerCountEl) fillerCountEl.textContent = "0";
        if (fillerVerdictEl) fillerVerdictEl.textContent = "Target: < 2";
        if (powerCountEl) powerCountEl.textContent = "0";
        if (powerVerdictEl) powerVerdictEl.textContent = "Target: 4+";
        if (feedbackTitle) feedbackTitle.textContent = "Speech Assessment Ready";
        if (feedbackBody) feedbackBody.textContent = "Enter your response on the left and click 'Analyze Pitch Dynamics' to see your delivery velocity and filler word density.";
        return;
    }

    const words = text.toLowerCase().match(/\b[a-z0-9'-]+\b/g) || [];
    const totalWords = words.length;

    // Estimate speaking time: assume 140 WPM average delivery
    const minutes = totalWords / 140;
    const estimatedWpm = Math.round(totalWords / Math.max(0.2, (totalWords / 135))); // normalized speaking pace

    // Count fillers
    let detectedFillers = [];
    const lowerText = text.toLowerCase();
    FILLER_WORDS.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, "gi");
        const matches = lowerText.match(regex);
        if (matches) {
            detectedFillers.push({ word: filler, count: matches.length });
        }
    });

    const totalFillerCount = detectedFillers.reduce((acc, curr) => acc + curr.count, 0);

    // Count power verbs
    let detectedPower = [];
    POWER_ACTION_VERBS.forEach(verb => {
        const regex = new RegExp(`\\b${verb}\\b`, "gi");
        const matches = lowerText.match(regex);
        if (matches) {
            detectedPower.push(verb);
        }
    });

    // Update UI Stats
    if (wordCountEl) wordCountEl.textContent = `${totalWords}`;
    if (pacingWpmEl) pacingWpmEl.textContent = `~135 WPM`;

    if (pacingVerdictEl) {
        if (totalWords < 60) {
            pacingVerdictEl.textContent = "Too Brief (Expand on tech)";
            pacingVerdictEl.style.color = "var(--status-warning)";
        } else if (totalWords > 200) {
            pacingVerdictEl.textContent = "Too Long (Risk of rambling)";
            pacingVerdictEl.style.color = "var(--status-warning)";
        } else {
            pacingVerdictEl.textContent = "Ideal 60s Duration";
            pacingVerdictEl.style.color = "var(--status-success)";
        }
    }

    if (fillerCountEl) fillerCountEl.textContent = `${totalFillerCount}`;
    if (fillerVerdictEl) {
        if (totalFillerCount === 0) {
            fillerVerdictEl.textContent = "Spotless Delivery (0 fillers)";
            fillerVerdictEl.style.color = "var(--status-success)";
        } else if (totalFillerCount <= 2) {
            fillerVerdictEl.textContent = "Acceptable (< 2 fillers)";
            fillerVerdictEl.style.color = "var(--accent-cyan-light)";
        } else {
            fillerVerdictEl.textContent = `High Density (${totalFillerCount} fillers)`;
            fillerVerdictEl.style.color = "var(--status-danger)";
        }
    }

    if (powerCountEl) powerCountEl.textContent = `${detectedPower.length}`;
    if (powerVerdictEl) {
        if (detectedPower.length >= 4) {
            powerVerdictEl.textContent = "Strong Executive Impact";
            powerVerdictEl.style.color = "var(--status-success)";
        } else {
            powerVerdictEl.textContent = "Add more action verbs";
            powerVerdictEl.style.color = "var(--status-warning)";
        }
    }

    // Comprehensive Feedback
    if (feedbackTitle && feedbackBody) {
        let feedbackHTML = "";

        if (totalFillerCount > 2) {
            feedbackHTML += `⚠️ <strong>Filler Word Alert:</strong> We noticed you used filler phrases like <em>"${detectedFillers.map(f => f.word + ' (' + f.count + ')').join(', ')}"</em>. Replace these with deliberate 1-second pauses.<br><br>`;
        }

        if (detectedPower.length >= 3) {
            feedbackHTML += `🌟 <strong>Great Engineering Impact:</strong> High-value action verbs detected: <code>${detectedPower.join(', ')}</code>.<br><br>`;
        } else {
            feedbackHTML += `💡 <strong>Pro Tip:</strong> Strengthen your impact by using verbs like <em>architected, streamlined, deployed,</em> or <em>benchmarked</em> instead of passive phrases like "I worked on" or "we made".<br><br>`;
        }

        if (totalWords >= 80 && totalWords <= 170 && totalFillerCount <= 1) {
            feedbackTitle.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> Placement Ready: Excellent Verbal Delivery`;
            feedbackHTML += `Your pitch is punchy, well-paced, and concise. It fits naturally into the opening 60 seconds of a technical interview without losing recruiter attention.`;
        } else {
            feedbackTitle.innerHTML = `<i class="fa-solid fa-chart-line text-cyan"></i> Actionable Coaching Suggestions`;
        }

        feedbackBody.innerHTML = feedbackHTML;
    }
}

// ═══════════════════════════════════════════════════════════════
// 2. 5D Soft Skills Diagnostic & Chart.js Radar
// ═══════════════════════════════════════════════════════════════
let radarChartInstance = null;

function initSoftSkillsDiagnostic() {
    const sVerbal = document.getElementById("sliderVerbal");
    const sListening = document.getElementById("sliderListening");
    const sResilience = document.getElementById("sliderResilience");
    const sTeam = document.getElementById("sliderTeam");
    const sPresence = document.getElementById("sliderPresence");

    const vVerbal = document.getElementById("valVerbal");
    const vListening = document.getElementById("valListening");
    const vResilience = document.getElementById("valResilience");
    const vTeam = document.getElementById("valTeam");
    const vPresence = document.getElementById("valPresence");

    const saveBtn = document.getElementById("saveSoftSkillsBtn");
    const saveStatus = document.getElementById("saveStatusText");

    if (!sVerbal || !sListening) return;

    // Load initial values from localStorage profile if available
    try {
        const stored = localStorage.getItem("dron_student_profile");
        if (stored) {
            const profile = JSON.parse(stored);
            if (profile.softSkillsDiagnostic) {
                const diag = profile.softSkillsDiagnostic;
                sVerbal.value = diag.verbal || 78;
                sListening.value = diag.listening || 82;
                sResilience.value = diag.resilience || 70;
                sTeam.value = diag.team || 75;
                sPresence.value = diag.presence || 80;
            }
        }
    } catch (e) {
        console.warn("Could not load diagnostic data:", e);
    }

    function syncReadouts() {
        if (vVerbal) vVerbal.textContent = `${sVerbal.value}%`;
        if (vListening) vListening.textContent = `${sListening.value}%`;
        if (vResilience) vResilience.textContent = `${sResilience.value}%`;
        if (vTeam) vTeam.textContent = `${sTeam.value}%`;
        if (vPresence) vPresence.textContent = `${sPresence.value}%`;
    }

    syncReadouts();

    // Setup Radar Chart
    const canvas = document.getElementById("softSkillsRadarChart");
    if (canvas && typeof Chart !== "undefined") {
        const ctx = canvas.getContext("2d");
        radarChartInstance = new Chart(ctx, {
            type: "radar",
            data: {
                labels: [
                    "Verbal Articulation",
                    "Active Listening",
                    "Stress Resilience",
                    "Teamwork & Empathy",
                    "Executive Presence"
                ],
                datasets: [
                    {
                        label: "Your Skill Score",
                        data: [
                            parseInt(sVerbal.value),
                            parseInt(sListening.value),
                            parseInt(sResilience.value),
                            parseInt(sTeam.value),
                            parseInt(sPresence.value)
                        ],
                        backgroundColor: "rgba(255, 122, 0, 0.22)",
                        borderColor: "#ff7a00",
                        pointBackgroundColor: "#ff7a00",
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: "#ff7a00",
                        borderWidth: 2
                    },
                    {
                        label: "Campus Recruiter Benchmark",
                        data: [75, 80, 75, 80, 75],
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        borderColor: "rgba(255, 255, 255, 0.6)",
                        borderDash: [4, 4],
                        pointRadius: 0,
                        borderWidth: 1.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 20,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            display: false,
                            backdropColor: "transparent"
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.08)"
                        },
                        angleLines: {
                            color: "rgba(255, 255, 255, 0.08)"
                        },
                        pointLabels: {
                            color: "#ffffff",
                            font: {
                                size: 11,
                                family: "'Plus Jakarta Sans', sans-serif",
                                weight: "600"
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: "#ffffff",
                            font: {
                                size: 11,
                                family: "'Plus Jakarta Sans', sans-serif"
                            },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: "#161f30",
                        borderColor: "rgba(255, 122, 0, 0.4)",
                        borderWidth: 1,
                        titleColor: "#ff7a00",
                        bodyColor: "#ffffff"
                    }
                }
            }
        });
    }

    function updateRadarChart() {
        syncReadouts();
        if (radarChartInstance) {
            radarChartInstance.data.datasets[0].data = [
                parseInt(sVerbal.value),
                parseInt(sListening.value),
                parseInt(sResilience.value),
                parseInt(sTeam.value),
                parseInt(sPresence.value)
            ];
            radarChartInstance.update();
        }

        // Live calculation of average
        const avg = Math.round((
            parseInt(sVerbal.value) +
            parseInt(sListening.value) +
            parseInt(sResilience.value) +
            parseInt(sTeam.value) +
            parseInt(sPresence.value)
        ) / 5);

        const kpiComm = document.getElementById("kpi-comm-score");
        if (kpiComm) {
            kpiComm.textContent = `${avg}/100`;
        }
    }

    [sVerbal, sListening, sResilience, sTeam, sPresence].forEach(slider => {
        slider.addEventListener("input", updateRadarChart);
    });

    // Save & Sync button
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const avg = Math.round((
                parseInt(sVerbal.value) +
                parseInt(sListening.value) +
                parseInt(sResilience.value) +
                parseInt(sTeam.value) +
                parseInt(sPresence.value)
            ) / 5);

            try {
                let profile = {};
                const stored = localStorage.getItem("dron_student_profile");
                if (stored) profile = JSON.parse(stored);

                profile.softSkills = profile.softSkills || {};
                profile.softSkills.communication = avg;
                profile.softSkillsDiagnostic = {
                    verbal: parseInt(sVerbal.value),
                    listening: parseInt(sListening.value),
                    resilience: parseInt(sResilience.value),
                    team: parseInt(sTeam.value),
                    presence: parseInt(sPresence.value),
                    lastUpdated: new Date().toLocaleDateString()
                };

                localStorage.setItem("dron_student_profile", JSON.stringify(profile));

                if (saveStatus) {
                    saveStatus.innerHTML = `<i class="fa-solid fa-check text-success"></i> Saved! Communication score updated to <strong>${avg}/100</strong> across your platform.`;
                    saveStatus.style.color = "var(--status-success)";
                    setTimeout(() => {
                        saveStatus.innerHTML = "";
                    }, 4000);
                }
            } catch (err) {
                console.error("Could not save soft skills:", err);
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// 3. Cold Outreach & Referral Message Generator
// ═══════════════════════════════════════════════════════════════
const OUTREACH_TEMPLATES = {
    linkedin: (company, name, role, jobId) => 
`Hi ${name},

Hope you're having a productive week!

I noticed you're currently working as an engineer at ${company}. As a final-year CS undergrad from college who has been following ${company}'s recent technical scaling, I was deeply inspired by your engineering blog and team culture.

I recently built an automated ML guidance engine handling 13 quantitative feature vectors with sub-2ms latency, and solved 240+ problems on LeetCode. I am actively preparing for the ${role} opening (${jobId}).

Would you be open to reviewing my portfolio and considering me for an internal referral? I've attached my 1-page ATS-optimized resume for your convenience.

Thank you for your time and guidance!

Best regards,
Rohan Jha`,

    coldemail: (company, name, role, jobId) =>
`Subject: Application for ${role} (${jobId}) — Rohan Jha (B.Tech CSE)

Dear ${name},

I hope this email finds you well.

I am writing to express my strong enthusiasm for the ${role} opening at ${company}. Having reviewed ${company}'s tech stack, I observed a high emphasis on low-latency backend microservices and reliable data pipelines.

During my undergraduate engineering capstone:
• Developed high-throughput REST APIs achieving sub-2ms inference latency.
• Mastered Core CS fundamentals with 240+ solved LeetCode challenges (DSA / Graphs / DP).
• Deployed full-stack applications with robust Dockerized database architectures.

I would welcome the opportunity to discuss how my hands-on problem-solving and production-ready code practices can support ${company}'s upcoming roadmap.

Resume and GitHub: https://github.com/rohanjha9260

Sincerely,
Rohan Jha`,

    thankyou: (company, name, role, jobId) =>
`Subject: Thank You — Technical Interview for ${role} — Rohan Jha

Hi ${name},

Thank you very much for taking the time to speak with me today regarding the ${role} position at ${company}.

I truly enjoyed our discussion on B+ Tree storage internals and distributed cache trade-offs. The architectural challenges your team is solving around real-time concurrency reinforced my strong enthusiasm for joining ${company}.

Please let me know if you need any further code samples or academic transcripts from my end. I look forward to the next steps!

Warm regards,
Rohan Jha`,

    negotiate: (company, name, role, jobId) =>
`Subject: Offer Discussion & Clarification — ${role} — Rohan Jha

Dear ${name},

Thank you so much for extending the offer for the ${role} at ${company}! I am truly excited about the opportunity to contribute to the team.

Before formally signing the agreement, I wanted to review the compensation breakdown. Given the current cost-of-living adjustments and my hands-on experience shipping production-grade machine learning pipelines, is there any flexibility regarding the fixed base component or the first-year joining incentive?

I am eager to accept and begin onboarding smoothly, and I would love to explore what might be feasible.

Thank you again for your time and continued support!

Best regards,
Rohan Jha`
};

let activeOutreachTab = "linkedin";

function initOutreachGenerator() {
    const tabs = document.querySelectorAll(".outreach-tab-btn");
    const companyInput = document.getElementById("targetCompany");
    const nameInput = document.getElementById("recipientName");
    const roleInput = document.getElementById("targetRole");
    const jobIdInput = document.getElementById("jobId");
    const outputArea = document.getElementById("outreachGeneratedText");
    const copyBtn = document.getElementById("copyOutreachBtn");

    if (!companyInput || !outputArea) return;

    function renderOutreach() {
        const company = companyInput.value.trim() || "[Target Company]";
        const name = nameInput.value.trim() || "[Name]";
        const role = roleInput.value.trim() || "[Target Role]";
        const jobId = jobIdInput.value.trim() || "[Job ID]";

        const templateFn = OUTREACH_TEMPLATES[activeOutreachTab];
        if (templateFn) {
            outputArea.value = templateFn(company, name, role, jobId);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeOutreachTab = tab.getAttribute("data-tab");
            renderOutreach();
        });
    });

    [companyInput, nameInput, roleInput, jobIdInput].forEach(inp => {
        inp.addEventListener("input", renderOutreach);
    });

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (outputArea.value) {
                navigator.clipboard.writeText(outputArea.value).then(() => {
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fa-solid fa-check text-success"></i> <span>Copied!</span>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                });
            }
        });
    }

    // Initial render
    renderOutreach();
}

// ═══════════════════════════════════════════════════════════════
// 4. Situational Judgment Scenarios (Managerial Dilemmas)
// ═══════════════════════════════════════════════════════════════
const SCENARIOS_DATA = [
    {
        id: "sc-1",
        title: "Production Outage 15 Minutes Before a Client Demo",
        situation: "Your team has a critical product demo in 15 minutes. A teammate just merged a pull request without proper regression tests, crashing the staging server's payment webhook.",
        options: [
            {
                id: "opt-1a",
                text: "Immediately revert the offending commit to the last stable release, ping the demo lead that staging is restoring, and investigate the bug calmly after the demo.",
                isBest: true,
                badge: "Ideal Engineering Response",
                feedback: "Excellent! In production incidents, triage and rapid rollback always take precedence over finding blame or trying to live-patch untested code 10 minutes before a demo."
            },
            {
                id: "opt-1b",
                text: "Start editing the live server code directly via SSH in a hurry to fix the bug before the client logs in.",
                isBest: false,
                badge: "High Risk (Rookie Mistake)",
                feedback: "Dangerous! Live-patching unversioned code under time pressure frequently introduces secondary crashes with no rollback history."
            },
            {
                id: "opt-1c",
                text: "Call out your teammate in the group chat for pushing unverified code and tell the client the meeting must be cancelled.",
                isBest: false,
                badge: "Unacceptable Culture Red Flag",
                feedback: "Severe Red Flag. Blaming teammates publicly damages trust and displays zero crisis leadership."
            }
        ]
    },
    {
        id: "sc-2",
        title: "Teammate Taking Solitary Credit for a Joint Project",
        situation: "During an on-campus placement interview review, you notice a project partner presented your shared capstone project as if they solely architected the entire database and machine learning pipeline.",
        options: [
            {
                id: "opt-2a",
                text: "Interrupt them immediately in front of the professors or interviewers to correct the record.",
                isBest: false,
                badge: "Aggressive / Suboptimal",
                feedback: "Public interruption makes the entire team look dysfunctional and immature to the evaluation panel."
            },
            {
                id: "opt-2b",
                text: "When it is your turn to speak, positively highlight the collective architecture, specifically articulate the technical trade-offs you personally engineered, and show your Git commit logs objectively.",
                isBest: true,
                badge: "Mature Professional Response",
                feedback: "Top tier! Showing specific technical depth and verified GitHub commits proves ownership naturally without hostile confrontation."
            },
            {
                id: "opt-2c",
                text: "Stay completely quiet, feel bitter, and decide to never collaborate on projects again.",
                isBest: false,
                badge: "Passive / Self-Defeating",
                feedback: "Staying silent deprives you of deserved placement credit while failing to resolve the underlying team dynamic."
            }
        ]
    },
    {
        id: "sc-3",
        title: "Unrealistic Friday 6 PM Deployment Deadline",
        situation: "Your engineering lead requests a complex database migration to be deployed to production at 6:00 PM on Friday evening with minimal automated test coverage.",
        options: [
            {
                id: "opt-3a",
                text: "Push the deployment immediately without question to prove you are a compliant and hardworking junior engineer.",
                isBest: false,
                badge: "Poor Risk Judgment",
                feedback: "Deploying high-risk migrations on Friday evening with no test coverage is an industry anti-pattern that leads to weekend outages."
            },
            {
                id: "opt-3b",
                text: "Politely schedule a 5-minute sync with the lead. Highlight the rollback risks of Friday evening deployments, propose preparing the migration scripts in staging today, and deploying Monday morning when the full team is available to monitor.",
                isBest: true,
                badge: "Strategic Engineering Maturity",
                feedback: "Outstanding! Framing pushback around business risk, customer uptime, and proposing an actionable alternative demonstrates senior engineering judgment."
            },
            {
                id: "opt-3c",
                text: "Ignore the request and log off without saying anything until Monday.",
                isBest: false,
                badge: "Unprofessional Ghosting",
                feedback: "Ghosting your team without communicating constraints breaches basic workplace professionalism."
            }
        ]
    }
];

function initSituationalScenarios() {
    const container = document.getElementById("scenariosContainer");
    if (!container) return;

    const html = SCENARIOS_DATA.map((sc, scIdx) => {
        const optionsHtml = sc.options.map((opt, oIdx) => `
            <div class="scenario-option" data-sc="${sc.id}" data-opt="${opt.id}">
                <div class="option-radio-wrap">
                    <input type="radio" name="radio-${sc.id}" id="${opt.id}" class="scenario-radio">
                </div>
                <div class="option-content">
                    <label for="${opt.id}" class="option-label">${opt.text}</label>
                    <div class="option-feedback" id="feedback-${opt.id}" style="display: none;">
                        <span class="feedback-badge ${opt.isBest ? 'badge-ideal' : 'badge-suboptimal'}">${opt.badge}</span>
                        <p class="feedback-explanation">${opt.feedback}</p>
                    </div>
                </div>
            </div>
        `).join("");

        return `
            <div class="scenario-card" id="card-${sc.id}">
                <div class="scenario-header">
                    <span class="scenario-num">Dilemma 0${scIdx + 1}</span>
                    <h3 class="scenario-title">${sc.title}</h3>
                </div>
                <p class="scenario-situation">${sc.situation}</p>
                <div class="scenario-options-list">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = html;

    // Attach click listeners to options
    document.querySelectorAll(".scenario-option").forEach(optCard => {
        optCard.addEventListener("click", () => {
            const scId = optCard.getAttribute("data-sc");
            const optId = optCard.getAttribute("data-opt");
            const radio = optCard.querySelector(".scenario-radio");
            if (radio) radio.checked = true;

            // Hide all feedbacks for this scenario
            const parentCard = document.getElementById(`card-${scId}`);
            if (parentCard) {
                parentCard.querySelectorAll(".option-feedback").forEach(fb => fb.style.display = "none");
                parentCard.querySelectorAll(".scenario-option").forEach(o => o.classList.remove("selected"));
            }

            // Show clicked feedback
            optCard.classList.add("selected");
            const targetFeedback = document.getElementById(`feedback-${optId}`);
            if (targetFeedback) {
                targetFeedback.style.display = "block";
            }
        });
    });
}

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ═══════════════════════════════════════════════════════════════
// Master DOMContentLoaded Dispatcher
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    initSpeechSandbox();
    initSoftSkillsDiagnostic();
    initOutreachGenerator();
    initSituationalScenarios();
});
