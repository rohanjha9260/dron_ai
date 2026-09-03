import { UserCareerProfile } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  suggestedFollowUps?: string[];
  persona?: string;
}

export const chatService = {
  /**
   * Generates tailored, context-aware AI mentor responses
   */
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    profile: UserCareerProfile,
    activePersona: string = 'Career Coach'
  ): Promise<ChatMessage> {
    // Realistic AI thinking latency
    await new Promise((resolve) => setTimeout(resolve, 650));

    const lower = userMessage.toLowerCase();
    let text = '';
    let codeSnippet: string | undefined = undefined;
    let suggestedFollowUps: string[] = [];

    if (lower.includes('google') || lower.includes('faang') || lower.includes('maang')) {
      text = `Hey ${profile.name}! For **Google / Tier-1 Global roles**, here is your tailored roadmap based on your current 147 LeetCode problems and 8.2 CGPA:

1. **Algorithmic Focus**: Push your LeetCode count from 147 to **220+ problems**, focusing heavily on **Dynamic Programming on Trees/Graphs** and **Binary Search on Answer Space**.
2. **Clean Code & Unit Testing**: Google interviewers score heavily on clean variable naming, modular helper functions, and writing edge-case tests on the whiteboard/Google Doc.
3. **Open-Source Footprint**: Your 24 GitHub repositories are a great start! Consider adding 2-3 clean pull requests to popular open-source Java/TypeScript libraries to strengthen your resume filter pass rate.`;
      
      suggestedFollowUps = [
        'How do I solve Graph BFS/DFS problems effectively?',
        'What are the most common Google tagged LeetCode questions?',
        'How should I structure my introduction for Google recruiters?'
      ];
    } else if (lower.includes('backlog') || lower.includes('cgpa')) {
      text = `Regarding academics and eligibility:
- Your current CGPA is **${profile.cgpa} / 10** with **${profile.backlogs} active backlogs**.
- **On-Campus Strategy**: Most product firms (Amazon, Microsoft, Swiggy) require $\\ge 7.0$ or $7.5$ CGPA and 0 active backlogs at the time of joining. You are comfortably eligible!
- **Off-Campus Edge**: Off-campus hiring managers care 80% about your live deployed projects (like CloudSync and FinLedger) and LeetCode problem solving. Maintain daily consistency to beat candidates from top-tier colleges!`;
      
      suggestedFollowUps = [
        'How to get off-campus referrals via LinkedIn?',
        'Which companies do not have a CGPA cutoff criterion?'
      ];
    } else if (lower.includes('two sum') || lower.includes('dsa') || lower.includes('code') || lower.includes('algorithm')) {
      text = `Here is how to approach algorithmic problem solving in interviews:

Always start with the **Brute Force approach ($O(N^2)$)** to demonstrate problem comprehension, then optimize to **$O(N)$ with a Hash Table**.`;
      
      codeSnippet = `// Optimal Java Solution: O(N) Time, O(N) Space
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`;

      suggestedFollowUps = [
        'How do I analyze Time and Space Complexity correctly?',
        'Explain Search in Rotated Sorted Array in O(log N).'
      ];
    } else if (lower.includes('salary') || lower.includes('offer') || lower.includes('negotiat')) {
      text = `Here is the golden rule of **Tech Offer Negotiation**:

1. **Always negotiate the Fixed Base**: Variable bonuses and 4-year ESOPs are attractive on paper, but Fixed Base dictates your monthly cash flow, annual increments, and future job offer anchors.
2. **Competing Offers**: The strongest leverage in tech negotiation is holding a competing offer from another product company or high-growth startup.
3. **Use the CareerAI Salary Calculator**: Check the In-Hand Take Home vs City Living Cost index for Bangalore vs Hyderabad before signing!`;

      suggestedFollowUps = [
        'How to write a polite salary negotiation email?',
        'Explain ESOP 4-year vesting schedule and cliff period.'
      ];
    } else {
      text = `Great question, ${profile.name}! Based on your **72% Career Readiness** index and target role (**${profile.targetRole}**):

- **Immediate Priority**: Your biggest current growth opportunity is closing the **DSA consistency** (Trees, DP) and **verbal communication** gap (STAR articulation).
- **Daily Target**: Complete 2 Medium LeetCode problems and practice explaining 1 architecture trade-off aloud today.

How else can I assist your engineering preparation journey?`;

      suggestedFollowUps = [
        'Show me my 30/60/90-Day Roadmap milestones',
        'How to practice STAR framework for behavioral interviews?',
        'Analyze my GitHub commit frequency'
      ];
    }

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: 'Just now',
      codeSnippet,
      suggestedFollowUps,
      persona: activePersona
    };
  }
};
