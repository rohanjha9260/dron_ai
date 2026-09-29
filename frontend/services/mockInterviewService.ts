/**
 * Dron AI - NeuroMock Interview Service & Mock Data Engine
 * Modular service supporting instant demo mode and external LLM/Backend API connection.
 */

import {
  InterviewQuestion,
  CandidateSubmission,
  EvaluationResult,
  InterviewRole,
  InterviewDifficulty,
  InterviewSessionHistoryItem,
} from '../types/mockInterview';

export const MOCK_QUESTIONS_DATABASE: InterviewQuestion[] = [
  {
    id: 'sys-fullstack-001',
    role: 'Fullstack Engineer',
    difficulty: 'Senior',
    category: 'System Design',
    roundTitle: 'Round 2 of 4: Scalable Feed & Caching Architecture',
    roundIndex: 2,
    totalRounds: 4,
    title: 'Design a Real-Time Collaborative Document Editing Service',
    scenario:
      'Architect a Google Docs-like collaborative editor serving 500,000 peak concurrent active documents. Multiple users can edit the same document simultaneously with sub-50ms latency. Explain conflict resolution (CRDT vs OT), live transport protocols, persistence tiers, and offline resynchronization.',
    interviewerPersona: {
      name: 'Dr. Aris Thorne',
      title: 'Principal Distributed Systems Architect @ HyperScale',
      focusAreas: ['Operational Transformation vs CRDTs', 'WebSocket Fanout', 'Redis Pub/Sub vs Kafka', 'Read-after-write Consistency'],
      expectations:
        'Looking for end-to-end depth: client state representation, transport framing, memory bounds on document state vectors, and graceful fallback when clients disconnect unexpectedly.',
    },
    hints: [
      'Contrast Operational Transformation (central server authority) with Conflict-free Replicated Data Types (peer-to-peer convergence).',
      'How will you partition the active connection servers so that collaborators on Document #482 hit the same cluster or pub/sub channel?',
      'Consider snapshot frequency in an Append-Only Event Store versus compaction in PostgreSQL or DynamoDB.',
    ],
    expectedKeywords: ['CRDT', 'Operational Transformation', 'WebSocket', 'Redis PubSub', 'Vector Clock', 'Snapshotting', 'Event Sourcing'],
    timeLimitSeconds: 180,
  },
  {
    id: 'beh-star-002',
    role: 'Fullstack Engineer',
    difficulty: 'Mid-Level',
    category: 'Behavioral (STAR)',
    roundTitle: 'Round 1 of 4: Engineering Leadership & Conflict',
    roundIndex: 1,
    totalRounds: 4,
    title: 'Navigating a High-Stakes Disagreement on Technical Debt vs Feature Launch',
    scenario:
      'Describe a situation where a product manager or team lead insisted on shipping a critical revenue feature immediately, but doing so would compound architectural debt and risk a major outage. Walk me through your Situation, Task, Action, and Result.',
    interviewerPersona: {
      name: 'Elena Rostova',
      title: 'VP of Engineering @ NexaTech',
      focusAreas: ['Influence without Authority', 'Quantifying Technical Risk', 'Compromise & Tradeoffs', 'Post-Incident Learning'],
      expectations:
        'Focus on structured storytelling. Quantify the business impact, demonstrate empathy for product timelines, and explain how you de-escalated tension without burning bridges.',
    },
    hints: [
      'Use the STAR structure clearly: explicitly state the stakes (Situation), your personal accountability (Task), the data-backed steps you executed (Action), and concrete metric-driven outcomes (Result).',
      'Explain how you proposed a staged rollout or tech-debt spike to balance business revenue with site reliability.',
    ],
    expectedKeywords: ['STAR method', 'SLA / SLO', 'Phased Rollout', 'Data-driven trade-off', 'Stakeholder alignment'],
    timeLimitSeconds: 180,
  },
  {
    id: 'aiml-eng-003',
    role: 'AI/ML Engineer',
    difficulty: 'FAANG-level',
    category: 'ML Architecture',
    roundTitle: 'Round 3 of 4: Low-Latency LLM Serving & Retrieval',
    roundIndex: 3,
    totalRounds: 4,
    title: 'Design an Enterprise RAG Engine with Sub-200ms TTFT under 10k QPS',
    scenario:
      'Design a production Retrieval-Augmented Generation (RAG) platform searching over 100M internal enterprise documents. Ensure Time-to-First-Token (TTFT) is below 200ms at 10,000 requests per second. Detail embedding pipelines, vector indexing (HNSW/IVF-PQ), semantic re-ranking, and KV-cache optimization.',
    interviewerPersona: {
      name: 'Kenji Sato',
      title: 'Distinguished ML Infrastructure Engineer @ DeepFrontier',
      focusAreas: ['HNSW vs ScaNN Indexing', 'Continuous Batching (vLLM/PagedAttention)', 'Cross-Encoder Re-ranking latency', 'Embedding Cache'],
      expectations:
        'Expect rigorous back-of-the-envelope calculations: GPU VRAM sizing, network throughput for vector search clusters, and speculative decoding tradeoffs.',
    },
    hints: [
      'Break the 200ms latency budget down: Query embedding generation (25ms), ANN search (30ms), Cohere/BGE reranker (40ms), LLM prefill & first token generation (90ms).',
      'Discuss PagedAttention or FlashAttention-2 to eliminate KV cache fragmentation.',
    ],
    expectedKeywords: ['PagedAttention', 'vLLM', 'HNSW', 'Quantization (FP8/INT4)', 'Speculative Decoding', 'Reranker'],
    timeLimitSeconds: 180,
  },
  {
    id: 'devops-sre-004',
    role: 'DevOps/SRE',
    difficulty: 'Senior',
    category: 'Cloud Infrastructure',
    roundTitle: 'Round 2 of 4: Multi-Region High Availability & Chaos Resilience',
    roundIndex: 2,
    totalRounds: 4,
    title: 'Architecting an Active-Active Multi-Region Zero-Downtime Migration',
    scenario:
      'Your organization must transition an e-commerce checkout engine from single-region AWS us-east-1 to an Active-Active setup across us-east-1 and eu-central-1. Walk through global traffic steering, distributed database consistency (Spanner vs DynamoDB Global Tables), asynchronous replication lag, and conflict resolution.',
    interviewerPersona: {
      name: 'Marcus Sterling',
      title: 'Head of Reliability Engineering @ GlobalCommerce',
      focusAreas: ['Split-Brain Prevention', 'Anycast vs Route53 Geolocation', 'RPO / RTO targets', 'Idempotency Keys'],
      expectations:
        'Show deep mastery of distributed failures: CAP theorem compromises, write conflicts on inventory locks, and automated blast-radius containment.',
    },
    hints: [
      'Address the speed of light barrier (~70-80ms trans-Atlantic RTT). Synchronous cross-region 2PC will crush checkout throughput.',
      'Suggest localized inventory reservations with asynchronous settlement or optimistic reservation with reconciliation.',
    ],
    expectedKeywords: ['Active-Active', 'DynamoDB Global Tables', 'Anycast DNS', 'Idempotency', 'RPO/RTO', 'Circuit Breakers'],
    timeLimitSeconds: 180,
  },
  {
    id: 'pm-005',
    role: 'Product Manager',
    difficulty: 'Mid-Level',
    category: 'Behavioral (STAR)',
    roundTitle: 'Round 2 of 3: Product Strategy & Ruthless Prioritization',
    roundIndex: 2,
    totalRounds: 3,
    title: 'Launching a GenAI Feature in a Heavily Regulated Industry',
    scenario:
      'You are the lead PM for an automated healthcare diagnostics assistant. Clinicians want rapid automated summarization, but compliance requires zero hallucination and strict HIPAA/GDPR guardrails. How do you define the MVP, align medical stakeholders, and establish go/no-go quality metrics?',
    interviewerPersona: {
      name: 'Dr. Sarah Jenkins',
      title: 'Director of Healthcare Product @ HealthAI',
      focusAreas: ['User Trust & Safety', 'Regulatory Compliance', 'Guardrails & Human-in-the-Loop', 'North Star Metrics'],
      expectations:
        'Focus on phased experimentation, confidence score thresholds with clinician escalation paths, and measurable clinical time-saved metrics.',
    },
    hints: [
      'Establish human-in-the-loop (HITL) as a core feature rather than a fallback.',
      'Define clear counter-metrics: speed of summary versus clinician error catch rate.',
    ],
    expectedKeywords: ['Human-in-the-Loop', 'HIPAA Compliance', 'Guardrail validation', 'North Star Metric', 'Hallucination rate'],
    timeLimitSeconds: 180,
  }
];

