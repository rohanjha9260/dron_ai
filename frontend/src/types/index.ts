export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TechnicalSkill {
  name: string;
  level: SkillLevel;
  category: 'Languages' | 'Frameworks' | 'Databases' | 'Cloud & DevOps' | 'Core CS';
}

export interface SoftSkillsProfile {
  communication: number;
  leadership: number;
  teamwork: number;
  problemSolving: number;
  presentation: number;
  confidence: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  role: string;
  isCompleted: boolean;
}

export interface UserCareerProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  branch: string;
  graduationYear: number;
  currentSemester: string;
  cgpa: number;
  backlogs: number;
  technicalSkills: TechnicalSkill[];
  softSkills: SoftSkillsProfile;
  githubUsername: string;
  leetCodeUsername: string;
  projects: ProjectItem[];
  certifications: string[];
  targetRole: string; // or 'Not sure yet'
  createdAt: string;
}

export interface ReadinessScoreBreakdown {
  overall: number; // e.g. 72
  statusLabel: 'Critical' | 'Needs Improvement' | 'On Track' | 'Industry Ready' | 'Top 5% Elite';
  academic: number; // 81
  coding: number; // 68
  projects: number; // 78
  github: number; // 74
  technical: number; // 76
  softSkills: number; // 55
  interviewReadiness: number; // 64
}

export interface CareerRoleMatch {
  id: string;
  title: string;
  matchPercentage: number; // 82
  category: string;
  averageSalary: string;
  whyMatches: string[];
  currentStrengths: string[];
  missingSkills: string[];
  preparationRequired: string[];
  estimatedWeeks: number;
  estimatedPrepTime: string; // '12–16 weeks'
}

export interface JobSimulatorRequirement {
  skill: string;
  userLevel: number;
  requiredLevel: number;
  category: string;
}

export interface SkillGapItem {
  id: string;
  skill: string;
  category: string;
  currentLevel: number; // 62
  targetLevel: number; // 80
  gap: number;
  priority: 'Critical' | 'High' | 'Medium';
  recommendation: string;
  impactScore: number;
}

export interface GitHubStats {
  username: string;
  repositoriesCount: number; // 24
  contributionsThisYear: number; // 386
  totalStars: number; // 42
  healthScore: number; // 74 / 100
  languages: { name: string; percentage: number; color: string }[];
  strengths: string[];
  improvements: string[];
  recentActivityWeeks: number[];
  recentRepos: {
    name: string;
    description: string;
    stars: number;
    language: string;
    updatedAt: string;
  }[];
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number; // 147
  easy: number; // 82
  medium: number; // 54
  hard: number; // 11
  acceptanceRate: number; // 68%
  consistencyRate: number; // 76%
  rankingPercentile: string; // Top 18%
  topics: {
    name: string;
    percentage: number;
    solved: number;
    total: number;
  }[];
  todayChallenge: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    description: string;
  };
}

export interface ResumeMatchResult {
  matchPercentage: number; // 76%
  matchedSkills: string[];
  missingSkills: string[];
  keywordMatchPercentage: number; // 81%
  experienceMatchPercentage: number; // 72%
  projectRelevancePercentage: number; // 78%
  actionableFeedback: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'System Design';
  question: string;
  sampleAnswerHint: string;
}

export interface InterviewEvaluation {
  technicalScore: number; // 78%
  communicationScore: number; // 65%
  clarityScore: number; // 72%
  confidenceScore: number; // 61%
  structureScore: number; // 58%
  overallScore: number; // 67%
  feedback: string;
  suggestedAnswerFramework: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  category: 'DSA' | 'Dev' | 'SoftSkills' | 'Interview' | 'Resume';
  completed: boolean;
  timeEstimate: string;
}

export interface RoadmapPhase {
  phaseNumber: 1 | 2 | 3;
  title: string;
  daysSpan: string; // 'Days 1 - 30'
  focusAreas: string[];
  goals: string[];
  tasks: RoadmapTask[];
}

export interface DailyPlanTask {
  id: string;
  title: string;
  category: string;
  timeEstimate: string;
  completed: boolean;
}

export interface CareerTwinData {
  level: string; // 'Intermediate'
  bestCareer: string; // 'Software Developer'
  strongestSkill: string; // 'Java'
  biggestGap: string; // 'Communication'
  codingStrength: number; // 68%
  careerReadiness: number; // 72%
  recommendedLearningStyle: string; // 'Project Based'
  estimatedPreparation: string; // '12–16 weeks'
  nextMilestone: string; // '80% Career Readiness'
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}
