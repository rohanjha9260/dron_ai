import { InterviewQuestion, InterviewEvaluation } from '../types';

export const interviewService = {
  questions: [
    {
      id: 'q1',
      category: 'Behavioral',
      question: 'Tell me about your most challenging technical project and how you resolved unexpected roadblocks.',
      sampleAnswerHint: 'Use the STAR format: Context ➔ Technical Conflict ➔ Architecture decisions made ➔ Verifiable quantitative outcome.'
    },
    {
      id: 'q2',
      category: 'Technical',
      question: 'How would you design a rate limiter microservice to protect against API DDoS attacks in a distributed environment?',
      sampleAnswerHint: 'Explain Token Bucket vs Sliding Window algorithms, Redis atomic operations (INCR/EXPIRE), and graceful 429 Too Many Requests response handling.'
    },
    {
      id: 'q3',
      category: 'System Design',
      question: 'Explain the trade-offs between SQL (Relational) vs NoSQL (Document/Key-Value) databases for high-concurrency applications.',
      sampleAnswerHint: 'Discuss ACID transactions, schema consistency vs horizontal partition scalability, and CAP theorem nuances.'
    }
  ] as InterviewQuestion[],

  /**
   * Evaluates user typed/spoken answer using AI criteria
   */
  async evaluateInterviewAnswer(
    questionId: string,
    userAnswer: string
  ): Promise<InterviewEvaluation> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const wordCount = userAnswer.trim().split(/\s+/).length;
    let technicalScore = wordCount > 25 ? 78 : 60;
    let communicationScore = wordCount > 35 ? 65 : 50;

    return {
      technicalScore,
      communicationScore,
      clarityScore: 72,
      confidenceScore: 61,
      structureScore: 58,
      overallScore: 67,
      feedback: 'Your technical explanation is strong, but structure your answer using Problem ➔ Approach ➔ Result. Quantify your engineering outcomes with concrete numbers.',
      suggestedAnswerFramework: 'STAR Framework (Situation ➔ Task ➔ Action ➔ Result)'
    };
  }
};
