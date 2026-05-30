import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Award, Clock, HelpCircle, User, LogOut, ChevronRight, BarChart2, ShieldAlert, Sparkles, History } from 'lucide-react';

export default function StudentDashboard({ onStartQuiz, onReviewQuiz }) {
  const { user, token, logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ stats: {}, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const qRes = await fetch(`${API_URL}/quizzes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const qData = await qRes.json();
        setQuizzes(qData);

        const lRes = await fetch(`${API_URL}/analytics/leaderboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const lData = await lRes.json();
        setLeaderboard(lData);

        const sRes = await fetch(`${API_URL}/analytics/student`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sData = await sRes.json();
        setUserStats(sData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-400 font-display">
          Synchronizing Assessment Telemetry...
        </p>
      </div>
    );
  }

  const completedQuizIds = new Set(userStats.history?.map(hist => {
    const qId = hist.quizId?._id || hist.quizId;
    return qId?.toString();
  }) || []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
      
      {/* Vercel style Header Panel */}
      <header className="glass-panel border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/10 border border-purple-500/25 rounded-full p-2.5 flex items-center justify-center">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Welcome Back, {user.username}!</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-display">Student Portal</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Stripe-style Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Quizzes Completed</p>
          <h2 className="text-4xl font-extrabold premium-gradient-text">
            {userStats.stats?.quizzesTaken || 0}
          </h2>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Cumulative Points</p>
          <h2 className="text-4xl font-extrabold premium-gradient-text">
            {userStats.stats?.totalScore || 0}
          </h2>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Average Score Accuracy</p>
          <h2 className="text-4xl font-extrabold premium-gradient-text">
            {userStats.stats?.averageScore || 0}
          </h2>
        </div>
      </div>

      {/* Main Splits Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (Quizzes & History) */}
        <div className="lg:col-span-2 space-y-10">
          
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Available Assessments
            </h3>
            
            <div className="space-y-6">
              {quizzes.length === 0 ? (
                <div className="glass-panel border border-white/10 rounded-2xl p-10 text-center text-slate-400">
                  No active assessment panels have been configured by administrators.
                </div>
              ) : (
                quizzes.map(quiz => {
                  const isAttempted = completedQuizIds.has(quiz._id.toString());
                  const hasNoQuestions = !quiz.questionCount || quiz.questionCount === 0;

                  return (
                    <div key={quiz._id} className="glass-panel glass-panel-interactive border border-white/10 rounded-2xl p-8 relative overflow-hidden flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-bold text-white">{quiz.title}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md font-display ${
                          quiz.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                          quiz.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 leading-relaxed flex-grow">
                        {quiz.description || 'No summary parameters provided for this quiz.'}
                      </p>

                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-display">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{quiz.timeLimit} Mins</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-display">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{quiz.questionCount || 0} MCQs</span>
                        </div>
                        {quiz.negativeMarking > 0 && (
                          <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5 text-xs text-red-400 font-display">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>-{quiz.negativeMarking} Penalty</span>
                          </div>
                        )}
                      </div>

                      <button
                        className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-xs font-bold uppercase tracking-wider self-start transition-all duration-300 ${
                          isAttempted 
                            ? 'bg-white/3 border border-white/10 text-slate-400 cursor-not-allowed opacity-60' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5'
                        }`}
                        onClick={() => onStartQuiz(quiz)}
                        disabled={hasNoQuestions || isAttempted}
                      >
                        {hasNoQuestions 
                          ? 'No Questions Available' 
                          : isAttempted 
                            ? 'Assessment Completed' 
                            : 'Launch Assessment'}
                        {!isAttempted && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Table history */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" /> Completed Attempts Log
            </h3>
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden p-6">
              {userStats.history?.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-6">
                  No logged quiz sessions. Complete your first quiz to view stats!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Assessment</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Final Grade</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Accuracy (C/W/S)</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Attempt Date</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userStats.history.map(hist => (
                        <tr key={hist._id} className="hover:bg-white/1 transition-colors">
                          <td className="py-4 text-sm font-semibold text-white">{hist.quizId?.title || 'Deleted Quiz'}</td>
                          <td className="py-4">
                            <span className="inline-block bg-purple-500/10 text-purple-400 font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-display">
                              {hist.score} pts
                            </span>
                          </td>
                          <td className="py-4 text-sm text-slate-400">
                            <span className="text-emerald-400 font-semibold">{hist.correctAnswersCount}</span> /{' '}
                            <span className="text-red-400 font-semibold">{hist.wrongAnswersCount}</span> /{' '}
                            <span className="text-slate-500">{hist.skippedAnswersCount}</span>
                          </td>
                          <td className="py-4 text-xs text-slate-500 font-display">{new Date(hist.completedAt).toLocaleDateString()}</td>
                          <td className="py-4 text-right">
                            {hist.quizId ? (
                              <button
                                onClick={() => onReviewQuiz(hist.quizId, hist._id)}
                                className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-md font-display transition-all duration-300"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Live Leaderboards) */}
        <div>
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6 sticky top-12">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Award className="w-5 h-5 text-cyan-400 animate-bounce" />
              <h3 className="text-md font-bold tracking-tight text-white">Global Leaderboard</h3>
            </div>

            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">
                  Assessment records will compile upon initial student completions.
                </p>
              ) : (
                leaderboard.map((student, index) => {
                  const isCurrentUser = student.userId === user._id;
                  return (
                    <div 
                      key={student.userId} 
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border transition-all duration-300 ${
                        isCurrentUser 
                          ? 'bg-purple-500/8 border-purple-500/30 shadow-lg shadow-purple-500/5' 
                          : 'bg-white/2 border-white/5 hover:bg-white/4'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-sm font-extrabold w-6 text-center ${
                          index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-white truncate">{student.username}</span>
                          <span className="block text-[10px] text-slate-500 font-display">{student.totalQuizzesTaken} tests taken</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-cyan-400 font-display">{student.totalScore} pts</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
