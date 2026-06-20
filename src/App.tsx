/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.tsx';
import CardDashboard from './components/CardDashboard.tsx';
import FormJournal from './components/FormJournal.tsx';
import SectionCoach from './components/SectionCoach.tsx';
import ChatCompanion from './components/ChatCompanion.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import HomePage from './components/HomePage.tsx';
import { DashboardStats, WellnessPlan, ExamType, JournalEntry } from './types.ts';
import { HelpCircle, AlertCircle, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [examType, setExamType] = useState<ExamType>('JEE');
  const [currentView, setCurrentView] = useState<string>('home');
  
  // Loaded state assets
  const [stats, setModelStats] = useState<DashboardStats | null>(null);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null);
  
  // Loading indicators
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [coachLoading, setCoachLoading] = useState(true);
  
  // General status
  const [aiStatus, setAiStatus] = useState({ status: "online", aiEnabled: false });
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 1. Session Setup & Initializer
  useEffect(() => {
    const email = localStorage.getItem('dr_serene_user_email');
    const savedExam = localStorage.getItem('dr_serene_exam_type') as ExamType || 'JEE';
    if (email) {
      setSessionId(email);
      setExamType(savedExam);
      setCurrentView('dashboard');
      syncSession(email, savedExam);
    } else {
      setCurrentView('home');
    }
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch('/api/healthz');
      if (res.ok) {
        const health = await res.json();
        setAiStatus(health);
      }
    } catch (err) {
      console.error("Healthcheck connection failed:", err);
    }
  };

  const syncSession = async (sid: string, selectedExam: ExamType) => {
    try {
      setGlobalError(null);
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, examType: selectedExam })
      });

      if (!response.ok) {
        throw new Error("Failed to register session with server.");
      }

      const sessionObj = await response.json();
      setExamType(sessionObj.session.examType);
      localStorage.setItem('dr_serene_exam_type', sessionObj.session.examType);
      
      // Load current student stats in parallel now that session is verified
      loadDashboardAssets(sid);
      loadCoachPlan(sid);
    } catch (err: any) {
      setGlobalError("Connection issue synchronizing session with full-stack server layer. Confirm server.ts status.");
    }
  };

  const handleAuthSuccess = (email: string, selectedExam: ExamType) => {
    localStorage.setItem('dr_serene_user_email', email);
    localStorage.setItem('dr_serene_exam_type', selectedExam);
    setSessionId(email);
    setExamType(selectedExam);
    setCurrentView('dashboard');
    syncSession(email, selectedExam);
  };

  const handleLogout = () => {
    localStorage.removeItem('dr_serene_user_email');
    localStorage.removeItem('dr_serene_exam_type');
    setSessionId('');
    setModelStats(null);
    setWellnessPlan(null);
    setCurrentView('home');
  };

  // 2. Fetch parallel assets
  const loadDashboardAssets = async (sid: string) => {
    setDashboardLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${sid}`);
      if (response.ok) {
        const data = await response.json();
        setModelStats(data);
      }
    } catch (err) {
      console.error("Dashboard assets load issue:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadCoachPlan = async (sid: string) => {
    setCoachLoading(true);
    try {
      const response = await fetch(`/api/wellness/${sid}`);
      if (response.ok) {
        const data = await response.json();
        setWellnessPlan(data);
      }
    } catch (err) {
      console.error("Coach plan load issue:", err);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleExamTypeChange = async (newExam: ExamType) => {
    setExamType(newExam);
    await syncSession(sessionId, newExam);
  };

  // Re-run wellness pacer advice cascade immediately upon user logs
  const handleNewJournalLogged = (data: any) => {
    setGlobalError(null);
    loadDashboardAssets(sessionId);
    loadCoachPlan(sessionId);
    
    // Smooth navigation shift back to dashboard to review the new charts!
    setCurrentView('dashboard');
  };

  const handleRegenerateWellnessPlan = async () => {
    setCoachLoading(true);
    try {
      const response = await fetch('/api/wellness/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setWellnessPlan(data.wellnessPlan);
      }
    } catch (err) {
      console.error("Wellness plan refresh issue:", err);
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div id="serene-applet-root" className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800 relative overflow-hidden">
      
      {/* Soft Elegant Mesh Gradient Graphics */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[40%] bg-indigo-100/40 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-sky-100/30 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[15%] w-[25%] h-[30%] bg-purple-100/30 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Global Header Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={(v) => {
          // If unauthenticated, allow toggling signin/signup or home
          if (!sessionId) {
            if (v === 'dashboard' || v === 'journal' || v === 'coach' || v === 'chat') {
              setCurrentView('signin');
            } else {
              setCurrentView(v);
            }
          } else {
            setCurrentView(v);
          }
        }} 
        examType={examType}
        onExamTypeChange={handleExamTypeChange}
        aiStatus={aiStatus}
        userEmail={sessionId || null}
        onLogout={handleLogout}
        onAuthSelect={(mode) => setCurrentView(mode)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6 relative z-10 transition-all">
        
        {/* Connection Failure Warn Header */}
        {globalError && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start gap-3 text-xs shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 mb-0.5">Connection Loss</strong>
              {globalError} Check network log outputs or refresh the server sandbox.
            </div>
          </div>
        )}

        {/* Guest Router Mode */}
        {!sessionId ? (
          <div>
            {currentView === 'home' && (
              <HomePage onGetStarted={(mode) => setCurrentView(mode)} />
            )}
            
            {(currentView === 'signin' || currentView === 'signup') && (
              <AuthScreen 
                onAuthSuccess={handleAuthSuccess} 
                requestedMode={currentView} 
              />
            )}
          </div>
        ) : (
          /* Student Authenticated Views */
          <div id="view-router-block" className="animate-fadeIn">
            
            {currentView === 'dashboard' && (
              <div id="dashboard-view-wrapper" className="space-y-6">
                
                {/* Empathy Welcome Card */}
                <div id="welcome-message-card" className="p-6 rounded-3xl bg-white border border-slate-200/80 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
                  <h2 className="text-sm font-black uppercase font-mono text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-indigo-600 animate-pulse" /> Greetings Candidate
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 max-w-4xl leading-relaxed">
                    Welcome to Dr. Serene, your anonymous cognitive wellness companion. By combining self-reported logs, AI-generated burnout models, and vagus respiration exercises, we help high-stakes entrance exam candidates avoid chronic fatigue dropouts.
                  </p>
                </div>

                <CardDashboard stats={stats} loading={dashboardLoading} />
              </div>
            )}

            {currentView === 'journal' && (
              <div id="journal-view-wrapper">
                <FormJournal 
                  sessionId={sessionId} 
                  onJournalLogged={handleNewJournalLogged} 
                  examType={examType}
                />
              </div>
            )}

            {currentView === 'coach' && (
              <div id="coach-view-wrapper">
                <SectionCoach 
                  sessionId={sessionId} 
                  plan={wellnessPlan} 
                  loading={coachLoading} 
                  onRegenerate={handleRegenerateWellnessPlan}
                  examType={examType}
                />
              </div>
            )}

            {currentView === 'chat' && (
              <div id="chat-view-wrapper">
                <ChatCompanion sessionId={sessionId} />
              </div>
            )}

            {currentView === 'home' && (
              <HomePage onGetStarted={(mode) => setCurrentView(mode)} />
            )}

          </div>
        )}

      </main>

      {/* Footer bar */}
      <footer id="footer-main" className="border-t border-slate-200 bg-white/80 py-8 text-center text-[11px] text-slate-400 font-sans mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="leading-relaxed text-slate-500">
            Dr. Serene Student Mental Wellness Suite is designed for educational pacing support. Advice generated by models does not replace professional medical or clinical psychiatric consultations.
          </p>
          <p className="text-slate-400 font-mono text-[10px]">
            Confidential Session DB Pattern • Vagus stabilization pacing engine
          </p>
        </div>
      </footer>

    </div>
  );
}