export const MOCK_HISTORICAL_SESSIONS: InterviewSessionHistoryItem[] = [
  {
    id: 'hist-0914',
    date: 'Sep 14, 2026',
    role: 'Fullstack Engineer',
    difficulty: 'Senior',
    questionTitle: 'Design a Distributed Rate Limiter & Token Bucket Cluster',
    category: 'System Design',
    overallScore: 91,
    grade: 'Strong Hire',
    durationSeconds: 164,
    submission: {
      questionId: 'sys-fullstack-001',
      role: 'Fullstack Engineer',
      difficulty: 'Senior',
      mode: 'voice',
      responseContent:
        'I proposed using Redis Sliding Window Logs combined with Token Bucket algorithms implemented in Lua scripts to guarantee atomicity. Handled distributed race conditions across multi-zone proxies with Envoy filter integration and local memory caching for hot tier DDoS defense.',
      timeElapsedSeconds: 164,
      telemetry: {
        eyeContactScore: 94,
        lightingQuality: 'Optimal',
        speechPacingWpm: 138,
        fillerWordsCount: 3,
        facialComposureScore: 92,
      },
      submittedAt: '2026-09-14T14:23:10Z',
    },
    evaluation: {
      submissionId: 'eval-hist-0914',
      questionId: 'sys-fullstack-001',
      overallScore: 91,
      grade: 'Strong Hire',
      summaryFeedback:
        'Exceptional command of distributed systems nuances. The distinction between Token Bucket and Sliding Window Log with Lua atomicity demonstrated Staff-level maturity.',
      metrics: [
        {
          key: 'technicalAccuracy',
          label: 'Technical Accuracy & Depth',
          score: 9.4,
          description: 'Flawless distributed concurrency modeling with Redis Lua scripts.',
          rubricCriteria: 'Precision in algorithms, concurrency primitives, and edge failure modes.',
        },
        {
          key: 'starAdherence',
          label: 'Structured Communication',
          score: 8.8,
          description: 'Clear architectural progression from single instance to clustered Envoy proxies.',
          rubricCriteria: 'Clear framing of problem constraints, assumptions, and systematic delivery.',
        },
        {
          key: 'communicationPoise',
          label: 'Delivery & Poise',
          score: 9.2,
          description: 'Steady pacing (138 WPM) with minimal filler words.',
          rubricCriteria: 'Voice modulation, professional cadence, and engagement.',
        },
        {
          key: 'concisenessTime',
          label: 'Conciseness & Time Control',
          score: 9.0,
          description: 'Concluded well within the 3-minute SLA leaving time for Q&A.',
          rubricCriteria: 'High information density without trailing tangents.',
        },
      ],
      keyStrengths: [
        'Atomic execution via Redis Lua scripts prevented distributed race conditions.',
        'Proactively factored in local proxy caching to safeguard the central Redis cluster against hot-key bottlenecks.',
        'Clearly distinguished between client-side throttling (HTTP 429 Retry-After) and server-side traffic shedding.',
      ],
      criticalGaps: [
        'Could have briefly touched upon clock drift issues in distributed NTP synchronization when calculating sliding timestamps.',
      ],
      goldStandardAnswer: {
        summary:
          'A Staff-level answer combines high-level API contracts with deep atomic database guarantees and edge CDN tiering.',
        breakdown: [
          { phase: '1. Requirements & Back-of-the-envelope', keyPoints: ['100k peak QPS', '5ms SLA budget', 'Sliding window precision'] },
          { phase: '2. Algorithmic Choice', keyPoints: ['Sliding Window Counter using Redis Sorted Sets with Lua script execution'] },
          { phase: '3. Reliability & Fault Tolerance', keyPoints: ['Fail-open vs Fail-closed policy under Redis partitioning'] }
        ],
        verbatimAnswer:
          'To design a globally scalable rate limiter, I decompose the problem into three tiers: the edge gateway layer (Envoy), the central state tier (Redis Cluster), and the fallback circuit breaker...'
      },
      radarScores: {
        dsa: 92,
        architecture: 95,
        communication: 88,
        cultureFit: 90,
        problemSolving: 94,
        scalability: 96,
      },
      evaluatedAt: '2026-09-14T14:24:02Z',
    },
  },
  {
    id: 'hist-0911',
    date: 'Sep 11, 2026',
    role: 'AI/ML Engineer',
    difficulty: 'Senior',
    questionTitle: 'Transformer Attention Memory Optimization (FlashAttention)',
    category: 'ML Architecture',
    overallScore: 84,
    grade: 'Hire',
    durationSeconds: 172,
    submission: {
      questionId: 'aiml-eng-003',
      role: 'AI/ML Engineer',
      difficulty: 'Senior',
      mode: 'written',
      responseContent:
        'Addressed quadratic attention complexity by explaining tiling and online softmax. Described SRAM vs HBM memory hierarchy on Nvidia H100 GPUs and how FlashAttention avoids materializing the N x N attention matrix into slow high-bandwidth memory.',
      timeElapsedSeconds: 172,
      telemetry: {
        eyeContactScore: 88,
        lightingQuality: 'Optimal',
        speechPacingWpm: 124,
        fillerWordsCount: 2,
        facialComposureScore: 86,
      },
      submittedAt: '2026-09-11T18:45:00Z',
    },
    evaluation: {
      submissionId: 'eval-hist-0911',
      questionId: 'aiml-eng-003',
      overallScore: 84,
      grade: 'Hire',
      summaryFeedback:
        'Solid mathematical understanding of IO-aware attention algorithms and GPU memory hierarchies.',
      metrics: [
        {
          key: 'technicalAccuracy',
          label: 'Technical Accuracy & Depth',
          score: 8.8,
          description: 'Accurate description of online softmax and GPU SRAM tiling.',
          rubricCriteria: 'Precision in algorithms, concurrency primitives, and edge failure modes.',
        },
        {
          key: 'starAdherence',
          label: 'Structured Communication',
          score: 8.0,
          description: 'Well-structured logical flow explaining memory bottlenecks first.',
          rubricCriteria: 'Clear framing of problem constraints, assumptions, and systematic delivery.',
        },
        {
          key: 'communicationPoise',
          label: 'Delivery & Poise',
          score: 8.2,
          description: 'Clear written technical exposition.',
          rubricCriteria: 'Voice modulation, professional cadence, and engagement.',
        },
        {
          key: 'concisenessTime',
          label: 'Conciseness & Time Control',
          score: 8.5,
          description: 'Good density of GPU architectural terms.',
          rubricCriteria: 'High information density without trailing tangents.',
        },
      ],
      keyStrengths: [
        'Correctly identified GPU High Bandwidth Memory (HBM) as the primary IO bottleneck rather than pure FLOPs computation.',
        'Clearly explained the online softmax rescaling trick.',
      ],
      criticalGaps: [
        'Omitted FlashAttention-2 forward/backward pass speedup improvements like split-KV and warp-level scheduling.',
      ],
      goldStandardAnswer: {
        summary: 'Focus on IO-complexity: FlashAttention reduces HBM accesses from O(N^2) to O(N^2/M).',
        breakdown: [
          { phase: '1. Memory Hierarchy', keyPoints: ['SRAM is 19TB/s vs HBM3 at 3.35TB/s', 'Standard attention incurs memory thrashing'] },
          { phase: '2. Tiling & Recomputation', keyPoints: ['Recomputes attention matrix on backward pass rather than saving to HBM'] }
        ],
        verbatimAnswer:
          'Standard self-attention computes S = Q*K^T, P = softmax(S), and O = P*V. The matrix P has size N x N which exceeds SRAM capacity...'
      },
      radarScores: {
        dsa: 85,
        architecture: 88,
        communication: 80,
        cultureFit: 82,
        problemSolving: 89,
        scalability: 86,
      },
      evaluatedAt: '2026-09-11T18:46:12Z',
    },
  },
];

