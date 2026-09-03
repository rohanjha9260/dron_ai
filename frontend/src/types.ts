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
  targetRole: string;
  createdAt: string;
}

export type UserProfile = any;

export interface ReadinessScoreBreakdown {
  overall: number;
  statusLabel: 'Critical' | 'Needs Improvement' | 'On Track' | 'Industry Ready' | 'Top 5% Elite';
  academic: number;
  coding: number;
  projects: number;
  github: number;
  technical: number;
  softSkills: number;
  interviewReadiness: number;
}

export type CareerScoreBreakdown = any;

export interface CareerRoleMatch {
  id: string;
  title: string;
  matchPercentage: number;
  category: string;
  averageSalary: string;
  whyMatches: string[];
  currentStrengths: string[];
  missingSkills: string[];
  preparationRequired: string[];
  estimatedWeeks: number;
  estimatedPrepTime: string;
}

export type RoleMatch = any;

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
  currentLevel: number;
  targetLevel: number;
  requiredLevel?: number;
  gap: number;
  priority: 'Critical' | 'High' | 'Medium';
  recommendation: string;
  impactScore: number;
}

export interface GitHubStats {
  username: string;
  repositoriesCount: number;
  contributionsThisYear: number;
  totalStars: number;
  healthScore: number;
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

export type GitHubAnalytics = any;

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  acceptanceRate: number;
  consistencyRate: number;
  rankingPercentile: string;
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

export type LeetCodeAnalytics = any;

export interface ResumeMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordMatchPercentage: number;
  experienceMatchPercentage: number;
  projectRelevancePercentage: number;
  actionableFeedback: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'System Design';
  question: string;
  sampleAnswerHint: string;
}

export interface InterviewEvaluation {
  technicalScore: number;
  communicationScore: number;
  clarityScore: number;
  confidenceScore: number;
  structureScore: number;
  overallScore: number;
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
  daysSpan: string;
  focusAreas: string[];
  goals: string[];
  tasks: RoadmapTask[];
}

export type RoadmapDayPhase = any;

export interface DailyPlanTask {
  id: string;
  title: string;
  category: string;
  timeEstimate: string;
  completed: boolean;
}

export interface CareerTwinData {
  level: string;
  bestCareer: string;
  strongestSkill: string;
  biggestGap: string;
  codingStrength: number;
  careerReadiness: number;
  recommendedLearningStyle: string;
  estimatedPreparation: string;
  nextMilestone: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}

export interface CompanyHiringProbability {
  id: string;
  companyName: string;
  tier: 'FAANG / Tier-1 Global' | 'Top Tier Unicorn' | 'High Growth FinTech' | 'Enterprise Tech';
  logoEmoji: string;
  clearanceProbability: number;
  averagePackage: string;
  rounds: {
    name: string;
    probability: number;
    description: string;
  }[];
  criticalFocus: string[];
  shortlistingTip: string;
}

export type ActionPlan = any;
