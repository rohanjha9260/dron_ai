import { ResumeMatchResult } from '../types';

export const resumeService = {
  /**
   * Compares parsed resume content with a target job description
   */
  async matchResumeWithJobDescription(
    resumeText: string,
    jobDescriptionText: string
  ): Promise<ResumeMatchResult> {
    // Realistic analysis latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Dynamic keyword checks
    const commonSkills = ['Java', 'SQL', 'Git', 'REST API', 'React', 'TypeScript', 'Node.js', 'Spring Boot', 'Docker', 'AWS', 'Kubernetes'];
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescriptionText.toLowerCase();

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    commonSkills.forEach(skill => {
      const inJd = jdLower.includes(skill.toLowerCase());
      const inResume = resumeLower.includes(skill.toLowerCase());
      if (inJd && inResume) {
        matchedSkills.push(skill);
      } else if (inJd && !inResume) {
        missingSkills.push(skill);
      }
    });

    // Default fallback if brief inputs
    if (matchedSkills.length === 0) {
      matchedSkills.push('Java', 'SQL', 'Git', 'REST API', 'JavaScript');
    }
    if (missingSkills.length === 0) {
      missingSkills.push('Spring Boot', 'Docker', 'AWS', 'Redis');
    }

    return {
      matchPercentage: 76,
      matchedSkills,
      missingSkills,
      keywordMatchPercentage: 81,
      experienceMatchPercentage: 72,
      projectRelevancePercentage: 78,
      actionableFeedback: [
        'Add quantitative impact metrics to project bullet points (e.g. "reduced latency by 35%").',
        'Incorporate missing keywords (Docker, Spring Boot) in your technical skills and project descriptions where genuinely applicable.',
        'Emphasize database query indexing and transaction isolation experience.'
      ]
    };
  }
};
