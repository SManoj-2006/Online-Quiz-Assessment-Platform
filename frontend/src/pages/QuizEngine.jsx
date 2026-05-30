import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';

export default function QuizEngine({ quiz, reviewAttemptId, onFinished }) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  
  const endTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const handleSubmitRef = useRef(null);

  useEffect(() => {
    const startQuizEngine = async () => {
      try {
        if (reviewAttemptId) {
          const res = await fetch(`${API_URL}/analytics/attempts/${reviewAttemptId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setQuestions(data.questions);
            
            const answersMap = {};
            if (data.attempt && data.attempt.answers) {
              data.attempt.answers.forEach(ans => {
                answersMap[ans.questionId] = ans.selectedOption;
              });
            }
            setSelectedAnswers(answersMap);
            setResult(data.attempt);
            setSubmitted(true);
            setShowReview(true);
          } else {
            alert('Failed to load past attempt details.');
          }
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/quizzes/${quiz._id}/questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setQuestions(data);

        const storageKey = `quiz_end_time_${quiz._id}`;
        const savedEndTime = localStorage.getItem(storageKey);
        
        let targetEndTime;
        if (savedEndTime) {
          targetEndTime = Number(savedEndTime);
        } else {
          targetEndTime = Date.now() + (quiz.timeLimit * 60 * 1000);
          localStorage.setItem(storageKey, targetEndTime.toString());
        }
        endTimeRef.current = targetEndTime;

        const savedAnswersKey = `quiz_answers_${quiz._id}`;
        const savedAnswers = localStorage.getItem(savedAnswersKey);
        if (savedAnswers) {
          setSelectedAnswers(JSON.parse(savedAnswers));
        }

        const remaining = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleAutoSubmit();
        }
      } catch (err) {
        console.error('Error starting quiz engine:', err);
      } finally {
        setLoading(false);
      }
    };

    startQuizEngine();
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [quiz, token, reviewAttemptId]);

  useEffect(() => {
    if (loading || submitted) return;

    timerIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        console.log('Time limit reached! Automatically submitting quiz.');
        handleSubmitRef.current(true);
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [loading, submitted]);

  const selectOption = (questionId, optionIndex) => {
    const updated = {
      ...selectedAnswers,
      [questionId]: optionIndex
    };
    setSelectedAnswers(updated);
    localStorage.setItem(`quiz_answers_${quiz._id}`, JSON.stringify(updated));
  };

  const handleSubmit = async (isAuto = false) => {
    if (submitting || submitted) return;
    
    if (!isAuto && !window.confirm('Are you sure you want to submit your assessment?')) {
      return;
    }

    setSubmitting(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const formattedAnswers = questions.map(q => ({
      questionId: q._id,
      selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null
    }));

    const timeTaken = (quiz.timeLimit * 60) - timeRemaining;

    try {
      const res = await fetch(`${API_URL}/quizzes/${quiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeTaken
        })
      });

      if (res.ok) {
        const resultData = await res.json();
        setResult(resultData);
        setSubmitted(true);
        
        localStorage.removeItem(`quiz_end_time_${quiz._id}`);
        localStorage.removeItem(`quiz_answers_${quiz._id}`);
      } else {
        alert('Failed to submit results. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      alert('Network error submitting quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  handleSubmitRef.current = handleSubmit;

  const handleAutoSubmit = () => {
    console.log('Time limit reached! Automatically submitting quiz.');
    handleSubmit(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="w-12 h-12 border-2 border-white/10 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-400 font-display">
          Launching interactive timed player...
        </p>
      </div>
    );
  }

  // Display results overview screen upon submit
  if (submitted && result) {
    if (showReview) {
      return (
        <div className="w-full max-w-4xl mx-auto px-6 py-12 relative z-10 space-y-8 animate-float">
          <div className="glass-panel border border-white/10 rounded-2xl p-8 md:p-10 space-y-8">
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" /> Graded Assessment Review
              </h2>
              <p className="text-sm text-slate-400 mt-2 font-display">
                {quiz.title} • Graded Score: <span className="text-cyan-400 font-bold">{result.score} pts</span>
              </p>
            </div>
            
            <div className="space-y-6">
              {result.questions && result.questions.map((q, qIdx) => {
                const selectedOpt = selectedAnswers[q._id];
                const isCorrect = selectedOpt !== undefined && Number(selectedOpt) === Number(q.correctAnswer);
                const isSkipped = selectedOpt === undefined || selectedOpt === null;

                return (
                  <div key={q._id} className="glass-panel border border-white/10 rounded-xl p-6 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-[3px] h-full" style={{
                      backgroundColor: isCorrect ? 'var(--color-success)' : isSkipped ? 'var(--text-muted)' : 'var(--color-danger)'
                    }} />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="text-md font-semibold text-white leading-relaxed">
                        {qIdx + 1}. {q.questionText}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md font-display flex-shrink-0 ${
                        isCorrect ? 'bg-emerald-500/15 text-emerald-400' :
                        isSkipped ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {isCorrect ? `Correct (+${q.points} pt)` : isSkipped ? 'Skipped (0 pt)' : `Incorrect (-${quiz.negativeMarking || 0} pt)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((option, oIdx) => {
                        const isStudentChoice = selectedOpt === oIdx;
                        const isCorrectAns = q.correctAnswer === oIdx;

                        let borderClass = 'border-white/5';
                        let bgClass = 'bg-white/1';

                        if (isCorrectAns) {
                          borderClass = 'border-emerald-500/35';
                          bgClass = 'bg-emerald-500/10';
                        } else if (isStudentChoice && !isCorrect) {
                          borderClass = 'border-red-500/35';
                          bgClass = 'bg-red-500/10';
                        }

                        return (
                          <div 
                            key={oIdx} 
                            className={`flex items-center border rounded-lg p-3.5 gap-4 transition-all duration-300 ${borderClass} ${bgClass}`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display ${
                              isCorrectAns ? 'bg-emerald-500 text-white' : 
                              isStudentChoice ? 'bg-red-500 text-white' : 'border border-slate-400 text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="text-sm text-slate-200">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-white/10 pt-6 gap-4 font-display">
              <button 
                className="bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
                onClick={() => setShowReview(false)}
              >
                Back to Scorecard
              </button>
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-lg shadow-purple-500/20 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={onFinished}
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-[500px] mx-auto px-6 py-12 relative z-10 flex items-center justify-center min-h-[80vh]">
        <div className="glass-panel border border-white/10 rounded-2xl p-8 md:p-10 text-center w-full flex flex-col items-center animate-float">
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-full p-4 mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight premium-gradient-text mb-1">
            Assessment Finished
          </h2>
          <p className="text-sm text-slate-400 mb-8 font-display">{quiz.title}</p>
          
          <div className="bg-white/2 border border-white/5 rounded-2xl py-6 px-10 w-full mb-8 relative overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Final Score</p>
            <h1 className="text-4xl font-black text-white">{result.score} pts</h1>
            <p className="text-xs font-bold text-cyan-400 mt-2 font-display">
              Accuracy: {Math.round((result.correctAnswersCount / result.totalQuestions) * 100)}%
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-white/1 border border-white/5 rounded-xl p-3.5 flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-2" />
              <span className="text-md font-bold text-white leading-none">{result.correctAnswersCount}</span>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase font-display">Correct</span>
            </div>
            <div className="bg-white/1 border border-white/5 rounded-xl p-3.5 flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mb-2" />
              <span className="text-md font-bold text-white leading-none">{result.wrongAnswersCount}</span>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase font-display">Wrong</span>
            </div>
            <div className="bg-white/1 border border-white/5 rounded-xl p-3.5 flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mb-2" />
              <span className="text-md font-bold text-white leading-none">{result.skippedAnswersCount}</span>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase font-display">Skipped</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/4 border border-white/5 rounded-lg px-4 py-2 text-xs text-slate-400 mb-8 font-display">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Duration Taken: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span>
          </div>

          <div className="flex w-full gap-4 font-display">
            <button 
              className="flex-1 bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5" 
              onClick={() => setShowReview(true)}
            >
              Review Answers
            </button>
            <button 
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-lg shadow-purple-500/20 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 animate-glow" 
              onClick={onFinished}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];

  const getTimerColor = () => {
    if (timeRemaining <= 30) return 'text-red-500 border-red-500/35';
    if (timeRemaining <= 120) return 'text-amber-500 border-amber-500/35';
    return 'text-cyan-400 border-cyan-500/35';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-8">
      
      {/* Top Banner Bar */}
      <div className="glass-panel border border-white/10 rounded-2xl flex justify-between items-center px-8 py-5">
        <div>
          <h3 className="text-md font-bold text-white">{quiz.title}</h3>
          <p className="text-xs text-slate-400 font-display">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        
        <div className={`flex items-center border rounded-lg px-4 py-2 bg-white/1 transition-all duration-300 font-display ${getTimerColor()}`}>
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-extrabold text-sm tracking-widest">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Section: Question and Options */}
        <div className="lg:col-span-2 glass-panel border border-white/10 rounded-2xl p-8 md:p-10 space-y-10">
          {activeQuestion ? (
            <div>
              <h3 className="text-lg font-medium text-slate-100 leading-relaxed mb-8">
                {currentIndex + 1}. {activeQuestion.questionText}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-10">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[activeQuestion._id] === idx;
                  return (
                    <button 
                      key={idx}
                      onClick={() => selectOption(activeQuestion._id, idx)}
                      className={`flex items-center w-full border rounded-xl p-4.5 text-left cursor-pointer transition-all duration-300 gap-4 ${
                        isSelected 
                          ? 'bg-purple-500/12 border-purple-500/40' 
                          : 'bg-white/2 border-white/5 hover:bg-white/4'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display ${
                        isSelected ? 'bg-purple-500 text-white' : 'border border-slate-500 text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between border-t border-white/10 pt-8 font-display gap-3 flex-wrap">
                <button 
                  className="bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                <button 
                  className="bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center"
                  onClick={() => selectOption(activeQuestion._id, null)}
                >
                  Clear Choice
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button 
                    className="bg-white/3 hover:bg-white/8 border border-white/10 text-slate-200 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-lg shadow-emerald-500/20 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 animate-glow"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Finish Assessment'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No questions loaded for this quiz.</p>
          )}
        </div>

        {/* Right Section: Progress Tracking Matrix */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase border-b border-white/10 pb-4">Assessment Matrix</h4>
          
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q._id] !== undefined && selectedAnswers[q._id] !== null;
              const isCurrent = idx === currentIndex;
              return (
                <button 
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`aspect-square rounded-lg text-xs font-extrabold flex items-center justify-center transition-all duration-200 border ${
                    isCurrent 
                      ? 'border-cyan-400 text-white bg-cyan-500/10' 
                      : isAnswered 
                        ? 'border-purple-500/35 text-white bg-purple-500/20' 
                        : 'border-white/5 text-slate-500 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5 border-t border-white/10 pt-5 font-display text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-500/20 border border-purple-500/35" />
              <span>Answered Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md border border-white/5" />
              <span>Unanswered Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-cyan-500/10 border border-cyan-400" />
              <span>Current Cursor Position</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