/**
 * Service Class for evaluation orchestration
 */
export class MockInterviewService {
  private static apiUrl = '/api/v1/mock-interview/evaluate';

  /**
   * Evaluates candidate submission using local heuristic AI engine or remote endpoint
   */
  public static async evaluateSubmission(
    submission: CandidateSubmission,
    question: InterviewQuestion
  ): Promise<EvaluationResult> {
    // Check if backend API or AI gateway is configured
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission, question }),
      });

      if (response.ok) {
        return (await response.json()) as EvaluationResult;
      }
    } catch {
      // Fallback seamlessly to local intelligent heuristic evaluation engine
    }

    // Dynamic heuristic simulation based on input length, keywords, and telemetry
    return this.generateHeuristicEvaluation(submission, question);
  }

  /**
   * Generates intelligent, realistic AI evaluation with dynamic scoring
   */
  public static generateHeuristicEvaluation(
    submission: CandidateSubmission,
    question: InterviewQuestion
  ): EvaluationResult {
    const text = submission.responseContent.toLowerCase();
    const wordCount = submission.responseContent.trim().split(/\s+/).filter(Boolean).length;

    // Keyword matching
    const matchedKeywords = question.expectedKeywords.filter((kw) =>
      text.includes(kw.toLowerCase())
    );
    const keywordRatio = question.expectedKeywords.length
      ? matchedKeywords.length / question.expectedKeywords.length
      : 0.7;

    // Technical accuracy based on keyword depth & substance
    const techScore = Math.min(
      9.8,
      Math.max(5.5, Number((6.0 + keywordRatio * 3.5 + Math.min(wordCount / 120, 0.5)).toFixed(1)))
    );

    // STAR framework scoring (detects situation, task, action, result, metrics)
    const starSignals = ['situation', 'task', 'action', 'result', 'because', 'implemented', 'improved', 'metric', 'reduced', 'scaled'];
    const starMatches = starSignals.filter((sig) => text.includes(sig)).length;
    const starScore = Math.min(
      9.5,
      Math.max(5.8, Number((5.5 + (starMatches / starSignals.length) * 4.0).toFixed(1)))
    );

    // Delivery & Poise based on video/audio telemetry
    const deliveryScore = Number(
      (
        (submission.telemetry.eyeContactScore / 100) * 4.5 +
        (submission.telemetry.facialComposureScore / 100) * 3.5 +
        (submission.telemetry.lightingQuality === 'Optimal' ? 1.5 : 0.8)
      ).toFixed(1)
    );

    // Conciseness & Time Management
    let concisenessScore = 8.5;
    if (submission.timeElapsedSeconds > 175) concisenessScore = 7.2;
    else if (submission.timeElapsedSeconds < 45 && wordCount < 40) concisenessScore = 6.0;
    else if (wordCount > 60 && wordCount < 250) concisenessScore = 9.2;

    const overallScore = Math.round(
      (techScore * 0.35 + starScore * 0.25 + deliveryScore * 0.2 + concisenessScore * 0.2) * 10
    );

    let grade: 'Strong Hire' | 'Hire' | 'Borderline' | 'Needs Work' = 'Hire';
    if (overallScore >= 90) grade = 'Strong Hire';
    else if (overallScore >= 78) grade = 'Hire';
    else if (overallScore >= 65) grade = 'Borderline';
    else grade = 'Needs Work';

    // Dynamic Strengths
    const keyStrengths: string[] = [];
    if (matchedKeywords.length > 0) {
      keyStrengths.push(
        `Strong conceptual recall: Seamlessly integrated core principles of ${matchedKeywords.slice(0, 3).join(', ')}.`
      );
    } else {
      keyStrengths.push('Articulated high-level intuition with clear end-to-end design intent.');
    }

    if (submission.telemetry.eyeContactScore > 80) {
      keyStrengths.push(
        `High engagement poise: Sustained ${submission.telemetry.eyeContactScore}% direct eye contact with minimal speech pauses.`
      );
    } else {
      keyStrengths.push('Demonstrated methodical problem decomposition and logical progression.');
    }

    if (wordCount > 80) {
      keyStrengths.push(
        `Substantive technical depth: Addressed concrete failure domains and state durability trade-offs.`
      );
    } else {
      keyStrengths.push('Concise formulation without unnecessary filler jargon.');
    }

    // Dynamic Gaps
    const criticalGaps: string[] = [];
    const missingKeywords = question.expectedKeywords.filter(
      (kw) => !text.includes(kw.toLowerCase())
    );
    if (missingKeywords.length > 0) {
      criticalGaps.push(
        `Missed core architectural primitives: Did not evaluate trade-offs regarding ${missingKeywords.slice(0, 2).join(' or ')}.`
      );
    }
    if (wordCount < 60) {
      criticalGaps.push(
        'Superficial response length: Provide deeper back-of-the-envelope calculations or algorithmic pseudo-steps.'
      );
    }
    if (submission.timeElapsedSeconds < 40) {
      criticalGaps.push(
        'Rushed delivery: Use the full 3-minute allocation to articulate edge cases, chaos engineering, and telemetry monitoring.'
      );
    }
    if (criticalGaps.length === 0) {
      criticalGaps.push('Could further quantify throughput SLA metrics and operational cost envelope at 10x scale.');
    }

    return {
      submissionId: 'sub-' + Date.now(),
      questionId: question.id,
      overallScore,
      grade,
      summaryFeedback:
        overallScore >= 80
          ? `Outstanding delivery. The candidate approached "${question.title}" with senior-level architectural rigor, balancing theoretical principles with real-world failure domains.`
          : `Competent baseline response. While core intuition was demonstrated, the answer requires more explicit metric quantification, deeper fault tolerance analysis, and sharper trade-off evaluation.`,
      metrics: [
        {
          key: 'technicalAccuracy',
          label: 'Technical Accuracy & Depth',
          score: techScore,
          description: `Identified ${matchedKeywords.length} of ${question.expectedKeywords.length} critical architectural vectors.`,
          rubricCriteria: 'Precision in algorithms, concurrency primitives, and edge failure modes.',
        },
        {
          key: 'starAdherence',
          label: 'STAR Framework Adherence',
          score: starScore,
          description: 'Structure followed logical flow from problem definition to operational outcomes.',
          rubricCriteria: 'Clear framing of problem constraints, assumptions, and systematic delivery.',
        },
        {
          key: 'communicationPoise',
          label: 'Delivery & Communication Poise',
          score: deliveryScore,
          description: `Paced at ~${submission.telemetry.speechPacingWpm} WPM with confident posture and composure.`,
          rubricCriteria: 'Voice modulation, professional cadence, and engagement.',
        },
        {
          key: 'concisenessTime',
          label: 'Conciseness & Time Management',
          score: concisenessScore,
          description: `Allocated ${Math.floor(submission.timeElapsedSeconds / 60)}m ${submission.timeElapsedSeconds % 60}s with balanced focus across subtopics.`,
          rubricCriteria: 'High information density without trailing tangents.',
        },
      ],
      keyStrengths,
      criticalGaps,
      goldStandardAnswer: {
        summary: `A FAANG-level answer for ${question.category} articulates concrete constraints, proposes a modular design, and walks through boundary edge cases.`,
        breakdown: [
          {
            phase: '1. Scoping & Functional Constraints',
            keyPoints: [
              'Explicitly verify read/write QPS, payload sizes, and SLA targets (e.g. 99.99% availability, p99 < 50ms).',
              'Clarify consistency model: Strong vs Eventual consistency and partition tolerance tradeoffs.',
            ],
          },
          {
            phase: '2. Core Architecture & Data Flow',
            keyPoints: [
              'Outline the client ingestion tier, streaming/pub-sub backbone, and partitioned storage engine.',
              `Apply specific technologies: ${question.expectedKeywords.slice(0, 3).join(', ')}.`,
            ],
          },
          {
            phase: '3. Deep-Dive Edge Cases & Chaos Resilience',
            keyPoints: [
              'Handle split-brain network partitions and client reconnection storms.',
              'Implement circuit breakers, exponential backoff with jitter, and dead letter queues.',
            ],
          },
        ],
        verbatimAnswer: `To tackle ${question.title}, I structure the response into three phases. First, establishing scale: with 500k concurrent active sessions, centralizing state on a single node introduces an immediate bottleneck. We decouple ingress with an Anycast DNS gateway routing to regional Kubernetes clusters. For live synchronization, we adopt CRDTs over WebSockets with Redis Pub/Sub cluster shards, ensuring causal consistency without locking...`,
      },
      radarScores: {
        dsa: Math.min(100, Math.round(overallScore * 0.95)),
        architecture: Math.min(100, Math.round(overallScore * 1.05)),
        communication: Math.min(100, Math.round(deliveryScore * 10)),
        cultureFit: Math.min(100, Math.round(starScore * 10)),
        problemSolving: Math.min(100, Math.round((techScore + starScore) * 5)),
        scalability: Math.min(100, Math.round(techScore * 10.2)),
      },
      evaluatedAt: new Date().toISOString(),
    };
  }
}
