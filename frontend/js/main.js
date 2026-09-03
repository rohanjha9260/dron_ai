/* ==========================================================================
   FUTUREPREDICT AI - MAIN APP JS (Modular for Landing & General UI)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLandingSimulator();
  initCounters();
});

// Navbar scroll & Mobile Menu
function initNavbar() {
  const navbar = document.querySelector('.header-navbar');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggleBtn.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });
  }
}

// Landing Page Live Simulator
function initLandingSimulator() {
  const simCgpa = document.getElementById('simCgpaSlider');
  const simLc = document.getElementById('simLcSlider');
  const simProjects = document.getElementById('simProjectsSlider');
  const simSoft = document.getElementById('simSoftSlider');

  const simCgpaVal = document.getElementById('simCgpaVal');
  const simLcVal = document.getElementById('simLcVal');
  const simProjectsVal = document.getElementById('simProjectsVal');
  const simSoftVal = document.getElementById('simSoftVal');

  const simPctNum = document.getElementById('simPctNum');
  const simRoleTitle = document.getElementById('simRoleTitle');
  const simEffortTag = document.getElementById('simEffortTag');

  function updateLiveOdds() {
    if (!simCgpa) return;

    const cgpa = parseFloat(simCgpa.value) || 7.5;
    const lc = parseInt(simLc.value) || 120;
    const proj = parseInt(simProjects.value) || 2;
    const soft = parseInt(simSoft.value) || 7;

    if (simCgpaVal) simCgpaVal.innerText = cgpa.toFixed(1);
    if (simLcVal) simLcVal.innerText = lc + ' Solved';
    if (simProjectsVal) simProjectsVal.innerText = proj + ' Repos';
    if (simSoftVal) simSoftVal.innerText = soft + ' / 10';

    // Calculate dynamic readiness score
    const dsaPct = Math.min(100, Math.round((lc / 350) * 100));
    const acadPct = Math.round((cgpa / 10) * 100);
    const devPct = Math.min(100, proj * 18);
    const softPct = soft * 10;

    const overall = Math.round((dsaPct * 0.35) + (devPct * 0.25) + (softPct * 0.20) + (acadPct * 0.20));

    if (simPctNum) simPctNum.innerText = overall + '%';

    if (simRoleTitle && simEffortTag) {
      if (overall >= 80) {
        simRoleTitle.innerText = 'MAANG & Tier-1 Product Ready';
        simRoleTitle.style.color = '#10b981';
        simEffortTag.innerText = '⚡ Effort: ~1.5 hrs/day polish & Mock Interviews';
      } else if (overall >= 60) {
        simRoleTitle.innerText = 'Product Unicorn & FinTech SDE';
        simRoleTitle.style.color = '#06b6d4';
        simEffortTag.innerText = '🚀 Effort: ~3.5 hrs/day for 3-4 months';
      } else if (overall >= 40) {
        simRoleTitle.innerText = 'Growth Tech Startup & Mid-Market';
        simRoleTitle.style.color = '#f59e0b';
        simEffortTag.innerText = '⏳ Effort: ~4.5 hrs/day for 5-6 months';
      } else {
        simRoleTitle.innerText = 'Foundational Training Required';
        simRoleTitle.style.color = '#f43f5e';
        simEffortTag.innerText = '🛠️ Effort: 5+ hrs/day structured roadmap';
      }
    }
  }

  [simCgpa, simLc, simProjects, simSoft].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', updateLiveOdds);
    }
  });

  updateLiveOdds();
}

// Animated Statistics Counter on Viewport enter
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-counter');
  if (statNumbers.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target') || '0');
        let current = 0;
        const duration = 1500;
        const stepTime = 20;
        const increment = target / (duration / stepTime);

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            entry.target.innerText = target.toLocaleString() + '+';
            clearInterval(timer);
          } else {
            entry.target.innerText = Math.floor(current).toLocaleString();
          }
        }, stepTime);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}
