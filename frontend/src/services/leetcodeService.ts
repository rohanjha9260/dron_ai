import { LeetCodeStats } from '../types';
import { initialLeetCodeStats } from '../data/mockUserData';

export const leetcodeService = {
  /**
   * Fetches LeetCode analytics for a given username
   */
  async getLeetCodeStats(username: string): Promise<LeetCodeStats> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!username || username.trim() === '') {
      throw new Error('LeetCode username is required to fetch intelligence.');
    }

    return {
      ...initialLeetCodeStats,
      username: username.trim()
    };
  },

  /**
   * Evaluates problem solving strength index
   */
  calculateCodingStrength(stats: LeetCodeStats): number {
    let score = 30;
    score += Math.min(30, (stats.medium / 100) * 30);
    score += Math.min(25, (stats.hard / 25) * 25);
    score += Math.min(15, (stats.easy / 100) * 15);
    return Math.min(100, Math.round(score));
  }
};
