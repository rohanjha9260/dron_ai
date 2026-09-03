/* ==========================================================================
   FUTUREPREDICT AI - PREDICTION ENGINE ALGORITHMS (Scoring Heuristics)
   ========================================================================== */

const PredictEngine = {
  /**
   * Evaluates the candidate's holistic profile
   * @param {Object} data Assessment form submission
   * @returns {Object} Comprehensive prediction outcome
   */
  evaluateProfile(data) {
    const cgpa = parseFloat(data.cgpa) || 7.0;
    const backlogs = parseInt(data.backlogs) || 0;
    const leetcodeSolved = (parseInt(data.lcEasy) || 0) + (parseInt(data.lcMedium) || 0) + (parseInt(data.lcHard) || 0) || parseInt(data.totalLeetCode) || 120;
    const lcMedium = parseInt(data.lcMedium) || Math.round(leetcodeSolved * 0.5);
    const lcHard = parseInt(data.lcHard) || Math.round(leetcodeSolved * 0.1);
    const githubRepos = parseInt(data.githubRepos) || 4;
    const githubStars = parseInt(data.githubStars) || 2;
    const projectsCount = parseInt(data.projectsCount) || 2;
    
    // Soft skills ratings out of 10
    const commSkill = parseFloat(data.commSkill) || 7;
    const probSolving = parseFloat(data.probSolving) || 7;
    const leadership = parseFloat(data.leadership) || 6;
    const teamwork = parseFloat(data.teamwork) || 7;
    const avgSoftSkill = (commSkill + probSolving + leadership + teamwork) / 4;

    const targetRole = data.targetRole || 'Fullstack Developer';
    const collegeTier = data.collegeTier || 'Tier 2';

    // 1. Academic Score (0 - 100)
    let academicScore = (cgpa / 10) * 100;
    if (backlogs > 0) {
      academicScore -= (backlogs * 18);
    }
    academicScore = Math.max(10, Math.min(100, academicScore));

    // 2. DSA / Problem Solving Score (0 - 100)
    let dsaScore = 0;
    if (leetcodeSolved < 50) dsaScore = 25 + (leetcodeSolved * 0.5);
    else if (leetcodeSolved < 150) dsaScore = 50 + ((leetcodeSolved - 50) * 0.25);
    else if (leetcodeSolved < 350) dsaScore = 75 + ((leetcodeSolved - 150) * 0.1);
    else dsaScore = 95 + Math.min(5, (leetcodeSolved - 350) * 0.02);

    // Boost for hard/medium ratio
    if (lcHard > 30) dsaScore = Math.min(100, dsaScore + 8);
    if (lcMedium > 100) dsaScore = Math.min(100, dsaScore + 5);

    // 3. Dev & Project Score (0 - 100)
    let devScore = Math.min(100, (projectsCount * 18) + (githubRepos * 4) + (githubStars * 3));
    if (data.deployedProjects && data.deployedProjects > 0) {
      devScore = Math.min(100, devScore + 15);
    }

    // 4. Soft Skills Score (0 - 100)
    let softScore = avgSoftSkill * 10;

    // Overall Readiness Index (Weighted: 30% DSA, 25% Dev, 20% Soft, 25% Academics)
    let overallReadiness = Math.round(
      (dsaScore * 0.35) + (devScore * 0.25) + (softScore * 0.20) + (academicScore * 0.20)
    );

    // Company Tier Probabilities
    // Tier 1: MAANG / Uber / Atlassian / Microsoft / Google / Top FinTech
    let tier1Odds = Math.round((dsaScore * 0.45) + (devScore * 0.25) + (softScore * 0.2) + (academicScore * 0.1));
    if (backlogs > 0) tier1Odds = Math.max(5, tier1Odds - (backlogs * 25));
    if (cgpa < 7.5) tier1Odds = Math.max(5, tier1Odds - 15);
    if (leetcodeSolved < 250) tier1Odds = Math.min(45, tier1Odds);

    // Tier 2: Product Unicorns (Swiggy, Zomato, Razorpay, CRED, Meesho, Postman)
    let tier2Odds = Math.round((dsaScore * 0.35) + (devScore * 0.35) + (softScore * 0.15) + (academicScore * 0.15));
    if (backlogs > 0) tier2Odds = Math.max(10, tier2Odds - (backlogs * 15));

    // Tier 3: Growth Startups & Mid-Market Tech
    let tier3Odds = Math.round((devScore * 0.45) + (softScore * 0.3) + (dsaScore * 0.25));

    // Service / IT Consulting (TCS, Infosys, Wipro, Accenture, Cognizant)
    let serviceOdds = Math.round((academicScore * 0.4) + (softScore * 0.35) + (dsaScore * 0.25));
    if (backlogs > 0) serviceOdds = Math.max(20, serviceOdds - (backlogs * 20));

    // Effort Required Estimator ("Kitna Mehnat Karna Padega")
    let effortHoursPerDay = 2;
    let preparationMonths = 3;
    let targetLcCount = 300;
    
    if (overallReadiness < 40) {
      effortHoursPerDay = 5.5;
      preparationMonths = 6;
      targetLcCount = 350;
    } else if (overallReadiness < 65) {
      effortHoursPerDay = 4.0;
      preparationMonths = 4;
      targetLcCount = 280;
    } else if (overallReadiness < 80) {
      effortHoursPerDay = 2.5;
      preparationMonths = 2;
      targetLcCount = 200;
    } else {
      effortHoursPerDay = 1.5;
      preparationMonths = 1;
      targetLcCount = 100;
    }

    // Gap Analysis & Critical Bottlenecks
    const bottlenecks = [];
    
    if (backlogs > 0) {
      bottlenecks.push({
        severity: 'critical',
        icon: '⚠️',
        title: `Active Backlogs Detected (${backlogs})`,
        desc: '70% MNC campus drives have a strict zero active backlog policy. Priority #1 is clearing backlogs in upcoming semester exams.'
      });
    }

    if (cgpa < 7.0) {
      bottlenecks.push({
        severity: 'critical',
        icon: '📉',
        title: `CGPA (${cgpa}) Below Standard Shortlist Filter`,
        desc: 'Many Tier-1 & Tier-2 companies filter applicants at 7.0 or 7.5 CGPA. Overcome this via off-campus open source, hackathons, and cold outreach.'
      });
    }

    if (leetcodeSolved < 180) {
      bottlenecks.push({
        severity: 'warning',
        icon: '💻',
        title: `DSA Practice Deficit (${leetcodeSolved} Solved)`,
        desc: `Target is at least ${targetLcCount} quality questions (focusing on Trees, DP, Graphs, and Heaps) to crack Tier-1 technical coding rounds.`
      });
    }

    if (commSkill < 6.5) {
      bottlenecks.push({
        severity: 'warning',
        icon: '🗣️',
        title: 'Communication & Behavioral Round Risk',
        desc: 'Communication score indicates difficulty in articulating system architecture and behavioral STAR framework answers. Daily mock interviews recommended.'
      });
    }

    if (devScore < 50) {
      bottlenecks.push({
        severity: 'warning',
        icon: '🚀',
        title: 'Need High-Impact Full-Stack Project',
        desc: 'Profile lacks production-deployed projects with authentication, database indexing, and CI/CD pipelines.'
      });
    }

    if (bottlenecks.length === 0) {
      bottlenecks.push({
        severity: 'good',
        icon: '🌟',
        title: 'Strong Well-Balanced Profile',
        desc: 'Your profile has high potential for Tier-1 Product roles. Focus on System Design, advanced mock interviews, and high-quality referrals.'
      });
    }

    // Daily Schedule Recommendation
    const dailySchedule = [
      {
        slot: 'Morning (1.5 hrs)',
        focus: 'DSA & Algorithms',
        details: 'Solve 2 Medium LC problems + Review past mistake notes'
      },
      {
        slot: 'Evening (1.5 - 2 hrs)',
        focus: 'Development & Projects',
        details: 'Build full-stack microservice / write tests & deploy'
      },
      {
        slot: 'Night (30 - 45 mins)',
        focus: 'CS Fundamentals & Soft Skills',
        details: 'OS, DBMS, System Design audio podcasts & English speaking drills'
      }
    ];

    // 6-Month Actionable Roadmap
    const roadmapPhases = [
      {
        month: 'Month 1 - 2',
        title: 'Core Foundations & DSA Sprint',
        tasks: [
          'Master Arrays, HashMaps, Two Pointers, LinkedLists & Recursion',
          'Solve 80+ standard Blind 75 LeetCode problems',
          'Review Core CS: OS memory management, indexing in DBMS'
        ]
      },
      {
        month: 'Month 3 - 4',
        title: 'Advanced DSA & Full-Stack Capstone Project',
        tasks: [
          'Conquer Trees, Graphs, Dynamic Programming & Backtracking',
          'Build & Deploy 1 flagship full-stack application with auth & caching (Redis/Postgres)',
          'Write comprehensive documentation and record a 2-minute Loom demo'
        ]
      },
      {
        month: 'Month 5 - 6',
        title: 'Mock Interviews, System Design & Placement Blitz',
        tasks: [
          'Conduct 10+ P2P mock technical interviews on Pramp/Interviewing.io',
          'Optimize LinkedIn & GitHub with live demo badges',
          'Apply with tailored resumes and reach out to 50+ senior engineers for referrals'
        ]
      }
    ];

    return {
      candidateName: data.fullName || 'Candidate',
      targetRole,
      collegeTier,
      cgpa,
      backlogs,
      leetcodeSolved,
      projectsCount,
      scores: {
        academic: Math.round(academicScore),
        dsa: Math.round(dsaScore),
        dev: Math.round(devScore),
        soft: Math.round(softScore),
        overall: overallReadiness
      },
      tierOdds: {
        tier1: Math.min(98, Math.max(5, tier1Odds)),
        tier2: Math.min(98, Math.max(10, tier2Odds)),
        tier3: Math.min(99, Math.max(20, tier3Odds)),
        service: Math.min(99, Math.max(15, serviceOdds))
      },
      effort: {
        dailyHours: effortHoursPerDay,
        months: preparationMonths,
        targetLc: targetLcCount,
        dailySchedule
      },
      bottlenecks,
      roadmap: roadmapPhases
    };
  }
};

window.PredictEngine = PredictEngine;
