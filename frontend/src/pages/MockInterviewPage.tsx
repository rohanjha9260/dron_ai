import React, { useState } from 'react';
import { 
  MessagesSquare, 
  Sparkles, 
  Mic, 
  Send, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Play,
  Volume2
} from 'lucide-react';
import { interviewService } from '../services/interviewService';
import { InterviewEvaluation } from '../types';

export const MockInterviewPage: React.FC = () => {
  const questions = interviewService.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const activeQuestion = questions[currentQuestionIndex];

  const handleStartVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording && !userAnswer) {
      setUserAnswer(
        'In my recent project CloudSync, our biggest challenge was handling concurrent WebSocket broadcasts across multi-user canvas rooms without frame stutter. We implemented a Redis Pub/Sub buffer layer that batched diff patches every 16ms, cutting server load by 45%.'
      );
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await interviewService.evaluateInterviewAnswer(activeQuestion.id, userAnswer);
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    setEvaluation(null);
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer('');
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          AI Interview Simulator
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Interactive AI Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Simulate high-pressure technical and behavioral interview rounds. Receive instant neural feedback on technical depth, STAR structure, clarity, and communication poise.
        </p>
      </div>

      {/* Main Question & Answer Interface Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        
        {/* Question Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400 uppercase tracking-wider font-mono">
              Question {currentQuestionIndex + 1} of {questions.length} • {activeQuestion.category}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              AI Interviewer Active
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white font-display leading-relaxed">
            "{activeQuestion.question}"
          </h3>

          <div className="text-xs text-slate-400 pt-1">
            <strong className="text-slate-300">Interviewer Hint: </strong>
            <span>{activeQuestion.sampleAnswerHint}</span>
          </div>
        </div>

        {/* Answer Input Area */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">Your Spoken or Typed Response:</label>
            <button
              type="button"
              onClick={handleStartVoice}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Listening / Transcribing...' : 'Simulate Voice Input'}</span>
            </button>
          </div>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={5}
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Type or dictate your structured response here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleNextQuestion}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Skip to Next Question
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !userAnswer.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEvaluating ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Answer & Score</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* AI Interview Evaluation Results Box */}
      {evaluation && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Evaluation Diagnostic</span>
              <h3 className="text-2xl font-extrabold text-white font-display mt-0.5">
                Overall Interview Score: {evaluation.overallScore}%
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTryAgain}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5 Scoring Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-semibold">Technical Knowledge</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{evaluation.technicalScore}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-semibold">Communication</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{evaluation.communicationScore}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-semibold">Clarity</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">{evaluation.clarityScore}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-semibold">Confidence</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{evaluation.confidenceScore}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-semibold">Structure</span>
              <span className="text-lg font-bold text-purple-400 font-mono">{evaluation.structureScore}%</span>
            </div>
          </div>

          {/* AI Coaching Feedback */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2 text-xs">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" /> AI Interviewer Feedback & Structure
            </span>
            <p className="text-slate-200 leading-relaxed pt-1">{evaluation.feedback}</p>
            <div className="pt-2 text-slate-400">
              <strong className="text-indigo-300">Recommended Framework: </strong>
              <span>{evaluation.suggestedAnswerFramework}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
