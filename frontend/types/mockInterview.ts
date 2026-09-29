/**
 * Dron AI - NeuroMock Interview & Analytics Dashboard
 * TypeScript Interfaces and Data Contracts
 */

export type InterviewDifficulty = 'Junior' | 'Mid-Level' | 'Senior' | 'FAANG-level';

export type InterviewRole =
  | 'Fullstack Engineer'
  | 'AI/ML Engineer'
  | 'Product Manager'
  | 'DevOps/SRE'
  | 'Distributed Systems Architect';

export type QuestionCategory =
  | 'System Design'
  | 'Behavioral (STAR)'
  | 'DSA & Coding'
  | 'ML Architecture'
  | 'Cloud Infrastructure';

export type InputMode = 'voice' | 'written';

export type EvaluationGrade = 'Strong Hire' | 'Hire' | 'Borderline' | 'Needs Work';

export interface InterviewQuestion {
  id: string;
  role: InterviewRole;
  difficulty: InterviewDifficulty;
  category: QuestionCategory;
  roundTitle: string; // e.g., "Round 2 of 4: Scalability & Architecture"
  roundIndex: number;
  totalRounds: number;
  title: string;
  scenario: string;
  interviewerPersona: {
    name: string;
    title: string;
    focusAreas: string[];
    expectations: string;
  };
  hints: string[];
  expectedKeywords: string[];
  timeLimitSeconds: number; // default: 180 (3:00 mins)
}

export interface VideoTelemetry {
  eyeContactScore: number; // 0-100 percentage
  lightingQuality: 'Optimal' | 'Sub-optimal' | 'Poor';
  speechPacingWpm: number; // words per minute
  fillerWordsCount: number;
  facialComposureScore: number; // 0-100
}

export interface CandidateSubmission {
  questionId: string;
  role: InterviewRole;
  difficulty: InterviewDifficulty;
  mode: InputMode;
  responseContent: string; // Transcribed speech or typed text
  timeElapsedSeconds: number;
  audioBlob?: Blob;
  telemetry: VideoTelemetry;
  submittedAt: string; // ISO timestamp
}

export interface DimensionalMetric {
  key: 'technicalAccuracy' | 'starAdherence' | 'communicationPoise' | 'concisenessTime';
  label: string;
  score: number; // 0 to 10
  description: string;
  rubricCriteria: string;
}

export interface GoldStandardAnswer {
  summary: string;
  breakdown: {
    phase: string;
    keyPoints: string[];
  }[];
  verbatimAnswer: string;
}

export interface EvaluationResult {
  submissionId: string;
  questionId: string;
  overallScore: number; // 0 to 100
  grade: EvaluationGrade;
  summaryFeedback: string;
  metrics: DimensionalMetric[];
  keyStrengths: string[];
  criticalGaps: string[];
  goldStandardAnswer: GoldStandardAnswer;
  radarScores: {
    dsa: number; // 0 to 100
    architecture: number;
    communication: number;
    cultureFit: number;
    problemSolving: number;
    scalability: number;
  };
  evaluatedAt: string;
}

export interface InterviewSessionHistoryItem {
  id: string;
  date: string;
  role: InterviewRole;
  difficulty: InterviewDifficulty;
  questionTitle: string;
  category: QuestionCategory;
  overallScore: number;
  grade: EvaluationGrade;
  durationSeconds: number;
  submission: CandidateSubmission;
  evaluation: EvaluationResult;
}

export interface MockInterviewState {
  currentRole: InterviewRole;
  currentDifficulty: InterviewDifficulty;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  inputMode: InputMode;
  writtenAnswer: string;
  isRecording: boolean;
  timerSeconds: number;
  timerActive: boolean;
  isEvaluating: boolean;
  evaluationStep: string;
  currentEvaluation: EvaluationResult | null;
  historyDrawerOpen: boolean;
  sessionHistory: InterviewSessionHistoryItem[];
  ttsActive: boolean;
  cameraActive: boolean;
}
