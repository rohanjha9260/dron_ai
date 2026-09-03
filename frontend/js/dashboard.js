/* ==========================================================================
   FUTUREPREDICT AI - DASHBOARD RENDERER & ANALYTICS JS (Modular)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

function loadDashboardData() {
  const rawData = localStorage.getItem('futurepredict_last_result');
  let result;

  if (rawData) {
    try {
      result = JSON.parse(rawData);
    } catch (e) {
      console.error('Error parsing prediction data', e);
    }
  }

  // Fallback default sample prediction if opened directly
  if (!result) {
    result = PredictEngine.evaluateProfile({
      fullName: 'Dev Aspirant',
      targetRole: 'Fullstack SDE',
      collegeTier: 'Tier 2',
      cgpa: 7.8,
      backlogs: 0,
      lcEasy: 80,
      lcMedium: 110,
      lcHard: 15,
      githubRepos: 8,
      githubStars: 12,
      projectsCount: 3,
      commSkill: 7.5,
      probSolving: 8,
      leadership: 7,
      teamwork: 8
    });
  }

  renderCandidateBanner(result);
  renderCoreKPIs(result);
  renderCompanyTierOdds(result);
  renderEffortSection(result);
  renderBottlenecks(result);
  renderRoadmapTimeline(result);
  renderRadarChart(result);
  renderHolographicCard(result);
}

function renderCandidateBanner(res) {
  const nameEl = document.getElementById('dashCandidateName');
  const roleEl = document.getElementById('dashCandidateRole');
  const cgpaEl = document.getElementById('dashCgpaPill');
  const lcEl = document.getElementById('dashLcPill');
  const backlogEl = document.getElementById('dashBacklogPill');

  if (nameEl) nameEl.innerText = res.candidateName;
  if (roleEl) roleEl.innerText = res.targetRole;
  if (cgpaEl) cgpaEl.innerHTML = `CGPA: <strong>${res.cgpa}</strong>`;
  if (lcEl) lcEl.innerHTML = `LeetCode: <strong>${res.leetcodeSolved} Solved</strong>`;
  if (backlogEl) {
    if (res.backlogs > 0) {
      backlogEl.innerHTML = `Backlogs: <strong style="color: var(--rose);">${res.backlogs} Active</strong>`;
    } else {
      backlogEl.innerHTML = `Backlogs: <strong style="color: var(--emerald);">0 (Clean)</strong>`;
    }
  }
}

function renderCoreKPIs(res) {
  const overallEl = document.getElementById('kpiOverallScore');
  const dsaEl = document.getElementById('kpiDsaScore');
  const devEl = document.getElementById('kpiDevScore');
  const softEl = document.getElementById('kpiSoftScore');

  if (overallEl) animateValue(overallEl, 0, res.scores.overall, 1200, '%');
  if (dsaEl) animateValue(dsaEl, 0, res.scores.dsa, 1200, '%');
  if (devEl) animateValue(devEl, 0, res.scores.dev, 1200, '%');
  if (softEl) animateValue(softEl, 0, res.scores.soft, 1200, '%');
}

function renderCompanyTierOdds(res) {
  const t1Bar = document.getElementById('tier1Bar');
  const t1Pct = document.getElementById('tier1Pct');
  const t2Bar = document.getElementById('tier2Bar');
  const t2Pct = document.getElementById('tier2Pct');
  const t3Bar = document.getElementById('tier3Bar');
  const t3Pct = document.getElementById('tier3Pct');
  const servBar = document.getElementById('tierServBar');
  const servPct = document.getElementById('tierServPct');

  if (t1Bar && t1Pct) {
    t1Bar.style.width = res.tierOdds.tier1 + '%';
    t1Pct.innerText = res.tierOdds.tier1 + '%';
  }
  if (t2Bar && t2Pct) {
    t2Bar.style.width = res.tierOdds.tier2 + '%';
    t2Pct.innerText = res.tierOdds.tier2 + '%';
  }
  if (t3Bar && t3Pct) {
    t3Bar.style.width = res.tierOdds.tier3 + '%';
    t3Pct.innerText = res.tierOdds.tier3 + '%';
  }
  if (servBar && servPct) {
    servBar.style.width = res.tierOdds.service + '%';
    servPct.innerText = res.tierOdds.service + '%';
  }
}

function renderEffortSection(res) {
  const dailyHoursEl = document.getElementById('effortDailyHours');
  const prepMonthsEl = document.getElementById('effortPrepMonths');
  const targetLcEl = document.getElementById('effortTargetLc');

  if (dailyHoursEl) dailyHoursEl.innerText = res.effort.dailyHours + ' hrs/day';
  if (prepMonthsEl) prepMonthsEl.innerText = res.effort.months + ' Months Required';
  if (targetLcEl) targetLcEl.innerText = `+${res.effort.targetLc} Recommended`;

  const scheduleGrid = document.getElementById('dailyScheduleGrid');
  if (scheduleGrid && res.effort.dailySchedule) {
    scheduleGrid.innerHTML = res.effort.dailySchedule.map(s => `
      <div class="schedule-slot">
        <h5>${s.slot}</h5>
        <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${s.focus}</p>
        <p>${s.details}</p>
      </div>
    `).join('');
  }
}

function renderBottlenecks(res) {
  const list = document.getElementById('bottlenecksList');
  if (!list) return;

  list.innerHTML = res.bottlenecks.map(b => `
    <div class="gap-item-card ${b.severity}">
      <div class="gap-icon">${b.icon}</div>
      <div class="gap-content">
        <h5>${b.title}</h5>
        <p>${b.desc}</p>
      </div>
    </div>
  `).join('');
}

function renderRoadmapTimeline(res) {
  const timeline = document.getElementById('roadmapTimeline');
  if (!timeline) return;

  timeline.innerHTML = res.roadmap.map(phase => `
    <div class="timeline-phase">
      <div class="timeline-node-dot"></div>
      <div class="phase-content">
        <div class="phase-header">
          <h4 style="font-size: 1.05rem; font-weight: 700;">${phase.title}</h4>
          <span class="phase-month-badge">${phase.month}</span>
        </div>
        <ul class="phase-tasks-list">
          ${phase.tasks.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function renderRadarChart(res) {
  const ctx = document.getElementById('skillsRadarCanvas');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['DSA & LeetCode', 'Development & Projects', 'Soft Skills & Comm', 'Academic Standing', 'System Design', 'Consistency Streak'],
      datasets: [{
        label: 'Candidate Readiness Level',
        data: [
          res.scores.dsa,
          res.scores.dev,
          res.scores.soft,
          res.scores.academic,
          Math.min(95, Math.round(res.scores.dsa * 0.85)),
          Math.min(98, Math.round((res.scores.dsa + res.scores.dev) / 2))
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06b6d4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: {
            color: '#94a3b8',
            font: { size: 11, family: 'Plus Jakarta Sans' }
          },
          ticks: {
            backdropColor: 'transparent',
            color: '#64748b',
            stepSize: 20
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderHolographicCard(res) {
  const cardName = document.getElementById('passCardName');
  const cardRole = document.getElementById('passCardRole');
  const cardScore = document.getElementById('passCardScore');
  const cardId = document.getElementById('passCardId');

  if (cardName) cardName.innerText = res.candidateName;
  if (cardRole) cardRole.innerText = res.targetRole;
  if (cardScore) cardScore.innerText = res.scores.overall + '%';
  if (cardId) cardId.innerText = 'FP-' + Math.floor(100000 + Math.random() * 900000);
}

function animateValue(el, start, end, duration, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    el.innerText = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Print / Export Career Report
function exportCareerPass() {
  window.print();
}

window.exportCareerPass = exportCareerPass;
