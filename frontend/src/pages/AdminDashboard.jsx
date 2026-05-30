import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { BarChart2, Plus, Trash2, Upload, FileText, Settings, LogOut, CheckCircle, ShieldAlert, FileCode, User } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  
  // Quiz Creation Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');

  // Bulk Upload State
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [pastedJSON, setPastedJSON] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'

  // Dashboard Data State
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState({ summary: {}, scoreRanges: {}, quizStats: [], attempts: [] });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ success: '', error: '' });
  const [submitting, setSubmitting] = useState(false);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuizId, setFilterQuizId] = useState('all');

  const loadAdminData = async () => {
    try {
      const qRes = await fetch(`${API_URL}/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const qData = await qRes.json();
      setQuizzes(qData);
      if (qData.length > 0 && !selectedQuizId) {
        setSelectedQuizId(qData[0]._id);
      }

      const aRes = await fetch(`${API_URL}/analytics/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const aData = await aRes.json();
      setAnalytics(aData);
    } catch (err) {
      console.error('Error loading admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setFeedback({ success: '', error: '' });
    if (!title) return;

    try {
      const res = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, timeLimit, negativeMarking, difficulty })
      });

      if (res.ok) {
        setFeedback({ success: 'Quiz assessment created successfully!', error: '' });
        setTitle('');
        setDescription('');
        setTimeLimit(10);
        setNegativeMarking(0);
        setDifficulty('medium');
        await loadAdminData();
      } else {
        const err = await res.json();
        setFeedback({ success: '', error: err.message || 'Failed to create quiz.' });
      }
    } catch (err) {
      setFeedback({ success: '', error: 'Network error creating quiz.' });
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('WARNING: Deleting this quiz will permanently delete all associated questions and attempts. Proceed?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setFeedback({ success: 'Quiz deleted successfully!', error: '' });
        await loadAdminData();
      } else {
        setFeedback({ success: '', error: 'Failed to delete quiz.' });
      }
    } catch (err) {
      setFeedback({ success: '', error: 'Network error deleting quiz.' });
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setFeedback({ success: '', error: '' });
    if (!selectedQuizId) {
      setFeedback({ success: '', error: 'Please select a target quiz first.' });
      return;
    }
    setSubmitting(true);

    try {
      let res;
      if (uploadMethod === 'file') {
        if (!uploadFile) {
          setFeedback({ success: '', error: 'Please select a JSON or CSV file to upload.' });
          setSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', uploadFile);
        res = await fetch(`${API_URL}/quizzes/${selectedQuizId}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        if (!pastedJSON) {
          setFeedback({ success: '', error: 'Please paste JSON question content.' });
          setSubmitting(false);
          return;
        }
        res = await fetch(`${API_URL}/quizzes/${selectedQuizId}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ pastedJSON })
        });
      }

      const data = await res.json();
      if (res.ok) {
        setFeedback({ success: data.message || 'Questions uploaded successfully!', error: '' });
        setUploadFile(null);
        setPastedJSON('');
        const fileInput = document.getElementById('bulk-file-input');
        if (fileInput) fileInput.value = '';
        await loadAdminData();
      } else {
        setFeedback({ success: '', error: data.message || 'Upload failed.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ success: '', error: 'Network error during bulk upload.' });
    } finally {
      setSubmitting(false);
    }
  };

  const sampleJSONTemplate = `[
  {
    "questionText": "What is the correct syntax to import a module in ES6?",
    "options": [
      "import { module } from 'file'",
      "require('file')",
      "importModule('file')",
      "include 'file'"
    ],
    "correctAnswer": 0,
    "points": 1
  }
]`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-400 font-display">
          Compiling administrator telemetry records...
        </p>
      </div>
    );
  }

  const { summary, scoreRanges, quizStats } = analytics;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
      
      {/* Admin Header */}
      <header className="glass-panel border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-pink-500/10 border border-pink-500/25 rounded-full p-2.5 flex items-center justify-center">
            <Settings className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">System Operations</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-pink-400 font-display">Administrator: {user.username}</p>
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

      {/* Telemetry Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Total Quizzes</p>
          <h2 className="text-3xl font-extrabold premium-gradient-text">{summary.totalQuizzes || 0}</h2>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Total Questions</p>
          <h2 className="text-3xl font-extrabold premium-gradient-text">{summary.totalQuestions || 0}</h2>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Registered Students</p>
          <h2 className="text-3xl font-extrabold premium-gradient-text">{summary.totalStudents || 0}</h2>
        </div>
        <div className="glass-panel border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-display">Attempts Graded</p>
          <h2 className="text-3xl font-extrabold premium-gradient-text">{summary.totalAttempts || 0}</h2>
        </div>
      </div>

      {/* Performance Distribution matrix bar chart */}
      <div className="glass-panel border border-white/10 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
          <BarChart2 className="w-5 h-5 text-cyan-400" /> Performance Distribution Matrix
        </h3>
        
        {summary.totalAttempts > 0 ? (
          <div className="space-y-6">
            <div className="flex h-4 w-full bg-white/2 border border-white/10 rounded-full overflow-hidden">
              {['excellent', 'good', 'average', 'poor'].map(range => {
                const count = scoreRanges[range] || 0;
                const percent = Math.round((count / summary.totalAttempts) * 100);
                if (percent === 0) return null;
                
                const colors = {
                  excellent: 'bg-emerald-500',
                  good: 'bg-cyan-500',
                  average: 'bg-amber-500',
                  poor: 'bg-red-500'
                };

                return (
                  <div 
                    key={range} 
                    className={`${colors[range]} h-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                    title={`${range.toUpperCase()}: ${count} attempts (${percent}%)`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white/1 border border-white/3 rounded-xl p-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <span className="block text-xs font-bold text-white">Excellent (80%+)</span>
                  <span className="block text-[10px] text-slate-400 font-display">{scoreRanges.excellent || 0} attempts</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/1 border border-white/3 rounded-xl p-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <div>
                  <span className="block text-xs font-bold text-white">Good (60-79%)</span>
                  <span className="block text-[10px] text-slate-400 font-display">{scoreRanges.good || 0} attempts</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/1 border border-white/3 rounded-xl p-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div>
                  <span className="block text-xs font-bold text-white">Average (40-59%)</span>
                  <span className="block text-[10px] text-slate-400 font-display">{scoreRanges.average || 0} attempts</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/1 border border-white/3 rounded-xl p-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div>
                  <span className="block text-xs font-bold text-white">Poor (&lt;40%)</span>
                  <span className="block text-[10px] text-slate-400 font-display">{scoreRanges.poor || 0} attempts</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-6">
            Awaiting student assessment submissions to compile score distributions.
          </p>
        )}
      </div>

      {/* Participant Performance Logs Section */}
      <div className="glass-panel border border-white/10 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
          <User className="w-5 h-5 text-purple-400" /> Participant Performance Logs
        </h3>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[240px]">
            <input 
              type="text"
              className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm"
              placeholder="Search by Student Username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-[220px]">
            <div className="relative">
              <select
                className="w-full bg-slate-900 border border-white/8 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm cursor-pointer appearance-none"
                value={filterQuizId}
                onChange={e => setFilterQuizId(e.target.value)}
              >
                <option value="all">All Quizzes</option>
                {quizzes.map(q => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Log Table */}
        {analytics.attempts && analytics.attempts.length > 0 ? (
          (() => {
            const filteredAttempts = analytics.attempts.filter(att => {
              const username = att.userId?.username?.toLowerCase() || '';
              const matchesSearch = username.includes(searchTerm.toLowerCase());
              const attQuizId = att.quizId?._id?.toString() || att.quizId?.toString() || '';
              const matchesQuiz = filterQuizId === 'all' || attQuizId === filterQuizId;
              return matchesSearch && matchesQuiz;
            });

            if (filteredAttempts.length === 0) {
              return (
                <p className="text-center text-sm text-slate-500 py-6">
                  No participant logs matching your query.
                </p>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Student</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Assessment</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Graded Score</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Accuracy (C/W/S)</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Duration</th>
                      <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAttempts.map(att => (
                      <tr key={att._id} className="hover:bg-white/1 transition-colors">
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{att.userId?.username || 'Anonymous'}</span>
                            <span className="text-[10px] text-slate-500 font-display">{att.userId?.email || 'No email'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-300">{att.quizId?.title || 'Deleted Quiz'}</td>
                        <td className="py-4">
                          <span className="inline-block bg-purple-500/10 text-purple-400 font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-display">
                            {att.score} pts
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-400">
                          <span className="text-emerald-400 font-semibold">{att.correctAnswersCount}</span> /{' '}
                          <span className="text-red-400 font-semibold">{att.wrongAnswersCount}</span> /{' '}
                          <span className="text-slate-500">{att.skippedAnswersCount}</span>
                        </td>
                        <td className="py-4 text-xs text-slate-500 font-display">{Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s</td>
                        <td className="py-4 text-xs text-slate-500 font-display">{new Date(att.completedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()
        ) : (
          <p className="text-center text-sm text-slate-500 py-6">
            Awaiting student quiz submissions to compile performance logs.
          </p>
        )}
      </div>

      {/* Alerts/Feedbacks */}
      {feedback.success && (
        <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-lg p-4 mb-5 text-left">
          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
          <span>{feedback.success}</span>
        </div>
      )}
      {feedback.error && (
        <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg p-4 mb-5 text-left">
          <ShieldAlert className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {/* Main Splits Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column (Create & Edit Quizzes) */}
        <div className="space-y-8">
          
          {/* Create Quiz Card */}
          <div className="glass-panel border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-bold tracking-tight text-white mb-6 flex items-center gap-2.5 border-b border-white/10 pb-4">
              <Plus className="w-5 h-5 text-purple-400" /> Create Assessment
            </h3>
            
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Quiz Title</label>
                <input
                  type="text"
                  className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm"
                  placeholder="e.g. JavaScript ES6 Core Concepts"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm h-20 resize-none"
                  placeholder="Provide scope details for students..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Time (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm"
                    required
                    value={timeLimit}
                    onChange={e => setTimeLimit(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Neg Marking</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm"
                    required
                    value={negativeMarking}
                    onChange={e => setNegativeMarking(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Difficulty</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-900 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm cursor-pointer appearance-none"
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-purple-500/20 text-xs tracking-wider uppercase mt-2">
                Register Quiz
              </button>
            </form>
          </div>

          {/* Active Quizzes Card */}
          <div className="glass-panel border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-bold tracking-tight text-white mb-6 border-b border-white/10 pb-4">Active Assessments</h3>
            
            {quizzes.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">
                No active assessments found in database.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Title</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Duration</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">MCQs</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {quizzes.map(q => (
                      <tr key={q._id} className="hover:bg-white/1 transition-colors">
                        <td className="py-3 text-sm font-semibold text-white">{q.title}</td>
                        <td className="py-3 text-sm text-slate-400 font-display">{q.timeLimit}m</td>
                        <td className="py-3 text-sm text-slate-400 font-display">{q.questionCount || 0}</td>
                        <td className="py-3">
                          <button 
                            className="text-red-500 hover:text-red-400 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteQuiz(q._id)}
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Bulk Uploader) */}
        <div>
          <div className="glass-panel border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 border-b border-white/10 pb-4">
              <Upload className="w-5 h-5 text-cyan-400" /> Bulk Import Questions
            </h3>

            {quizzes.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">
                Please create a quiz assessment first to enable bulk uploading.
              </p>
            ) : (
              <form onSubmit={handleBulkUpload} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Target Quiz</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-900 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-sm cursor-pointer appearance-none"
                      value={selectedQuizId}
                      onChange={e => setSelectedQuizId(e.target.value)}
                    >
                      {quizzes.map(q => (
                        <option key={q._id} value={q._id}>{q.title}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="flex border-b border-white/10 font-display">
                  <button
                    type="button"
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      uploadMethod === 'file' 
                        ? 'border-b-2 border-cyan-400 text-white' 
                        : 'border-b-0 text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setUploadMethod('file')}
                  >
                    <FileText className="w-4 h-4" /> JSON/CSV File
                  </button>
                  <button
                    type="button"
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      uploadMethod === 'paste' 
                        ? 'border-b-2 border-cyan-400 text-white' 
                        : 'border-b-0 text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setUploadMethod('paste')}
                  >
                    <FileCode className="w-4 h-4" /> Paste JSON
                  </button>
                </div>

                {uploadMethod === 'file' ? (
                  <div className="border-2 border-dashed border-white/10 hover:border-cyan-500/35 bg-white/1 rounded-xl p-8 text-center cursor-pointer transition-all duration-300">
                    <input
                      type="file"
                      id="bulk-file-input"
                      accept=".json,.csv"
                      className="hidden"
                      onChange={e => setUploadFile(e.target.files[0])}
                    />
                    <label htmlFor="bulk-file-input" className="flex flex-col items-center cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                      <span className="block text-xs font-semibold text-white">
                        {uploadFile ? uploadFile.name : 'Click to select JSON or CSV File'}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-display mt-1">Max file size: 5MB</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Raw Questions JSON List</label>
                    <textarea
                      className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition-all text-xs font-mono h-40 resize-none leading-relaxed"
                      placeholder={sampleJSONTemplate}
                      value={pastedJSON}
                      onChange={e => setPastedJSON(e.target.value)}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-cyan-500/20 text-xs tracking-wider uppercase animate-glow"
                  disabled={submitting}
                >
                  {submitting ? 'Parsing & Importing...' : 'Trigger Bulk Import'}
                </button>

              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
