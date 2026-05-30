import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award, Clock, HelpCircle, ShieldAlert, Sparkles,
  Play, ArrowRight, Lock, CheckCircle2, Zap,
  Users, BarChart2, Check, X, ShieldCheck
} from 'lucide-react';

export default function PreLoginDashboard({ onAuthClick }) {

  // Pre-login interactive assessment sandbox state
  const [sandboxQuestionIndex, setSandboxQuestionIndex] = useState(0);
  const [sandboxSelectedAnswers, setSandboxSelectedAnswers] = useState({});
  const [sandboxFinished, setSandboxFinished] = useState(false);
  const [sandboxScore, setSandboxScore] = useState(null);

  // Mock public telemetry & quizzes for instant, smooth rendering
  const publicQuizzes = [
    {
      id: 'q1',
      title: 'Vercel Architecture & Edge Runtime',
      description: 'Test your understanding of global serverless edge deployment pipelines and caching layers.',
      difficulty: 'hard',
      timeLimit: 12,
      questionCount: 8,
      negativeMarking: 0.5,
      category: 'Infrastructure'
    },
    {
      id: 'q2',
      title: 'Advanced React Core Dynamics',
      description: 'Evaluate knowledge on fiber reconcilers, server action states, and concurrent rendering.',
      difficulty: 'medium',
      timeLimit: 10,
      questionCount: 10,
      negativeMarking: 0.25,
      category: 'Frontend Engineering'
    },
    {
      id: 'q3',
      title: 'Advanced Cryptographic Ledgers',
      description: 'Analyze security mechanics of zero-knowledge proofs and asymmetric protocol envelopes.',
      difficulty: 'hard',
      timeLimit: 15,
      questionCount: 6,
      negativeMarking: 1.0,
      category: 'Cyber Security'
    }
  ];

  const sandboxQuestions = [
    {
      text: "Which of the following is true regarding React 19 Concurrent Rendering?",
      options: [
        "It blocks the main execution thread completely until renders finish.",
        "It allows React to interrupt a render in progress to handle high-priority user inputs.",
        "It deprecates state-driven re-renders entirely.",
        "It forces synchronous script hydration across all DOM segments."
      ],
      correctIndex: 1,
      points: 4,
      explanation: "React 19 Concurrent Rendering splits rendering work into non-blocking chunks, allowing the browser to respond to urgent inputs immediately."
    },
    {
      text: "With Vercel Edge Networks, where are Serverless Actions executed by default?",
      options: [
        "In a single centralized AWS datacenter in Northern Virginia.",
        "Directly in the client's browser using client-side service workers.",
        "At geographically distributed nodes closest to the requesting client.",
        "Through virtualized physical servers hosted only in local state systems."
      ],
      correctIndex: 2,
      points: 4,
      explanation: "Vercel Edge Functions run globally across Vercel's edge network, maximizing speed and minimizing latency by serving clients close to their physical locations."
    },
    {
      text: "How does negative marking optimize test data accuracy in technical assessments?",
      options: [
        "By mathematically neutralizing random blind guessing distributions.",
        "By enforcing mandatory failure thresholds on student scores.",
        "By forcing participants to select multiple answers per question.",
        "By slowing down the execution timer limits dynamically."
      ],
      correctIndex: 0,
      points: 4,
      explanation: "Negative marking penalizes incorrect attempts, making blind guessing risky and stabilizing telemetry scores around true knowledge distributions."
    }
  ];

  const publicLeaderboard = [
    { username: 'alex_edge', score: 384, accuracy: 98, avatar: 'AE' },
    { username: 'linear_flow', score: 372, accuracy: 95, avatar: 'LF' },
    { username: 'react_guru', score: 360, accuracy: 93, avatar: 'RG' }
  ];

  const handleSandboxOptionSelect = (idx) => {
    setSandboxSelectedAnswers({
      ...sandboxSelectedAnswers,
      [sandboxQuestionIndex]: idx
    });
  };

  const handleSandboxNext = () => {
    if (sandboxQuestionIndex < sandboxQuestions.length - 1) {
      setSandboxQuestionIndex(prev => prev + 1);
    } else {
      // Grade sandbox
      let score = 0;
      sandboxQuestions.forEach((q, qidx) => {
        const choice = sandboxSelectedAnswers[qidx];
        if (choice === q.correctIndex) {
          score += q.points;
        } else if (choice !== undefined) {
          score -= 1.0; // Simulated negative marking penalty
        }
      });
      setSandboxScore(score);
      setSandboxFinished(true);
    }
  };

  const resetSandbox = () => {
    setSandboxQuestionIndex(0);
    setSandboxSelectedAnswers({});
    setSandboxFinished(false);
    setSandboxScore(null);
  };

  const triggerAuthOpen = (loginMode) => {
    if (onAuthClick) {
      onAuthClick(loginMode);
    }
  };

  return (
    <div className="w-full relative min-h-screen text-slate-100 overflow-x-hidden">

      {/* Immersive background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <nav className="relative z-20 border-b border-white/5 bg-slate-950/60 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-2 flex items-center justify-center">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Aura Systems
              </span>
              <span className="block text-[8px] tracking-widest text-slate-500 uppercase font-display">Interactive Ecosystem</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => triggerAuthOpen(true)}
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => triggerAuthOpen(false)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Page Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-20">

        {/* HERO SECTION split with Sandbox player */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column Text details */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1 text-xs text-purple-300 font-display">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Futuristic Timed MCQ Analytics Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Online Quiz and<br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                Assessment Platform
              </span>
            </h1>

            <p className="text-sm sm:text-md text-slate-400 max-w-xl leading-relaxed">
              Experience an immersive celestial space-dark platform featuring state-preserving count timers, negative marking calibrations, real-time telemetry metrics, and anti-cheat tracking designed for performance-obsessed organizations.
            </p>

            <div className="flex gap-4 pt-2 font-display">
              <button
                onClick={() => triggerAuthOpen(false)}
                className="inline-flex items-center gap-2 bg-white/4 hover:bg-white/8 border border-white/10 text-white px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Create Student Account <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Right Column Interactive Sandbox */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-cyan-500/10 rounded-3xl blur-2xl pointer-events-none" />
            <div className="glass-panel border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col min-h-[380px] shadow-2xl">

              {/* Card headers */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Interactive Sandbox Demo</span>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-display">
                  No Login Required
                </span>
              </div>

              {!sandboxFinished ? (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500 font-display">
                        Question {sandboxQuestionIndex + 1} of {sandboxQuestions.length}
                      </span>
                      <span className="text-[10px] font-bold text-red-400 font-display">
                        -1.0 Penalty Active
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-relaxed">
                      {sandboxQuestions[sandboxQuestionIndex].text}
                    </h4>

                    <div className="space-y-2">
                      {sandboxQuestions[sandboxQuestionIndex].options.map((opt, oIdx) => {
                        const isSelected = sandboxSelectedAnswers[sandboxQuestionIndex] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSandboxOptionSelect(oIdx)}
                            className={`w-full text-left p-3.5 text-xs rounded-xl border transition-all duration-300 flex items-center gap-3 ${isSelected
                                ? 'bg-purple-500/15 border-purple-500/40 text-white'
                                : 'bg-white/2 border-white/5 hover:bg-white/4 text-slate-300'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-purple-500 text-white' : 'border border-slate-600 text-slate-400'
                              }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleSandboxNext}
                    disabled={sandboxSelectedAnswers[sandboxQuestionIndex] === undefined}
                    className="w-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider py-3 rounded-lg mt-6 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sandboxQuestionIndex < sandboxQuestions.length - 1 ? 'Next Question' : 'Compute Grade'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-between items-center text-center py-6">
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-full p-3.5 mb-2">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">Grading Complete!</h3>

                    <div className="bg-white/2 border border-white/5 rounded-2xl py-4 px-8 w-full relative overflow-hidden">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-display">Sandbox Final Score</p>
                      <h2 className="text-3xl font-black text-white">{sandboxScore} / 12 pts</h2>
                    </div>

                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      This represents how our backend negative marking engine validates scores instantly. Unlock full statistics tracking by registering.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mt-6 font-display">
                    <button
                      onClick={resetSandbox}
                      className="bg-white/3 hover:bg-white/6 border border-white/5 text-slate-300 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => triggerAuthOpen(false)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Join Platform
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </section>

        {/* Dynamic Telemetry / Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-full p-2.5 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">State-Preserved Timers</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Anti-cheat time tracking holds countdown states safely in background caches. Reloads won't delay completion metrics.
            </p>
          </div>

          <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            <div className="bg-purple-500/10 border border-purple-500/25 rounded-full p-2.5 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Interactive Leaderboard</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Dynamic rankings list top students automatically based on scoring metrics and speed telemetry calculations.
            </p>
          </div>

          <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
            <div className="bg-pink-500/10 border border-pink-500/25 rounded-full p-2.5 mb-4">
              <BarChart2 className="w-5 h-5 text-pink-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Telemetry Logs</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Administrators audit precise student attempts logs, tracking accurate correct/wrong options and time intervals.
            </p>
          </div>
        </section>

        {/* Public Quizzes Preview and Leaderboard Podium split */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: 2 Columns of Quizzes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Explore Public Assessments
              </h3>
              <span className="text-[10px] text-slate-400 font-display">Authentication Required for Completion</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {publicQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-white/15 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-display">
                        {quiz.category}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 font-display">
                        {quiz.difficulty}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {quiz.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {quiz.description}
                    </p>

                    <div className="flex gap-4 text-[10px] text-slate-500 font-display">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> {quiz.timeLimit} Mins
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> {quiz.questionCount} MCQs
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAuthOpen(true)}
                    className="w-full bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg mt-6 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
                    <span>Launch Panel</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Leaderboard Podium Preview */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" /> Public Hall of Fame
              </h3>
            </div>

            <div className="space-y-3">
              {publicLeaderboard.map((student, idx) => (
                <div
                  key={student.username}
                  className="flex justify-between items-center px-4 py-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black w-6 text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-amber-700'
                      }`}>
                      #{idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold text-[9px] flex items-center justify-center font-display">
                      {student.avatar}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white">{student.username}</span>
                      <span className="block text-[8px] text-slate-500 font-display">Accuracy {student.accuracy}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-cyan-400 font-display">{student.score} pts</span>
                </div>
              ))}
            </div>

            <div className="bg-white/1 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Take timed assessments to get graded automatically and ranked among the elite developers!
              </p>
              <button
                onClick={() => triggerAuthOpen(false)}
                className="text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 mt-2 font-display inline-block transition-colors"
              >
                Join Hall of Fame →
              </button>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
