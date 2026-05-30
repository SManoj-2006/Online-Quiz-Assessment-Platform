import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Circle, Eye, EyeOff,
  ArrowLeft, ShieldAlert, CheckCircle2
} from 'lucide-react';

const Chrome = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function AuthPage({ onBackToDashboard }) {
  const [isLogin, setIsLogin] = useState(true);

  // Custom First Name and Last Name fields mapping to username
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [usernameOrEmail, setUsernameOrEmail] = useState(''); // For login
  const [email, setEmail] = useState(''); // For signup
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(1);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(false);

    // Basic password validation for sign-up
    if (!isLogin && password.length < 8) {
      setError('Password requires at least 8 symbols.');
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        await login(usernameOrEmail, password);
      } else {
        const fullUsername = `${firstName.trim()} ${lastName.trim()}`;
        if (!fullUsername) {
          setError('First and Last name are required.');
          setSubmitting(false);
          return;
        }
        await register(fullUsername, email, password, role);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stagger variants for Hero reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 text-white">

      {/* 1. LEFT COLUMN (HERO & BACKGROUND VIDEO) */}
      <section className="relative w-[52%] hidden lg:flex flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">

        {/* Absolutely positioned source video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        {/* Hero Content Overlay (Staggered Animation) */}
        <motion.div
          className="z-10 w-full max-w-xs space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand/Logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Circle className="w-5 h-5 fill-white text-white" />
            <span className="text-xl font-semibold tracking-tight">Queries</span>
          </motion.div>

          {/* Heading Block */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h2 className="text-4xl font-medium tracking-tight whitespace-nowrap">
              {isLogin ? 'Welcome back' : 'Signup'}
            </h2>
            <p className="text-white/60 text-xs leading-relaxed">
              Click any question below to explore our platform features.
            </p>
          </motion.div>

          {/* Related interactive questions rendering */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveQuestion(1)}
                className="w-full text-left focus:outline-none block"
              >
                <StepItem number={1} text="How are timers secured?" active={activeQuestion === 1} />
              </button>
              {activeQuestion === 1 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-[11px] leading-relaxed pl-5 pr-2 pt-1 font-display"
                >
                  Timers use synchronized background offsets. Refreshing, closing, or clock tampering will not affect the official submission timestamp.
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveQuestion(2)}
                className="w-full text-left focus:outline-none block"
              >
                <StepItem number={2} text="Is negative marking supported?" active={activeQuestion === 2} />
              </button>
              {activeQuestion === 2 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-[11px] leading-relaxed pl-5 pr-2 pt-1 font-display"
                >
                  Yes. Administrators can configure custom negative point deductions per incorrect response to discourage blind guessing and align score accuracy.
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveQuestion(3)}
                className="w-full text-left focus:outline-none block"
              >
                <StepItem number={3} text="Can I inspect detailed scorecards?" active={activeQuestion === 3} />
              </button>
              {activeQuestion === 3 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-[11px] leading-relaxed pl-5 pr-2 pt-1 font-display"
                >
                  Absolutely. Post-submission, students and permitted admins can review color-coded question indices highlighting correct, incorrect, and skipped options.
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. RIGHT COLUMN (FORM & GUEST LOGINS) */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden relative">

        {/* escape to Guest dashboard button */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="absolute top-8 left-8 text-xs font-semibold text-white/40 hover:text-white flex items-center gap-2 group transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {/* Form Container (Fade-in reveal) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
        >
          {/* Header titles */}
          <div className="space-y-2">
            <h3 className="text-3xl font-medium tracking-tight">
              {isLogin ? 'Sign In to Profile' : 'Create New Profile'}
            </h3>
            <p className="text-white/40 text-sm">
              {isLogin
                ? 'Input your login parameters to synchronize.'
                : 'Input your basic details to begin the journey.'
              }
            </p>
          </div>



          {error && (
            <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-4">
              <ShieldAlert className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic input form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">

            {!isLogin ? (
              <>
                {/* 2-column First & Last name grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup
                    label="First Name"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    id="firstName"
                  />
                  <InputGroup
                    label="Last Name"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    id="lastName"
                  />
                </div>

                <InputGroup
                  label="Email Address"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="email"
                />

                {/* Account Type selector styled exactly like input */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-white">Account Type</label>
                  <div className="relative flex items-center">
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm cursor-pointer appearance-none"
                    >
                      <option value="student">Student (Quiz Taker)</option>
                      <option value="admin">Administrator (Quiz Creator)</option>
                    </select>
                    <div className="absolute right-4 text-white/40 pointer-events-none text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Login inputs
              <InputGroup
                label="Email or Username"
                placeholder="Enter email or username"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                id="usernameOrEmail"
              />
            )}

            {/* Password input with toggle-eye button */}
            <InputGroup
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              id="password"
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </InputGroup>

            {/* helper text */}
            {!isLogin && (
              <p className="text-[10px] text-white/40 font-display mt-1 pl-1">
                Requires at least 8 symbols.
              </p>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2"
            >
              {submitting ? 'Please wait...' : (isLogin ? 'Sign In to Portal' : 'Create Account')}
            </button>
          </form>

          {/* Footer toggle switcher link */}
          <div className="text-center pt-2">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-white/40 hover:text-white font-semibold transition-colors"
            >
              {isLogin ? "Need a workspace? Create Account" : "Member of the team? Log in"}
            </button>
          </div>
        </motion.div>
      </section>

    </main>
  );
}

// ============================================================================
// REUSABLE PRESENTATIONAL COMPONENTS
// ============================================================================

function StepItem({ number, text, active }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl w-full max-w-xs transition-all duration-300 ${active
      ? 'bg-white text-black border border-white shadow-lg'
      : 'bg-brand-gray text-white border-none'
      }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display flex-shrink-0 ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
        }`}>
        {number}
      </div>
      <span className="text-xs font-semibold tracking-wide uppercase font-display select-none">
        {text}
      </span>
    </div>
  );
}

function SocialButton({ icon: Icon, label }) {
  return (
    <button
      type="button"
      className="flex-1 flex items-center justify-center gap-3 bg-black border border-white/10 rounded-xl hover:bg-white/5 h-12 transition-all duration-300 font-display text-xs font-semibold uppercase tracking-wider text-white hover:border-white/20 active:scale-[0.98]"
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
}

function InputGroup({ label, placeholder, type = 'text', value, onChange, required = true, id, children }) {
  return (
    <div className="flex flex-col space-y-2 relative w-full">
      <label htmlFor={id} className="text-sm font-medium text-white">{label}</label>
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm transition-all"
        />
        {children}
      </div>
    </div>
  );
}
