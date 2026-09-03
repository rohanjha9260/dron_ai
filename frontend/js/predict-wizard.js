/* ==========================================================================
   FUTUREPREDICT AI - PREDICT ASSESSMENT WIZARD JS (Modular)
   ========================================================================== */

let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
  initWizard();
  initBacklogToggle();
  initRangeSliders();
});

function initWizard() {
  updateWizardUI();
}

function updateWizardUI() {
  // Update step cards
  for (let i = 1; i <= totalSteps; i++) {
    const card = document.getElementById(`stepCard${i}`);
    const node = document.getElementById(`stepNode${i}`);
    if (card) {
      if (i === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
    if (node) {
      if (i < currentStep) {
        node.classList.add('completed');
        node.classList.remove('active');
      } else if (i === currentStep) {
        node.classList.add('active');
        node.classList.remove('completed');
      } else {
        node.classList.remove('active', 'completed');
      }
    }
  }

  // Update track fill
  const trackFill = document.getElementById('stepperTrackFill');
  if (trackFill) {
    const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    trackFill.style.width = pct + '%';
  }

  window.scrollTo({ top: 150, behavior: 'smooth' });
}

function nextStep(step) {
  if (validateStep(step)) {
    if (step < totalSteps) {
      currentStep = step + 1;
      updateWizardUI();
    }
  }
}

function prevStep(step) {
  if (step > 1) {
    currentStep = step - 1;
    updateWizardUI();
  }
}

function validateStep(step) {
  if (step === 1) {
    const fullName = document.getElementById('candidateName').value.trim();
    const cgpa = parseFloat(document.getElementById('candidateCgpa').value);
    if (!fullName) {
      showToast('Please enter your full name', 'warning');
      return false;
    }
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      showToast('Please enter a valid CGPA between 0 and 10', 'warning');
      return false;
    }
  }
  return true;
}

function initBacklogToggle() {
  const backlogSelect = document.getElementById('hasBacklogsSelect');
  const backlogAlert = document.getElementById('backlogAlert');
  const backlogCountGroup = document.getElementById('backlogCountGroup');

  if (backlogSelect) {
    backlogSelect.addEventListener('change', () => {
      const val = parseInt(backlogSelect.value);
      if (val > 0) {
        if (backlogAlert) backlogAlert.classList.add('visible');
        if (backlogCountGroup) backlogCountGroup.style.display = 'block';
      } else {
        if (backlogAlert) backlogAlert.classList.remove('visible');
        if (backlogCountGroup) backlogCountGroup.style.display = 'none';
      }
    });
  }
}

function initRangeSliders() {
  const sliders = [
    { id: 'commSkillSlider', valId: 'commSkillVal' },
    { id: 'probSkillSlider', valId: 'probSkillVal' },
    { id: 'leadSkillSlider', valId: 'leadSkillVal' },
    { id: 'teamSkillSlider', valId: 'teamSkillVal' }
  ];

  sliders.forEach(s => {
    const slider = document.getElementById(s.id);
    const valSpan = document.getElementById(s.valId);
    if (slider && valSpan) {
      slider.addEventListener('input', () => {
        valSpan.innerText = slider.value + ' / 10';
      });
    }
  });

  // Calculate live total Leetcode on input
  const easyInput = document.getElementById('lcEasy');
  const medInput = document.getElementById('lcMedium');
  const hardInput = document.getElementById('lcHard');
  const totalDisplay = document.getElementById('lcTotalSolvedDisplay');

  function updateLcTotal() {
    const e = parseInt(easyInput?.value) || 0;
    const m = parseInt(medInput?.value) || 0;
    const h = parseInt(hardInput?.value) || 0;
    if (totalDisplay) {
      totalDisplay.innerText = e + m + h;
    }
  }

  [easyInput, medInput, hardInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateLcTotal);
  });
}

