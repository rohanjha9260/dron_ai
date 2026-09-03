import { 
  UserCareerProfile, 
  ReadinessScoreBreakdown, 
  CareerRoleMatch, 
  SkillGapItem, 
  GitHubStats, 
  LeetCodeStats, 
  RoadmapPhase, 
  DailyPlanTask, 
  CareerTwinData,
  NotificationItem
} from '../types';

export const initialAmanProfile: UserCareerProfile = {
  id: 'usr_aman_2026',
  name: 'Aman',
  email: 'aman.developer@careerai.io',
  degree: 'B.Tech / B.E.',
  branch: 'Computer Science & Engineering',
  graduationYear: 2026,
  currentSemester: '6th Semester (3rd Year)',
  cgpa: 8.2,
  backlogs: 0,
  technicalSkills: [
    { name: 'Java', level: 'Advanced', category: 'Languages' },
    { name: 'JavaScript', level: 'Intermediate', category: 'Languages' },
    { name: 'C++', level: 'Intermediate', category: 'Languages' },
    { name: 'Python', level: 'Beginner', category: 'Languages' },
    { name: 'React', level: 'Intermediate', category: 'Frameworks' },
    { name: 'Node.js', level: 'Intermediate', category: 'Frameworks' },
    { name: 'Spring Boot', level: 'Beginner', category: 'Frameworks' },
    { name: 'SQL', level: 'Intermediate', category: 'Databases' },
    { name: 'PostgreSQL', level: 'Beginner', category: 'Databases' },
    { name: 'Git', level: 'Intermediate', category: 'Cloud & DevOps' },
    { name: 'Docker', level: 'Beginner', category: 'Cloud & DevOps' },
    { name: 'Data Structures & Algorithms', level: 'Intermediate', category: 'Core CS' },
    { name: 'Operating Systems', level: 'Intermediate', category: 'Core CS' },
    { name: 'DBMS', level: 'Intermediate', category: 'Core CS' }
  ],
  softSkills: {
    communication: 51,
    leadership: 64,
    teamwork: 78,
    problemSolving: 72,
    presentation: 55,
    confidence: 58
  },
  githubUsername: 'aman-codes-dev',
  leetCodeUsername: 'aman_algo_147',
  projects: [
    {
      id: 'proj_1',
      name: 'CloudSync — Real-Time Collaborative Canvas',
      description: 'Full-stack collaborative editor using WebSockets, React, Node.js, and Redis with live room presence.',
      technologies: ['React', 'Node.js', 'WebSockets', 'Redis', 'Tailwind CSS'],
      githubUrl: 'https://github.com/aman-codes-dev/cloudsync',
      liveUrl: 'https://cloudsync-live.vercel.app',
      role: 'Full Stack Developer',
      isCompleted: true
    },
    {
      id: 'proj_2',
      name: 'FinLedger Transaction Microservice',
      description: 'Java and Spring Boot REST API for processing banking ledger transactions with ACID transaction safety and SQL schema indexing.',
      technologies: ['Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'Docker'],
      githubUrl: 'https://github.com/aman-codes-dev/finledger-api',
      role: 'Backend Developer',
      isCompleted: true
    },
    {
      id: 'proj_3',
      name: 'Algorithm Pathfinding Visualizer',
      description: 'Interactive visualizer for Dijkstra, A*, BFS, and DFS graph traversal algorithms in TypeScript.',
      technologies: ['TypeScript', 'React', 'Canvas API'],
      githubUrl: 'https://github.com/aman-codes-dev/algo-visualizer',
      liveUrl: 'https://algo-viz-demo.vercel.app',
      role: 'Frontend Developer',
      isCompleted: true
    },
    {
      id: 'proj_4',
      name: 'Campus Placement Portal API',
      description: 'Role-based access system for college placement drives with automated resume parsing and company eligibility filters.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      githubUrl: 'https://github.com/aman-codes-dev/placement-portal',
      role: 'Backend Lead',
      isCompleted: true
    }
  ],
  certifications: [
    'Oracle Certified Associate Java SE 11 Programmer',
    'freeCodeCamp Back End Development and APIs'
  ],
  targetRole: 'Software Developer',
  createdAt: '2026-09-01T08:00:00Z'
};

export const initialAmanScores: ReadinessScoreBreakdown = {
  overall: 72,
  statusLabel: 'On Track',
  academic: 81,
  coding: 68,
  projects: 78,
  github: 74,
  technical: 76,
  softSkills: 55,
  interviewReadiness: 64
};

export const initialRoleMatches: CareerRoleMatch[] = [
  {
    id: 'role_swe',
    title: 'Software Developer',
    matchPercentage: 82,
    category: 'Product & Tech Firms',
    averageSalary: '₹14 - ₹24 LPA',
    whyMatches: [
      'Strong Java fundamentals and solid multi-tier project experience',
      'Consistent daily coding habits (147 LeetCode problems solved)',
      'Clean academic record with 8.2 CGPA and 0 active backlogs'
    ],
    currentStrengths: [
      'Object-Oriented Programming in Java',
      'Fullstack Web Architecture (React + Node.js)',
      'Database Schema Design & Git Version Control'
    ],
    missingSkills: [
      'Data Structures & Algorithms (Trees, Graphs & DP depth)',
      'Low-Level System Design (LLD & Concurrency)',
      'Verbal Communication & STAR Interview Articulation'
    ],
    preparationRequired: [
      'Solve 60+ Medium LeetCode problems focusing on Graphs & Dynamic Programming',
      'Study Gang-of-Four Design Patterns and implement a Rate Limiter LLD',
      'Practice 4+ behavioral mock interview sessions using STAR framework'
    ],
    estimatedWeeks: 12,
    estimatedPrepTime: '12–16 weeks'
  },
  {
    id: 'role_backend',
    title: 'Backend Developer',
    matchPercentage: 76,
    category: 'FinTech & Cloud Platforms',
    averageSalary: '₹12 - ₹22 LPA',
    whyMatches: [
      'Hands-on experience with Java Spring Boot and Node.js REST services',
      'Relational database querying and transaction safety knowledge',
      'Understanding of API security, JWT authentication, and Docker'
    ],
    currentStrengths: [
      'Java & Spring Boot REST API Architecture',
      'SQL Query Optimization & Database Transactions',
      'Microservice Containerization with Docker'
    ],
    missingSkills: [
      'Redis Distributed Caching & Message Queues (Kafka/RabbitMQ)',
      'Database Sharding & Connection Pool Tuning',
      'CI/CD Pipeline Automation with GitHub Actions'
    ],
    preparationRequired: [
      'Build a message-driven transaction pipeline with Redis pub/sub',
      'Deep dive into SQL Explain Plan query optimization',
      'Complete 20 advanced SQL interview queries'
    ],
    estimatedWeeks: 10,
    estimatedPrepTime: '10–14 weeks'
  },
  {
    id: 'role_frontend',
    title: 'Frontend Developer',
    matchPercentage: 69,
    category: 'SaaS & Web Platforms',
    averageSalary: '₹10 - ₹18 LPA',
    whyMatches: [
      'React and TypeScript component design intuition',
      'Experience deploying responsive, live production applications',
      'Good understanding of DOM event cycle and CSS Flex/Grid'
    ],
    currentStrengths: [
      'React Hook architecture and State Management',
      'Tailwind CSS & Responsive Design',
      'REST API Integration'
    ],
    missingSkills: [
      'Next.js 14 Server Components & SSR Optimization',
      'Web Vitals Performance & Tree-Shaking Audits',
      'End-to-End Automated Testing (Playwright / Cypress)'
    ],
    preparationRequired: [
      'Migrate a React client app to Next.js App Router',
      'Implement TanStack Query caching and optimistic UI updates',
      'Write end-to-end integration tests'
    ],
    estimatedWeeks: 8,
    estimatedPrepTime: '8–10 weeks'
  },
  {
    id: 'role_data_analyst',
    title: 'Data Analyst',
    matchPercentage: 61,
    category: 'Enterprise Analytics',
    averageSalary: '₹8 - ₹16 LPA',
    whyMatches: [
      'Solid academic GPA and analytical reasoning capabilities',
      'Intermediate SQL knowledge for querying datasets',
      'Python scripting basics'
    ],
    currentStrengths: [
      'SQL Aggregate Functions & Group By',
      'Data modeling and academic math background',
      'Logical problem-solving discipline'
    ],
    missingSkills: [
      'Advanced SQL Window Functions & CTEs',
      'Tableau / PowerBI Interactive Dashboards',
      'Python Pandas / NumPy statistical data processing'
    ],
    preparationRequired: [
      'Complete 50 complex SQL challenges on StrataScratch/LeetCode',
      'Build an exploratory analysis dashboard using Python Pandas and PowerBI'
    ],
    estimatedWeeks: 6,
    estimatedPrepTime: '6–8 weeks'
  },
  {
    id: 'role_devops',
    title: 'DevOps Engineer',
    matchPercentage: 54,
    category: 'Cloud Infrastructure & SRE',
    averageSalary: '₹12 - ₹24 LPA',
    whyMatches: [
      'Basic Docker familiarity and Linux command line comfort',
      'Git collaboration and version control etiquette'
    ],
    currentStrengths: [
      'Basic Docker containerization',
      'Git Branching & Pull Request Workflows',
      'Linux Shell Basics'
    ],
    missingSkills: [
      'Kubernetes Cluster Orchestration (Pods, Ingress, Helm)',
      'Infrastructure as Code (Terraform / Ansible)',
      'Cloud AWS Architecture (VPC, IAM, ECS, CloudWatch)'
    ],
    preparationRequired: [
      'Set up automated GitHub Actions CI/CD pipelines',
      'Deploy multi-container app on Kubernetes cluster locally using Minikube',
      'Earn AWS Cloud Practitioner certification'
    ],
    estimatedWeeks: 14,
    estimatedPrepTime: '14–18 weeks'
  }
];

export const initialSkillGaps: SkillGapItem[] = [
  {
    id: 'gap_1',
    skill: 'Communication & Verbal Articulation',
    category: 'Soft Skills',
    currentLevel: 48,
    targetLevel: 75,
    gap: 27,
    priority: 'Critical',
    recommendation: 'Spend 15 minutes daily explaining one coding problem aloud and structure answers using the STAR framework.',
    impactScore: 92
  },
  {
    id: 'gap_2',
    skill: 'System Design & Scalable Architecture',
    category: 'Core CS',
    currentLevel: 35,
    targetLevel: 65,
    gap: 30,
    priority: 'Critical',
    recommendation: 'Study Alex Xu System Design Volume 1. Learn LLD design patterns, caching, load balancing, and SQL vs NoSQL trade-offs.',
    impactScore: 88
  },
  {
    id: 'gap_3',
    skill: 'SQL & Database Indexing',
    category: 'Backend',
    currentLevel: 55,
    targetLevel: 75,
    gap: 20,
    priority: 'Critical',
    recommendation: 'Practice Window Functions, CTEs, B-Tree index lookup mechanisms, and database deadlock analysis.',
    impactScore: 84
  },
  {
    id: 'gap_4',
    skill: 'Data Structures & Algorithms (DSA)',
    category: 'Core CS',
    currentLevel: 62,
    targetLevel: 80,
    gap: 18,
    priority: 'High',
    recommendation: 'Target 2 Medium LeetCode problems daily focusing specifically on Binary Search, Trees, and Dynamic Programming.',
    impactScore: 80
  },
  {
    id: 'gap_5',
    skill: 'Git & GitHub Collaboration',
    category: 'DevOps',
    currentLevel: 72,
    targetLevel: 80,
    gap: 8,
    priority: 'Medium',
    recommendation: 'Upgrade project README files with architecture flowcharts, badges, API docs, and step-by-step setup guides.',
    impactScore: 65
  },
  {
    id: 'gap_6',
    skill: 'Java Core & Spring Boot Internals',
    category: 'Languages',
    currentLevel: 78,
    targetLevel: 85,
    gap: 7,
    priority: 'Medium',
    recommendation: 'Deepen understanding of Java Garbage Collection tuning, JVM memory model, and Spring Boot dependency injection lifecycles.',
    impactScore: 60
  }
];

export const initialGitHubStats: GitHubStats = {
  username: 'aman-codes-dev',
  repositoriesCount: 24,
  contributionsThisYear: 386,
  totalStars: 42,
  healthScore: 74,
  languages: [
    { name: 'Java', percentage: 42, color: '#b07219' },
    { name: 'JavaScript', percentage: 28, color: '#f1e05a' },
    { name: 'TypeScript', percentage: 16, color: '#3178c6' },
    { name: 'Python', percentage: 8, color: '#3572A5' },
    { name: 'C++', percentage: 6, color: '#f34b7d' }
  ],
  strengths: [
    'Consistent commit frequency across 386 annual contributions',
    'Diverse polyglot technology stack (Java, React, TypeScript, Node.js)',
    'Active maintenance of multiple deployed live demo projects'
  ],
  improvements: [
    'README documentation quality and architecture diagrams need enhancement',
    'More comprehensive unit tests and automated CI/CD action workflows',
    'Increase contributions to established public open-source repositories'
  ],
  recentActivityWeeks: [14, 18, 22, 19, 8, 26, 32, 44, 28, 20, 34, 28, 38, 46, 36, 52],
  recentRepos: [
    {
      name: 'cloudsync',
      description: 'Real-time collaborative canvas with WebSockets, Node.js and Redis synchronization.',
      stars: 24,
      language: 'JavaScript',
      updatedAt: '2 days ago'
    },
    {
      name: 'finledger-api',
      description: 'High-throughput double-entry banking transaction microservice in Java & Spring Boot.',
      stars: 12,
      language: 'Java',
      updatedAt: '5 days ago'
    },
    {
      name: 'algo-visualizer',
      description: 'Interactive pathfinding and sorting algorithm visualizer built with React & TypeScript.',
      stars: 6,
      language: 'TypeScript',
      updatedAt: '2 weeks ago'
    }
  ]
};

export const initialLeetCodeStats: LeetCodeStats = {
  username: 'aman_algo_147',
  totalSolved: 147,
  easy: 82,
  medium: 54,
  hard: 11,
  acceptanceRate: 68,
  consistencyRate: 76,
  rankingPercentile: 'Top 18%',
  topics: [
    { name: 'Arrays & Two Pointers', percentage: 85, solved: 42, total: 50 },
    { name: 'Strings & Hash Tables', percentage: 78, solved: 35, total: 45 },
    { name: 'Binary Search', percentage: 72, solved: 22, total: 30 },
    { name: 'Trees & BFS/DFS', percentage: 54, solved: 26, total: 48 },
    { name: 'Graphs & Disjoint Sets', percentage: 38, solved: 12, total: 32 },
    { name: 'Dynamic Programming', percentage: 31, solved: 10, total: 32 }
  ],
  todayChallenge: {
    title: 'LeetCode #33: Search in Rotated Sorted Array',
    difficulty: 'Medium',
    topic: 'Binary Search',
    description: 'Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1.'
  }
};

export const initialRoadmapPhases: RoadmapPhase[] = [
  {
    phaseNumber: 1,
    title: 'Foundations, DSA & SQL Sprint',
    daysSpan: 'Days 1 - 30',
    focusAreas: ['DSA Consistency', 'SQL Mastery', 'Communication Basics'],
    goals: [
      'Solve 40 targeted LeetCode Medium questions (Blind 75 checklist)',
      'Complete 20 advanced SQL query challenges',
      '15 minutes daily technical speaking practice'
    ],
    tasks: [
      { id: 't1_1', title: 'Solve 15 Binary Search & Sliding Window LeetCode Mediums', category: 'DSA', completed: true, timeEstimate: '10 hrs' },
      { id: 't1_2', title: 'Complete SQL Joins, Aggregations & Group By Mastery', category: 'Dev', completed: true, timeEstimate: '4 hrs' },
      { id: 't1_3', title: 'Record 5 behavioral STAR framework answers on camera', category: 'SoftSkills', completed: true, timeEstimate: '3 hrs' },
      { id: 't1_4', title: 'Master Trees: BFS, DFS, LCA and Path Sum (15 problems)', category: 'DSA', completed: false, timeEstimate: '8 hrs' },
      { id: 't1_5', title: 'Learn SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', category: 'Dev', completed: false, timeEstimate: '4 hrs' },
      { id: 't1_6', title: 'Audit and polish GitHub README for CloudSync project', category: 'Resume', completed: false, timeEstimate: '2 hrs' }
    ]
  },
  {
    phaseNumber: 2,
    title: 'Advanced DSA, Flagship Projects & GitHub',
    daysSpan: 'Days 31 - 60',
    focusAreas: ['Graphs & DP', 'Flagship Backend Features', 'GitHub Documentation'],
    goals: [
      'Build one flagship production-deployed feature set',
      'Improve GitHub README documentation and architecture charts',
      'Maintain 5+ green commits per week on active repos'
    ],
    tasks: [
      { id: 't2_1', title: 'Solve 20 Graph problems (Dijkstra, Topological Sort, Union Find)', category: 'DSA', completed: false, timeEstimate: '12 hrs' },
      { id: 't2_2', title: 'Implement Redis distributed caching layer in FinLedger API', category: 'Dev', completed: false, timeEstimate: '6 hrs' },
      { id: 't2_3', title: 'Solve 15 Dynamic Programming fundamentals (Knapsack, Subsequences)', category: 'DSA', completed: false, timeEstimate: '10 hrs' },
      { id: 't2_4', title: 'Add Dockerfile and CI/CD GitHub Action tests to projects', category: 'Dev', completed: false, timeEstimate: '4 hrs' },
      { id: 't2_5', title: 'Practice pair programming and code review discussions with peers', category: 'SoftSkills', completed: false, timeEstimate: '3 hrs' }
    ]
  },
  {
    phaseNumber: 3,
    title: 'Interview Preparation, Resume & Applications Blitz',
    daysSpan: 'Days 61 - 90',
    focusAreas: ['Mock Technical Interviews', 'System Design LLD', 'Referral Applications'],
    goals: [
      'Conduct 8 peer-to-peer mock interviews',
      'Optimize single-page ATS resume with tailored action verbs',
      'Apply to 50+ curated product companies with cold referrals'
    ],
    tasks: [
      { id: 't3_1', title: 'Complete 8 Full Mock Technical & System Design Interviews', category: 'Interview', completed: false, timeEstimate: '12 hrs' },
      { id: 't3_2', title: 'Revise Core CS: OS Concurrency, Deadlocks & DBMS Indexing', category: 'DSA', completed: false, timeEstimate: '6 hrs' },
      { id: 't3_3', title: 'Tailor resume bullets using Google XYZ format (Accomplished X as measured by Y by doing Z)', category: 'Resume', completed: false, timeEstimate: '3 hrs' },
      { id: 't3_4', title: 'Connect with 40+ senior software engineers on LinkedIn for referrals', category: 'Interview', completed: false, timeEstimate: '6 hrs' }
    ]
  }
];

export const initialDailyPlanTasks: DailyPlanTask[] = [
  { id: 'dp_1', title: 'Solve 2 DSA Medium problems on LeetCode (Binary Search & Trees)', category: 'DSA', timeEstimate: '1.5 hrs', completed: true },
  { id: 'dp_2', title: 'Practice SQL Window Functions for 30 minutes', category: 'SQL', timeEstimate: '30 mins', completed: true },
  { id: 'dp_3', title: 'Improve CloudSync GitHub README with architecture flowchart', category: 'GitHub', timeEstimate: '30 mins', completed: true },
  { id: 'dp_4', title: 'Practice communication for 15 minutes (Explain 1 solution aloud)', category: 'SoftSkills', timeEstimate: '15 mins', completed: false },
  { id: 'dp_5', title: 'Revise Java Multi-threading & ConcurrentHashMap concepts', category: 'Core CS', timeEstimate: '45 mins', completed: false }
];

export const initialCareerTwin: CareerTwinData = {
  level: 'Intermediate',
  bestCareer: 'Software Developer',
  strongestSkill: 'Java & OOP Architecture',
  biggestGap: 'Verbal Communication & STAR Articulation',
  codingStrength: 68,
  careerReadiness: 72,
  recommendedLearningStyle: 'Project-Based & Algorithmic Sprints',
  estimatedPreparation: '12–16 weeks',
  nextMilestone: '80% Career Readiness'
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Daily Action Plan Ready',
    description: 'You have 2 tasks remaining for today to stay on track for your 12-week target.',
    timestamp: '10 mins ago',
    type: 'info',
    read: false
  },
  {
    id: 'notif_2',
    title: 'LeetCode Streak Milestone',
    description: 'You reached 147 solved problems! Next milestone: 150 problems (+3 to unlock Tier-1 badge).',
    timestamp: '2 hours ago',
    type: 'success',
    read: false
  },
  {
    id: 'notif_3',
    title: 'Critical Skill Gap Alert',
    description: 'Communication score (51%) is your primary bottleneck for HR bar-raiser rounds.',
    timestamp: 'Yesterday',
    type: 'alert',
    read: true
  }
];
