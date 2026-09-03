import { GitHubStats } from '../types';
import { initialGitHubStats } from '../data/mockUserData';

export const githubService = {
  /**
   * Fetches GitHub analytics for a username
   */
  async getGitHubStats(username: string): Promise<GitHubStats> {
    // Simulated network delay for realistic SaaS feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!username || username.trim() === '') {
      throw new Error('GitHub username is required to fetch intelligence.');
    }

    return {
      ...initialGitHubStats,
      username: username.trim()
    };
  },

  /**
   * Evaluates GitHub repository quality and health
   */
  evaluateRepoHealth(stats: GitHubStats): number {
    let score = 40;
    score += Math.min(25, stats.repositoriesCount * 1.2);
    score += Math.min(20, (stats.contributionsThisYear / 400) * 20);
    score += Math.min(15, stats.totalStars * 0.5);
    return Math.min(100, Math.round(score));
  }
};
