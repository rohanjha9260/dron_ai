import { 
  UserCareerProfile, 
  ReadinessScoreBreakdown, 
  CareerRoleMatch, 
  SkillGapItem, 
  JobSimulatorRequirement,
  CareerTwinData 
} from '../types';
import { 
  initialAmanScores, 
  initialRoleMatches, 
  initialSkillGaps, 
  initialCareerTwin 
} from '../data/mockUserData';

export const careerAnalysisService = {
  /**
   * Generates holistic career readiness breakdown from raw user profile
   */
  calculateReadiness(profile: UserCareerProfile): ReadinessScoreBreakdown {
    // 1. Academic Strength
    let academic = (profile.cgpa / 10) * 100;
    if (profile.backlogs > 0) {
      academic -= profile.backlogs * 16;
    }
    academic = Math.max(15, Math.min(100, Math.round(academic)));

    // 2. Coding Strength
    let coding = 45;
    const hasCoreLang = profile.technicalSkills.some((s: { name: string }) => 
      ['Java', 'C++', 'Python', 'Go', 'Rust'].includes(s.name)
    );
    if (hasCoreLang) coding += 12;
    if (profile.leetCodeUsername) coding += 15;
    coding = Math.max(20, Math.min(100, Math.round(coding)));

    // 3. Projects Strength
    let projects = Math.min(100, profile.projects.length * 20);
    const liveCount = profile.projects.filter((p: { liveUrl?: string }) => Boolean(p.liveUrl)).length;
    projects += liveCount * 10;
    projects = Math.max(20, Math.min(100, Math.round(projects)));

    // 4. GitHub Strength
    let github = 40;
    if (profile.githubUsername) github += 25;
    github += Math.min(25, profile.projects.length * 8);
    github = Math.max(20, Math.min(100, Math.round(github)));

    // 5. Technical Skills Strength
    let technical = Math.min(100, profile.technicalSkills.length * 5.5 + profile.certifications.length * 8);

    // 6. Soft Skills Strength
    const softVals: number[] = Object.values(profile.softSkills);
    const softSkills = Math.round(softVals.reduce((a: number, b: number) => a + b, 0) / softVals.length);

    // 7. Interview Readiness
    let interviewReadiness = Math.round((coding * 0.35) + (softSkills * 0.35) + (technical * 0.20) + (academic * 0.10));
    if (profile.backlogs > 0) interviewReadiness = Math.max(10, interviewReadiness - 10);

    // Overall Readiness
    let overall = Math.round(
      (coding * 0.25) +
      (projects * 0.22) +
      (technical * 0.20) +
      (softSkills * 0.18) +
      (academic * 0.15)
    );

    let statusLabel: ReadinessScoreBreakdown['statusLabel'] = 'On Track';
    if (overall >= 85) statusLabel = 'Top 5% Elite';
    else if (overall >= 75) statusLabel = 'Industry Ready';
    else if (overall >= 65) statusLabel = 'On Track';
    else if (overall >= 50) statusLabel = 'Needs Improvement';
    else statusLabel = 'Critical';

    return {
      overall,
      statusLabel,
      academic,
      coding,
      projects,
      github,
      technical: Math.round(technical),
      softSkills,
      interviewReadiness
    };
  },

  /**
   * Generates personalized role matches
   */
  getRoleMatches(profile: UserCareerProfile, scores: ReadinessScoreBreakdown): CareerRoleMatch[] {
    return initialRoleMatches.map(role => {
      let match = role.matchPercentage;
      if (profile.targetRole === role.title) {
        match = Math.min(98, match + 4);
      }
      return {
        ...role,
        matchPercentage: match
      };
    });
  },

  /**
   * Generates skill gap comparative diagnostics
   */
  getSkillGaps(profile: UserCareerProfile, scores: ReadinessScoreBreakdown): SkillGapItem[] {
    return initialSkillGaps;
  },

  /**
   * Runs the Job Role Simulator against specific target role
   */
  simulateRoleMatch(targetRoleName: string, profile: UserCareerProfile): {
    roleTitle: string;
    overallMatch: number;
    targetThreshold: number;
    requirements: JobSimulatorRequirement[];
  } {
    const defaultReqs: JobSimulatorRequirement[] = [
      { skill: 'Java / Core OOP', userLevel: 78, requiredLevel: 85, category: 'Languages' },
      { skill: 'Data Structures & Algorithms', userLevel: 62, requiredLevel: 80, category: 'Core CS' },
      { skill: 'SQL & Query Optimization', userLevel: 55, requiredLevel: 75, category: 'Databases' },
      { skill: 'Spring Boot & Microservices', userLevel: 40, requiredLevel: 75, category: 'Frameworks' },
      { skill: 'Git & Version Control', userLevel: 72, requiredLevel: 70, category: 'DevOps' }
    ];

    return {
      roleTitle: targetRoleName,
      overallMatch: 67,
      targetThreshold: 85,
      requirements: defaultReqs
    };
  },

  /**
   * Generates Career Twin model
   */
  getCareerTwin(profile: UserCareerProfile, scores: ReadinessScoreBreakdown): CareerTwinData {
    return {
      ...initialCareerTwin,
      codingStrength: scores.coding,
      careerReadiness: scores.overall
    };
  }
};
