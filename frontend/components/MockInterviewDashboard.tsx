import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  InterviewQuestion,
  InterviewRole,
  InterviewDifficulty,
  InputMode,
  CandidateSubmission,
  EvaluationResult,
  InterviewSessionHistoryItem,
  DimensionalMetric,
} from '../types/mockInterview';
import {
  MOCK_QUESTIONS_DATABASE,
  MOCK_HISTORICAL_SESSIONS,
  MockInterviewService,
} from '../services/mockInterviewService';

// ============================================================================
// 1. SUB-COMPONENT: INTERVIEW HEADER
// ============================================================================
interface InterviewHeaderProps {
  currentRole: InterviewRole;
  currentDifficulty: InterviewDifficulty;
  roundTitle: string;
  roundIndex: number;
  totalRounds: number;
  onRoleChange: (role: InterviewRole) => void;
  onDifficultyChange: (diff: InterviewDifficulty) => void;
  onOpenHistory: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  currentRole,
  currentDifficulty,
  roundTitle,
  roundIndex,
  totalRounds,
  onRoleChange,
  onDifficultyChange,
  onOpenHistory,
}) => {
  const roles: InterviewRole[] = [
    'Fullstack Engineer',
    'AI/ML Engineer',
    'Product Manager',
    'DevOps/SRE',
    'Distributed Systems Architect',
  ];

  const difficulties: InterviewDifficulty[] = ['Junior', 'Mid-Level', 'Senior', 'FAANG-level'];

  return (
    <header className="w-full bg-[#0a0f1d]/85 backdrop-blur-xl border-b border-indigo-500/20 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Progress Tracker */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-violet-500/30 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Dron AI <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 font-mono">NeuroMock v2.4</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-cyan-400 font-medium tracking-wide">
                Round {roundIndex} of {totalRounds}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 truncate max-w-xs">{roundTitle}</span>
            </div>
          </div>
        </div>

        {/* Controls: Target Role & Difficulty Toggle & History Drawer */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Dropdown */}
          <div className="relative">
            <label className="sr-only">Target Role</label>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as InterviewRole)}
              aria-label="Target Role Selector"
              className="bg-[#0f172a]/90 text-slate-200 border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer shadow-inner"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-[#0a0f1d] text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Segmented Toggle */}
          <div className="flex items-center bg-[#0f172a]/90 border border-indigo-500/30 rounded-lg p-0.5">
            {difficulties.map((diff) => {
              const active = currentDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onDifficultyChange(diff)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* History / Performance Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Past Sessions</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// 2. SUB-COMPONENT: QUESTION DISPLAY BANNER
// ============================================================================
interface QuestionCardProps {
  question: InterviewQuestion;
  ttsActive: boolean;
  onToggleTTS: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  ttsActive,
  onToggleTTS,
}) => {
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [personaExpanded, setPersonaExpanded] = useState(false);

  return (
    <div className="w-full bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.45)] relative overflow-hidden">
      {/* Subtle glowing radial background */}
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner with Category Pill & Audio TTS Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            {question.category}
          </span>
          <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
            {question.difficulty}
          </span>
        </div>

        {/* Read Question (Text-to-Speech Button) */}
        <button
          onClick={onToggleTTS}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            ttsActive
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
              : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}
        >
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
          </svg>
          <span>{ttsActive ? 'Playing Audio...' : 'Read Question (TTS)'}</span>
        </button>
      </div>

      {/* Primary Question Title */}
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
        {question.title}
      </h2>

      {/* Scenario / Description */}
      <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-5 font-normal">
        {question.scenario}
      </p>

      {/* Expandable Accordions: Interviewer Persona & Hints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
        {/* Persona Accordion */}
        <div className="bg-[#0a0f1d]/60 rounded-xl border border-indigo-500/15 p-3.5 transition-all">
          <button
            onClick={() => setPersonaExpanded(!personaExpanded)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Interviewer Persona: {question.interviewerPersona.name}</span>
            </div>
            <span className="text-slate-400 text-xs">{personaExpanded ? 'Hide' : 'View'}</span>
          </button>

          {personaExpanded && (
            <div className="mt-3 text-xs text-slate-300 space-y-2 animate-fadeIn">
              <p className="text-slate-400 italic">{question.interviewerPersona.title}</p>
              <p className="leading-relaxed">{question.interviewerPersona.expectations}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {question.interviewerPersona.focusAreas.map((area, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/20 text-[10px]">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hints Accordion */}
        <div className="bg-[#0a0f1d]/60 rounded-xl border border-indigo-500/15 p-3.5 transition-all">
          <button
            onClick={() => setHintsExpanded(!hintsExpanded)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Architectural Hints ({question.hints.length})</span>
            </div>
            <span className="text-slate-400 text-xs">{hintsExpanded ? 'Hide' : 'Reveal'}</span>
          </button>

          {hintsExpanded && (
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 list-disc list-inside animate-fadeIn">
              {question.hints.map((hint, idx) => (
                <li key={idx} className="leading-relaxed text-slate-300">
                  <span className="text-slate-200">{hint}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. SUB-COMPONENT: CANDIDATE RESPONSE STUDIO
// ============================================================================
interface ResponseEditorProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  writtenAnswer: string;
  onAnswerChange: (val: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  timerSeconds: number;
  timerActive: boolean;
  cameraActive: boolean;
  onToggleCamera: () => void;
  onStartAnswering: () => void;
  onRedo: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  isEvaluating: boolean;
}

export const ResponseEditor: React.FC<ResponseEditorProps> = ({
  inputMode,
  onModeChange,
  writtenAnswer,
  onAnswerChange,
  isRecording,
  onToggleRecording,
  timerSeconds,
  timerActive,
  cameraActive,
  onToggleCamera,
  onStartAnswering,
  onRedo,
  onSkip,
  onSubmit,
  isEvaluating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Format timer MM:SS
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timerSeconds <= 30 && timerSeconds > 0;
  const wordCount = useMemo(() => {
    return writtenAnswer.trim().split(/\s+/).filter(Boolean).length;
  }, [writtenAnswer]);

  // Webcam stream management
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        .then((s) => {
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera permission denied, fallback to simulated pipeline
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Animated Audio Waveform for Voice Mode
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      if (!isRecording) {
        // Idle flat neon line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      // Active dynamic sinusoidal frequency wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#10b981');
      ctx.strokeStyle = gradient;

      for (let x = 0; x < width; x++) {
        const freq1 = Math.sin(x * 0.04 + phase) * 14;
        const freq2 = Math.sin(x * 0.08 - phase * 1.5) * 8;
        const freq3 = Math.cos(x * 0.02 + phase * 0.7) * 6;
        const y = height / 2 + (freq1 + freq2 + freq3) * (0.4 + Math.random() * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      animationFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  return (
    <div className="w-full bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.45)]">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        {/* Input Mode Tabs */}
        <div className="flex items-center gap-2 bg-[#0a0f1d]/80 p-1 rounded-xl border border-indigo-500/20">
          <button
            onClick={() => onModeChange('voice')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'voice'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎙️ Voice Mode</span>
            {isRecording && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          </button>
          <button
            onClick={() => onModeChange('written')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'written'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⌨️ Written Response</span>
          </button>
        </div>

        {/* Timer Countdown Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all ${
              isLowTime
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : timerSeconds === 0
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-900/80 border-slate-700 text-cyan-300'
            }`}
          >
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            3:00 Target SLA
          </span>
        </div>
      </div>

      {/* Main Studio Body: Response Input & Video PIP Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left / Primary Input Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {inputMode === 'voice' ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[#0a0f1d]/60 rounded-xl border border-indigo-500/15 min-h-[220px]">
              {/* Waveform Canvas */}
              <canvas
                ref={canvasRef}
                width={480}
                height={70}
                className="w-full max-w-md h-[70px] mb-6 rounded-lg"
              />

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={onToggleRecording}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    {isRecording ? (
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    ) : (
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    )}
                  </svg>
                  <span>{isRecording ? 'Stop Recording Response' : 'Click to Speak (Record)'}</span>
                </button>
                <p className="text-xs text-slate-400 font-mono text-center">
                  {isRecording
                    ? 'Capturing audio with spectral noise suppression...'
                    : 'Web Speech API active. Voice transcription auto-indexes below.'}
                </p>
              </div>

              {/* Real-time Transcription Stream Preview */}
              {writtenAnswer && (
                <div className="w-full mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
                  <span className="text-cyan-400 font-bold">Transcription Preview:</span>{' '}
                  {writtenAnswer}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[220px]">
              <textarea
                value={writtenAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Structure your answer systematically:
1. Architectural Assumptions & Scale Calculations
2. Core Component Design (Ingress, Messaging, State Store)
3. Failure Boundaries, Race Conditions, and Resiliency Protocols..."
                className="w-full h-56 bg-[#0a0f1d]/80 text-slate-200 border border-indigo-500/20 rounded-xl p-4 text-sm leading-relaxed focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none font-sans placeholder-slate-600 transition-all shadow-inner"
              />
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-2 px-1">
                <span>{wordCount} words</span>
                <span>{writtenAnswer.length} characters</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Simulated Video Preview & AI Telemetry Badges (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#0a0f1d]/70 rounded-xl border border-indigo-500/20 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Vision Telemetry
            </span>
            <button
              onClick={onToggleCamera}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              {cameraActive ? 'Use Cyber Avatar' : 'Toggle Live Camera'}
            </button>
          </div>

          {/* Video PIP or Cyber Avatar Display */}
          <div className="w-full h-36 bg-slate-950 rounded-lg border border-indigo-500/30 overflow-hidden relative flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500/30 via-violet-500/30 to-indigo-600/30 border border-cyan-400/40 flex items-center justify-center mb-1">
                  <svg className="w-7 h-7 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Simulated Candidate Feed</span>
              </div>
            )}

            {/* Neural Face Mesh Overlay Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Face Mesh: Locked
            </div>
          </div>

          {/* AI Behavioral Telemetry Pill Gauges */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Eye Contact</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>94%</span>
                <span className="text-[9px] text-slate-400 font-normal">Optimal</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Lighting & Audio</div>
              <div className="text-xs font-bold text-cyan-400">Optimal (48kHz)</div>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Speech Pacing</div>
              <div className="text-xs font-bold text-violet-300">135 WPM</div>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Filler Word Ratio</div>
              <div className="text-xs font-bold text-emerald-400">1.2% (Low)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {!timerActive && (
            <button
              onClick={onStartAnswering}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              Start Timer
            </button>
          )}

          <button
            onClick={onRedo}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
          >
            Redo Answer
          </button>

          <button
            onClick={onSkip}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all"
          >
            Skip Question ➔
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isEvaluating || (!writtenAnswer.trim() && !isRecording)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            isEvaluating
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)]'
          }`}
        >
          {isEvaluating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Evaluating Neural Model...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Submit for AI Evaluation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 4. SUB-COMPONENT: CIRCULAR READINESS SCORE GAUGE
// ============================================================================
interface ScoreGaugeProps {
  score: number;
  grade: 'Strong Hire' | 'Hire' | 'Borderline' | 'Needs Work';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, grade }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGradeColor = () => {
    switch (grade) {
      case 'Strong Hire':
        return { text: 'text-emerald-400', stroke: '#10b981', border: 'border-emerald-500/30' };
      case 'Hire':
        return { text: 'text-cyan-400', stroke: '#06b6d4', border: 'border-cyan-500/30' };
      case 'Borderline':
        return { text: 'text-amber-400', stroke: '#f59e0b', border: 'border-amber-500/30' };
      default:
        return { text: 'text-rose-400', stroke: '#f43f5e', border: 'border-rose-500/30' };
    }
  };

  const colors = getGradeColor();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0a0f1d]/80 rounded-2xl border border-indigo-500/20 shadow-inner">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#1e293b"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-white font-mono">
            {score}
            <span className="text-xs text-slate-400 font-sans">%</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-0.5">
            Readiness
          </span>
        </div>
      </div>

      {/* Grade Badge */}
      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900/90 border ${colors.border} ${colors.text} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
        {grade}
      </div>
    </div>
  );
};

// ============================================================================
// 5. SUB-COMPONENT: REAL-TIME AI FEEDBACK & EVALUATION REPORT
// ============================================================================
interface EvaluationReportProps {
  evaluation: EvaluationResult;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation }) => {
  const [sampleAnswerOpen, setSampleAnswerOpen] = useState(false);

  return (
    <div className="w-full bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/25 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-6">
      {/* Top Banner: Evaluation Summary */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
              AI Evaluation Report
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated {new Date(evaluation.evaluatedAt).toLocaleTimeString()}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white">
            Performance Breakdown & Verdict
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {evaluation.summaryFeedback}
          </p>
        </div>

        {/* Circular Gauge */}
        <div className="shrink-0 w-full lg:w-auto flex justify-center">
          <ScoreGauge score={evaluation.overallScore} grade={evaluation.grade} />
        </div>
      </div>

      {/* Dimensional Metric Bars */}
      <div>
        <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Core Dimensional Metrics (Out of 10)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.metrics.map((metric: DimensionalMetric) => {
            const percentage = (metric.score / 10) * 100;
            return (
              <div key={metric.key} className="bg-[#0a0f1d]/70 rounded-xl p-4 border border-indigo-500/15">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">{metric.label}</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {metric.score} <span className="text-slate-500">/ 10</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Grid: Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Key Strengths (Green Pills) */}
        <div className="bg-[#0a0f1d]/60 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Key Strengths Observed
            </h5>
          </div>

          <ul className="space-y-2">
            {evaluation.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Gaps & Red Flags (Amber Alerts) */}
        <div className="bg-[#0a0f1d]/60 rounded-xl p-4 border border-amber-500/25">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Critical Gaps & Red Flags
            </h5>
          </div>

          <ul className="space-y-2">
            {evaluation.criticalGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How to Answer Better (Gold Standard Expandable Accordion) */}
      <div className="bg-[#0a0f1d]/80 rounded-xl border border-indigo-500/20 p-4 transition-all">
        <button
          onClick={() => setSampleAnswerOpen(!sampleAnswerOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-xs">🏆</span>
            </div>
            <div>
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                "How to Answer Better" — Gold Standard Model Answer
              </h5>
              <p className="text-[11px] text-slate-400">
                Curated Staff-level benchmark with phase breakdown
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 hover:underline">
            {sampleAnswerOpen ? 'Collapse Answer' : 'Expand Answer'}
          </span>
        </button>

        {sampleAnswerOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
            <p className="text-xs text-slate-300 italic">
              {evaluation.goldStandardAnswer.summary}
            </p>

            {/* Breakdown Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {evaluation.goldStandardAnswer.breakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                  <div className="text-xs font-semibold text-violet-300 mb-1.5">{item.phase}</div>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {item.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Verbatim Sample Script */}
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">Verbatim Excerpt:</span>
              "{evaluation.goldStandardAnswer.verbatimAnswer}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 6. SUB-COMPONENT: PERFORMANCE RADAR & SESSION HISTORY DRAWER
// ============================================================================
interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: InterviewSessionHistoryItem[];
  onSelectSession: (session: InterviewSessionHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
}) => {
  if (!isOpen) return null;

  // Radar chart SVG calculations for skills
  const radarLabels = ['DSA', 'Architecture', 'Communication', 'Culture Fit', 'Problem Solving', 'Scalability'];
  const center = 110;
  const radius = 80;

  // Coordinate math
  const getCoordinates = (index: number, total: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Sample aggregate candidate radar polygon
  const candidateScores = [0.92, 0.95, 0.88, 0.90, 0.94, 0.96];
  const polygonPoints = candidateScores
    .map((score, i) => {
      const { x, y } = getCoordinates(i, 6, score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0a0f1d] border-l border-indigo-500/25 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Performance Analytics & History
              </h3>
              <p className="text-xs text-slate-400">Track preparation velocity across rounds</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SVG Radar Chart Widget */}
          <div className="bg-[#0f172a]/70 rounded-2xl p-4 border border-indigo-500/20 flex flex-col items-center">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
              Aggregate Skill Radar
            </h4>
            <div className="relative w-[220px] h-[220px]">
              <svg className="w-full h-full" viewBox="0 0 220 220">
                {/* Background Concentric Webs */}
                {[0.25, 0.5, 0.75, 1.0].map((ring, idx) => (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius * ring}
                    fill="none"
                    stroke="#1e293b"
                    strokeDasharray={ring === 1.0 ? '0' : '2,2'}
                  />
                ))}

                {/* Spoke lines */}
                {radarLabels.map((_, i) => {
                  const { x, y } = getCoordinates(i, 6, 1.0);
                  return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#1e293b" />;
                })}

                {/* Candidate Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(6, 182, 212, 0.25)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />

                {/* Point Dots */}
                {candidateScores.map((score, i) => {
                  const { x, y } = getCoordinates(i, 6, score);
                  return <circle key={i} cx={x} cy={y} r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1" />;
                })}
              </svg>
            </div>

            {/* Labels under radar */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {radarLabels.map((lbl, idx) => (
                <span key={idx} className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Past Sessions Table */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-3">
              Session Log History ({sessions.length})
            </h4>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-[#0f172a]/60 hover:bg-[#0f172a] transition-all rounded-xl p-3.5 border border-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {sess.date}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {sess.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate max-w-xs">
                      {sess.questionTitle}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sess.role} • {Math.floor(sess.durationSeconds / 60)}m {sess.durationSeconds % 60}s
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-cyan-300">{sess.overallScore}%</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{sess.grade}</div>
                    </div>
                    <button
                      onClick={() => onSelectSession(sess)}
                      className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs rounded-lg transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. ROOT MASTER COMPONENT: MOCK INTERVIEW DASHBOARD
// ============================================================================
export const MockInterviewDashboard: React.FC = () => {
  // Master Interactive State
  const [currentRole, setCurrentRole] = useState<InterviewRole>('Fullstack Engineer');
  const [currentDifficulty, setCurrentDifficulty] = useState<InterviewDifficulty>('Senior');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Filter questions according to role or show fallback
  const filteredQuestions = useMemo(() => {
    const matched = MOCK_QUESTIONS_DATABASE.filter(
      (q) => q.role === currentRole
    );
    return matched.length > 0 ? matched : MOCK_QUESTIONS_DATABASE;
  }, [currentRole]);

  const activeQuestion = filteredQuestions[currentQuestionIndex % filteredQuestions.length];

  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(
    MOCK_HISTORICAL_SESSIONS[0].evaluation
  );

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<InterviewSessionHistoryItem[]>(MOCK_HISTORICAL_SESSIONS);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      setIsRecording(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // SpeechSynthesis TTS playback
  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser.');
      return;
    }
    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${activeQuestion.title}. ${activeQuestion.scenario}`
      );
      utterance.rate = 1.0;
      utterance.onend = () => setTtsActive(false);
      utterance.onerror = () => setTtsActive(false);
      setTtsActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Voice Recording with Web Speech Recognition or Mock Transcription
  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimerActive(true);
      // Simulate live streaming speech recognition append
      if (!writtenAnswer) {
        setWrittenAnswer(
          'To design this system at scale, I first analyze the throughput requirements and state consistency constraints...'
        );
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleStartAnswering = () => {
    setTimerActive(true);
  };

  const handleRedo = () => {
    setWrittenAnswer('');
    setTimerSeconds(180);
    setTimerActive(false);
    setIsRecording(false);
  };

  const handleSkip = () => {
    handleRedo();
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setTimerActive(false);
    setIsRecording(false);

    const submission: CandidateSubmission = {
      questionId: activeQuestion.id,
      role: currentRole,
      difficulty: currentDifficulty,
      mode: inputMode,
      responseContent: writtenAnswer,
      timeElapsedSeconds: 180 - timerSeconds,
      telemetry: {
        eyeContactScore: 92,
        lightingQuality: 'Optimal',
        speechPacingWpm: 135,
        fillerWordsCount: 2,
        facialComposureScore: 90,
      },
      submittedAt: new Date().toISOString(),
    };

    // Simulate AI pipeline latency
    setTimeout(async () => {
      const evalResult = await MockInterviewService.evaluateSubmission(submission, activeQuestion);
      setCurrentEvaluation(evalResult);

      // Record into history
      const newSessionItem: InterviewSessionHistoryItem = {
        id: 'sess-' + Date.now(),
        date: 'Today',
        role: currentRole,
        difficulty: currentDifficulty,
        questionTitle: activeQuestion.title,
        category: activeQuestion.category,
        overallScore: evalResult.overallScore,
        grade: evalResult.grade,
        durationSeconds: 180 - timerSeconds,
        submission,
        evaluation: evalResult,
      };
      setSessions((prev) => [newSessionItem, ...prev]);
      setIsEvaluating(false);
    }, 1400);
  };

  const handleSelectHistorySession = (session: InterviewSessionHistoryItem) => {
    setCurrentEvaluation(session.evaluation);
    setWrittenAnswer(session.submission.responseContent);
    setHistoryDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Header & Role Selector */}
      <InterviewHeader
        currentRole={currentRole}
        currentDifficulty={currentDifficulty}
        roundTitle={activeQuestion.roundTitle}
        roundIndex={activeQuestion.roundIndex}
        totalRounds={activeQuestion.totalRounds}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setCurrentQuestionIndex(0);
        }}
        onDifficultyChange={setCurrentDifficulty}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
      />

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 2. Live Interview Simulator Card */}
        <section className="space-y-6">
          <QuestionCard
            question={activeQuestion}
            ttsActive={ttsActive}
            onToggleTTS={handleToggleTTS}
          />

          <ResponseEditor
            inputMode={inputMode}
            onModeChange={setInputMode}
            writtenAnswer={writtenAnswer}
            onAnswerChange={setWrittenAnswer}
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            timerSeconds={timerSeconds}
            timerActive={timerActive}
            cameraActive={cameraActive}
            onToggleCamera={() => setCameraActive(!cameraActive)}
            onStartAnswering={handleStartAnswering}
            onRedo={handleRedo}
            onSkip={handleSkip}
            onSubmit={handleSubmit}
            isEvaluating={isEvaluating}
          />
        </section>

        {/* 3. Real-Time AI Feedback & Evaluation Panel */}
        {currentEvaluation && (
          <section>
            <EvaluationReport evaluation={currentEvaluation} />
          </section>
        )}
      </main>

      {/* 4. Performance Analytics & History Drawer */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectHistorySession}
      />
    </div>
  );
};

export default MockInterviewDashboard;
