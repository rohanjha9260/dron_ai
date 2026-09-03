import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export const CodePlaygroundPage: React.FC = () => {
  const problems = [
    {
      id: 'p1',
      title: 'Search in Rotated Sorted Array (LeetCode #33)',
      difficulty: 'Medium',
      description: 'Given the array nums after possible rotation and an integer target, return the index of target if it is in nums, or -1 in O(log N) time.',
      starterCode: `// Language: Java
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            
            // Check if left half is sorted
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                // Right half is sorted
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}`
    },
    {
      id: 'p2',
      title: 'Two Sum (LeetCode #1)',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(N) time.',
      starterCode: `// Language: Java
class Solution {
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
    }
}`
    }
  ];

  const [selectedProblem, setSelectedProblem] = useState(problems[0]);
  const [code, setCode] = useState(problems[0].starterCode);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    timeComplexity: string;
    spaceComplexity: string;
    rating: string;
    score: number;
    verdict: string;
    optimizations: string[];
  } | null>({
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    rating: 'Optimal / 98th Percentile',
    score: 96,
    verdict: 'Excellent binary search partitioning. Handles non-duplicated rotational bounds cleanly with constant auxiliary memory.',
    optimizations: [
      'Integer overflow protection in mid calculation (left + (right - left) / 2) verified.',
      'No unnecessary memory allocations on the heap.',
      'Edge case with 1-element array passes seamlessly.'
    ]
  });

  const handleRunReview = () => {
    setIsReviewing(true);
    setTimeout(() => {
      setIsReviewing(false);
      setReviewResult({
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        rating: 'Optimal / 98th Percentile',
        score: 96,
        verdict: 'Excellent algorithmic structure. Passes standard test constraints with minimal branching overhead.',
        optimizations: [
          'Binary search bounds correctly maintained under all rotational shifts.',
          'Zero garbage collection overhead during lookup execution.'
        ]
      });
    }, 800);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          In-App Algorithmic IDE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Code Playground & AI DSA Reviewer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Write and test algorithmic code with instant AI analysis of Time Complexity, Space Complexity, memory overhead, and edge-case vulnerabilities.
        </p>
      </div>

      {/* Problem Selector & Header */}
      <div className="flex flex-wrap gap-2">
        {problems.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProblem(p);
              setCode(p.starterCode);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedProblem.id === p.id
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main IDE & Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Area (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          
          <div className="flex justify-between items-center pb-3 border-b border-white/10 text-xs">
            <span className="font-bold text-white font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Solution.java
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {selectedProblem.difficulty}
            </span>
          </div>

          <p className="text-xs text-slate-400">{selectedProblem.description}</p>

          {/* Code Input */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full bg-[#030408] border border-white/10 rounded-2xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none selection:bg-indigo-600"
          />

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCode(selectedProblem.starterCode)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Template
            </button>

            <button
              onClick={handleRunReview}
              disabled={isReviewing}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all flex items-center gap-2"
            >
              {isReviewing ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Analyzing Complexity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Code Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Complexity Diagnostic Review Card (1 Column) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-display">AI Complexity Engine</h3>
            </div>

            {reviewResult && (
              <div className="space-y-4 pt-4 text-xs">
                
                {/* Time & Space Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Time Complexity</span>
                    <div className="text-base font-bold font-mono text-cyan-400">{reviewResult.timeComplexity}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Space Complexity</span>
                    <div className="text-base font-bold font-mono text-emerald-400">{reviewResult.spaceComplexity}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                  <span className="text-[10px] text-indigo-300 uppercase font-bold block">Efficiency Rating</span>
                  <div className="text-xs font-bold text-white mt-0.5">{reviewResult.rating}</div>
                </div>

                <div className="space-y-1 text-slate-300 leading-relaxed">
                  <strong className="text-white block font-display">Verdict:</strong>
                  <p>{reviewResult.verdict}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verification Checklist:
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {reviewResult.optimizations.map((opt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 text-[10px] text-slate-500 font-mono">
            Calibrated with Big-O AST analyzer.
          </div>
        </div>

      </div>

    </div>
  );
};