// Demo Presets Auto-filler
function loadDemoPreset(type) {
  if (type === 'maang_aspirant') {
    document.getElementById('candidateName').value = 'Rohan Sharma';
    document.getElementById('candidateCollege').value = 'Tier-2 Tech University';
    document.getElementById('candidateBranch').value = 'Computer Science & Engineering';
    document.getElementById('candidateCgpa').value = '8.8';
    document.getElementById('hasBacklogsSelect').value = '0';
    document.getElementById('targetRoleSelect').value = 'Software Development Engineer (SDE-1)';

    document.getElementById('lcEasy').value = '110';
    document.getElementById('lcMedium').value = '190';
    document.getElementById('lcHard').value = '45';
    document.getElementById('lcContestRating').value = '1840';

    document.getElementById('githubUsername').value = 'rohan-dev';
    document.getElementById('githubRepos').value = '12';
    document.getElementById('githubStars').value = '24';
    document.getElementById('deployedProjectsCount').value = '3';

    document.getElementById('commSkillSlider').value = '8';
    document.getElementById('commSkillVal').innerText = '8 / 10';
    document.getElementById('probSkillSlider').value = '9';
    document.getElementById('probSkillVal').innerText = '9 / 10';
    document.getElementById('leadSkillSlider').value = '7';
    document.getElementById('leadSkillVal').innerText = '7 / 10';
    document.getElementById('teamSkillSlider').value = '8';
    document.getElementById('teamSkillVal').innerText = '8 / 10';

    showToast('Loaded: High DSA & Strong Academic Profile', 'success');
  } else if (type === 'tier3_struggler') {
    document.getElementById('candidateName').value = 'Aman Verma';
    document.getElementById('candidateCollege').value = 'Tier-3 Engineering College';
    document.getElementById('candidateBranch').value = 'Information Technology';
    document.getElementById('candidateCgpa').value = '6.8';
    document.getElementById('hasBacklogsSelect').value = '1';
    document.getElementById('backlogCountGroup').style.display = 'block';
    document.getElementById('backlogAlert').classList.add('visible');
    document.getElementById('targetRoleSelect').value = 'Frontend Developer';

    document.getElementById('lcEasy').value = '40';
    document.getElementById('lcMedium').value = '15';
    document.getElementById('lcHard').value = '0';
    document.getElementById('lcContestRating').value = '1320';

    document.getElementById('githubUsername').value = 'aman-web';
    document.getElementById('githubRepos').value = '4';
    document.getElementById('githubStars').value = '2';
    document.getElementById('deployedProjectsCount').value = '1';

    document.getElementById('commSkillSlider').value = '5';
    document.getElementById('commSkillVal').innerText = '5 / 10';
    document.getElementById('probSkillSlider').value = '5';
    document.getElementById('probSkillVal').innerText = '5 / 10';
    document.getElementById('leadSkillSlider').value = '5';
    document.getElementById('leadSkillVal').innerText = '5 / 10';
    document.getElementById('teamSkillSlider').value = '6';
    document.getElementById('teamSkillVal').innerText = '6 / 10';

    showToast('Loaded: Tier-3 Profile with Backlog Challenge', 'warning');
  } else if (type === 'fullstack_builder') {
    document.getElementById('candidateName').value = 'Priya Patel';
    document.getElementById('candidateCollege').value = 'Autonomous Institute of Tech';
    document.getElementById('candidateBranch').value = 'Computer Science';
    document.getElementById('candidateCgpa').value = '7.9';
    document.getElementById('hasBacklogsSelect').value = '0';
    document.getElementById('targetRoleSelect').value = 'Fullstack Developer';

    document.getElementById('lcEasy').value = '80';
    document.getElementById('lcMedium').value = '70';
    document.getElementById('lcHard').value = '8';
    document.getElementById('lcContestRating').value = '1560';

    document.getElementById('githubUsername').value = 'priya-codes';
    document.getElementById('githubRepos').value = '18';
    document.getElementById('githubStars').value = '65';
    document.getElementById('deployedProjectsCount').value = '4';

    document.getElementById('commSkillSlider').value = '8.5';
    document.getElementById('commSkillVal').innerText = '8.5 / 10';
    document.getElementById('probSkillSlider').value = '7.5';
    document.getElementById('probSkillVal').innerText = '7.5 / 10';
    document.getElementById('leadSkillSlider').value = '8';
    document.getElementById('leadSkillVal').innerText = '8 / 10';
    document.getElementById('teamSkillSlider').value = '9';
    document.getElementById('teamSkillVal').innerText = '9 / 10';

    showToast('Loaded: Heavy Open-Source & Project Portfolio', 'success');
  }

  // Update easy/med/hard live count
  const easy = parseInt(document.getElementById('lcEasy').value) || 0;
  const med = parseInt(document.getElementById('lcMedium').value) || 0;
  const hard = parseInt(document.getElementById('lcHard').value) || 0;
  document.getElementById('lcTotalSolvedDisplay').innerText = easy + med + hard;
}

