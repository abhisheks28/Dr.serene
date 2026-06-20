/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Waves, 
  MessageSquare, 
  Activity,
  LogOut,
  Sparkles,
  User,
  UserPlus
} from 'lucide-react';
import { ExamType } from '../types.js';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  examType: ExamType;
  onExamTypeChange: (type: ExamType) => void;
  aiStatus: { status: string; aiEnabled: boolean };
  userEmail: string | null;
  onLogout: () => void;
  onAuthSelect: (mode: 'signin' | 'signup') => void;
}

const EXAMS: ExamType[] = ['JEE', 'NEET', 'UPSC', 'GATE', 'CAT', 'CUET', 'SSC', 'Banking', 'Government Exams', 'Other'];

export default function Navigation({ 
  currentView, 
  onViewChange, 
  examType, 
  onExamTypeChange,
  aiStatus,
  userEmail,
  onLogout,
  onAuthSelect
}: NavigationProps) {
  return (
    <header id="header-nav" className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/80 px-4 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding Title */}
        <div 
          onClick={() => onViewChange('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-gradient-to-tr from-indigo-650 via-indigo-600 to-sky-500 rounded-2xl shadow-lg shadow-indigo-600/10 group-hover:scale-105 transition-transform relative flex items-center justify-center">
            {/* Ambient glow underneath */}
            <span className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-sm scale-95 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Waves className="w-5 h-5 text-white animate-[pulse_3s_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-display">Dr. Serene</span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Candidate Pacing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">Cognitive Stress Diagnostics</p>
          </div>
        </div>

        {/* Global Navigation Tabs (Available ONLY for Authenticated Students) */}
        {userEmail ? (
          <nav className="flex flex-wrap items-center justify-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40">
            <button
              id="nav-btn-dashboard"
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Analytics Dashboard
            </button>
            
            <button
              id="nav-btn-journal"
              onClick={() => onViewChange('journal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                currentView === 'journal' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Wellness Logs
            </button>

            <button
              id="nav-btn-coach"
              onClick={() => onViewChange('coach')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                currentView === 'coach' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-600" />
              AI Recovery Coach
            </button>

            <button
              id="nav-btn-chat"
              onClick={() => onViewChange('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                currentView === 'chat' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Dr. Serene Counsel
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => onViewChange('home')}
              className={`text-xs font-semibold font-sans cursor-pointer ${currentView === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Features
            </button>
            <a 
              href="#features-bento-grid" 
              className="text-xs font-semibold font-sans text-slate-500 hover:text-slate-900"
            >
              Science of Flow
            </a>
          </nav>
        )}

        {/* Action controls & indicators */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-2xl text-xs font-sans shadow-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-slate-700 font-bold max-w-[125px] truncate" title={userEmail}>{userEmail}</span>
              <button
                id="btn-auth-logout"
                title="Log Out Student"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-600 transition-colors ml-1.5 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-auth-login"
                onClick={() => onAuthSelect('signin')}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                Sign In
              </button>
              <button
                id="nav-auth-signup"
                onClick={() => onAuthSelect('signup')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-100" />
                Sign Up
              </button>
            </div>
          )}

          {userEmail ? (
            <div id="exam-selector-box" className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Target:</span>
              <select
                aria-label="Target competitive examination value"
                value={examType}
                onChange={(e) => onExamTypeChange(e.target.value as ExamType)}
                className="bg-transparent text-xs text-slate-700 font-sans font-bold focus:outline-none cursor-pointer pr-1"
              >
                {EXAMS.map((name) => (
                  <option key={name} value={name} className="bg-white text-slate-800 font-sans text-xs">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100 px-3 py-2 rounded-2xl text-[11px] font-mono font-bold text-indigo-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Gemini Integrated
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
