import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import PreLoginDashboard from './pages/PreLoginDashboard';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizEngine from './pages/QuizEngine';
import AdminDashboard from './pages/AdminDashboard';
import ParticleCanvas from './components/ParticleCanvas';
import { Sparkles } from 'lucide-react';

function DashboardRouter() {
  const { user, loading } = useAuth();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [reviewAttemptId, setReviewAttemptId] = useState(null);
  const [showAuthPage, setShowAuthPage] = useState(false);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} className="animate-glow" />
        <h4 style={styles.loadingText}>Syncing Credentials...</h4>
      </div>
    );
  }

  // Guest State -> Redirect to Public Interactive Dashboard or Aurora Sign Up Screen
  if (!user) {
    if (showAuthPage) {
      return (
        <AuthPage 
          onBackToDashboard={() => setShowAuthPage(false)} 
        />
      );
    }
    return (
      <PreLoginDashboard 
        onAuthClick={() => setShowAuthPage(true)} 
      />
    );
  }

  // Administrator Dashboard View
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // Student Timed Quiz Engine View (Standard or Review Mode)
  if (activeQuiz) {
    return (
      <QuizEngine 
        quiz={activeQuiz} 
        reviewAttemptId={reviewAttemptId}
        onFinished={() => {
          setActiveQuiz(null);
          setReviewAttemptId(null);
        }} 
      />
    );
  }

  // Student Dashboard View
  return (
    <StudentDashboard 
      onStartQuiz={(quiz) => setActiveQuiz(quiz)} 
      onReviewQuiz={(quiz, attemptId) => {
        setActiveQuiz(quiz);
        setReviewAttemptId(attemptId);
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div style={styles.appWrapper}>
        {/* Futuristic Floating Particles */}
        <ParticleCanvas />

        {/* Neon Background Decorative Orbs */}
        <div style={styles.orb1} />
        <div style={styles.orb2} />

        <main style={styles.mainContent}>
          <DashboardRouter />
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Aura Assessment Systems © 2026. Made with pair-programming excellence.</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

const styles = {
  appWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  mainContent: {
    flex: '1 0 auto',
    position: 'relative',
    zIndex: 2
  },
  footer: {
    flexShrink: 0,
    borderTop: '1px solid var(--glass-border)',
    background: 'rgba(10, 15, 29, 0.5)',
    backdropFilter: 'blur(8px)',
    padding: '20px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },
  footerContent: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90vh'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid var(--glass-border)',
    borderTop: '3px solid var(--accent-purple)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontFamily: 'var(--font-display)',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  // Celestial Background Glowing Effects
  orb1: {
    position: 'fixed',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
    zIndex: 1
  },
  orb2: {
    position: 'fixed',
    bottom: '-10%',
    right: '-10%',
    width: '60vw',
    height: '60vw',
    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
    zIndex: 1
  }
};

// Add raw CSS keyframe animations for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