// Final Submit & AI Prediction Calculation
function submitAssessment() {
  const overlay = document.getElementById('aiProcessingOverlay');
  if (overlay) overlay.classList.add('active');

  const formData = {
    fullName: document.getElementById('candidateName').value.trim() || 'Candidate',
    college: document.getElementById('candidateCollege').value || 'Engineering College',
    branch: document.getElementById('candidateBranch').value || 'CSE',
    cgpa: document.getElementById('candidateCgpa').value || '7.5',
    backlogs: document.getElementById('hasBacklogsSelect').value || '0',
    targetRole: document.getElementById('targetRoleSelect').value || 'Software Engineer',
    lcEasy: document.getElementById('lcEasy').value || '50',
    lcMedium: document.getElementById('lcMedium').value || '40',
    lcHard: document.getElementById('lcHard').value || '5',
    lcRating: document.getElementById('lcContestRating').value || '1450',
    githubUsername: document.getElementById('githubUsername').value || 'dev',
    githubRepos: document.getElementById('githubRepos').value || '6',
    githubStars: document.getElementById('githubStars').value || '5',
    deployedProjects: document.getElementById('deployedProjectsCount').value || '2',
    commSkill: document.getElementById('commSkillSlider').value || '7',
    probSolving: document.getElementById('probSkillSlider').value || '7',
    leadership: document.getElementById('leadSkillSlider').value || '6',
    teamwork: document.getElementById('teamSkillSlider').value || '7'
  };

  // Run scoring heuristic via PredictEngine
  const predictionResult = PredictEngine.evaluateProfile(formData);
  
  // Store in LocalStorage for Dashboard page
  localStorage.setItem('futurepredict_last_result', JSON.stringify(predictionResult));

  // Cycle through futuristic AI analysis messages
  const statusEl = document.getElementById('aiScanStatusText');
  const subtextEl = document.getElementById('aiScanSubtext');

  setTimeout(() => {
    if (statusEl) statusEl.innerText = 'Analyzing LeetCode & DSA Difficulty Distribution...';
    if (subtextEl) subtextEl.innerText = 'Cross-referencing problem patterns with top tech recruitment benchmarks.';
  }, 900);

  setTimeout(() => {
    if (statusEl) statusEl.innerText = 'Evaluating Soft Skills & Reality Gap Bottlenecks...';
    if (subtextEl) subtextEl.innerText = 'Calculating daily required study hours and personalized 6-month roadmap.';
  }, 1800);

  setTimeout(() => {
    if (statusEl) statusEl.innerText = 'Prediction Complete! Generating Intelligence Report...';
    window.location.href = 'dashboard.html';
  }, 2700);
}

window.nextStep = nextStep;
window.prevStep = prevStep;
window.loadDemoPreset = loadDemoPreset;
window.submitAssessment = submitAssessment;
