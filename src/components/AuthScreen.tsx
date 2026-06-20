/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Waves, Lock, Mail, ChevronRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ExamType } from '../types.js';

interface AuthScreenProps {
  onAuthSuccess: (email: string, examType: ExamType) => void;
  requestedMode?: 'signin' | 'signup';
}

const EXAMS: ExamType[] = ['JEE', 'NEET', 'UPSC', 'GATE', 'CAT', 'CUET', 'SSC', 'Banking', 'Government Exams', 'Other'];

export default function AuthScreen({ onAuthSuccess, requestedMode }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [examType, setExamType] = useState<ExamType>('JEE');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with parent triggers (like buttons in header)
  useEffect(() => {
    if (requestedMode) {
      setIsSignUp(requestedMode === 'signup');
    }
  }, [requestedMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all security fields.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
    const payload = isSignUp 
      ? { email, password, examType } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (isSignUp) {
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(data.email, data.examType);
        }, 1000);
      } else {
        onAuthSuccess(data.email, data.examType);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-container" className="min-h-[70vh] flex items-center justify-center p-4 relative z-10 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-indigo-100/40 relative overflow-hidden">
        {/* Decorative corner graphics */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-50 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="p-3 bg-gradient-to-tr from-indigo-650 via-indigo-600 to-sky-500 rounded-2xl shadow-lg shadow-indigo-600/10 mb-4 relative overflow-hidden flex items-center justify-center">
            <Waves className="w-6 h-6 text-white animate-[pulse_3s_infinite]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
            {isSignUp ? 'Create Student Account' : 'Authenticate Credentials'}
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            {isSignUp 
              ? 'Join private counseling designed explicitly for high-stakes exam aspirants.' 
              : 'Secure study journals, burnout forecasting models, and AI wellness pacers.'}
          </p>
        </div>

        {/* Guest credentials sandbox banner */}
        {!isSignUp && (
          <div id="demo-credentials-banner" className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-center">
            <p className="text-xs text-indigo-700 font-bold flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Instant Guest Portal Credentials
            </p>
            <div className="mt-2 space-y-1.5 text-[11px] font-mono text-slate-600">
              <p>
                Email: <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800 select-all">student@serene.com</span>
              </p>
              <p>
                Password: <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800 select-all">password123</span>
              </p>
            </div>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <label htmlFor="auth-email-input" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">
              Secure Corporate/Personal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password-input" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="animate-fadeIn">
              <label htmlFor="auth-exam-select" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">
                Target High-Stakes Entrance Exam
              </label>
              <select
                id="auth-exam-select"
                aria-label="Target competitive examination value"
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-sans"
              >
                {EXAMS.map((name) => (
                  <option key={name} value={name} className="bg-white text-slate-800">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Feedback states */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-2xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Action trigger button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></span>
              </span>
            ) : (
              <>
                {isSignUp ? 'Create My Secure Account' : 'Authenticate Secure Portal'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4 relative">
          <button
            id="auth-toggle-mode"
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer focus:outline-none"
          >
            {isSignUp 
              ? 'Already registered? Return to login sign-in' 
              : 'First time using Serene? Set up secure student account'}
          </button>
        </div>

        {/* Quality commitment */}
        <p className="text-[10px] text-slate-400 text-center mt-5 leading-relaxed">
          🔐 Secure Local Encryption. Zero dynamic profiling metadata is collected. Designed strictly for student cognitive recovery indexing.
        </p>
      </div>
    </div>
  );
}
