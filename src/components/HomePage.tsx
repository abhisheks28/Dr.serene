/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Waves, 
  Compass,
  Activity, 
  FileSpreadsheet, 
  Sparkles, 
  Heart, 
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  BookOpen,
  TrendingDown,
  Timer
} from 'lucide-react';
import { ExamType } from '../types.js';

interface HomePageProps {
  onGetStarted: (mode: 'signin' | 'signup') => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  const coreFeatures = [
    {
      icon: <FileSpreadsheet className="w-5 h-5 text-indigo-600" />,
      title: "Empathetic Cognitive Logs",
      description: "Write custom study logs about your mock tests, academic pacing, family stress or sleeplessness. Dr. Serene parses natural language logs with secure clinical models."
    },
    {
      icon: <Activity className="w-5 h-5 text-sky-600" />,
      title: "Predictive Burnout Forecasting",
      description: "Uses chronological machine learning models to forecast burnout risks over a 7-day future window so you can pause or modulate mock exams appropriately."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      title: "Dynamic AI Pacing Coach",
      description: "Generates custom step-by-step cognitive pacing plans, breathing workflows, somatic tension-release, and mock recovery protocols tailored perfectly to your target exam."
    },
    {
      icon: <Compass className="w-5 h-5 text-emerald-600 animate-[spin_20s_linear_infinite]" />,
      title: "Virtual Empathy Counselor",
      description: "Talk to Dr. Serene directly whenever mock scores drop or expectations overwhelm. Access non-judgmental, immediate clinical counsel for high-stress situations."
    }
  ];

  const targetExams = [
    { name: "JEE", duration: "Engineering / IITs", focus: "Problem difficulty overload, sleep loss, peer competition" },
    { name: "NEET", duration: "Medical / MBBS", focus: "Rote-memorization burnout, parental pressure, extreme repetition" },
    { name: "UPSC", duration: "Civil Services", focus: "Chronic loneliness, vast syllabus block, uncertainty fatigue" },
    { name: "GATE", duration: "Tech Masters / PSUs", focus: "Work-study double load, career transition block" },
    { name: "CAT / Others", duration: "Management & Professional", focus: "Speed pressure, profile percentile anxiety" }
  ];

  return (
    <div id="home-page-container" className="font-sans text-slate-800 animate-fadeIn space-y-20 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto py-12 px-6 relative">
        <div className="absolute inset-0 -top-12 -z-10 flex justify-center">
          <div className="w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl" />
        </div>

        {/* Floating badge */}
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold text-indigo-700 uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
          The Science of Cognitive Pace & Focus
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
          Pace Your Mind. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
            Beat Exam Burnout.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Dr. Serene is an autonomous mental wellness and stress diagnostics suite built specifically for competitive candidates pushing through JEE, NEET, UPSC, and high-intensity targets. Monitor chronic fatigue, log study entries, and secure personalized pacing plans.
        </p>

        {/* CTA Button Block */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-signup"
            onClick={() => onGetStarted('signup')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create My Student Portal
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            id="hero-cta-signin"
            onClick={() => onGetStarted('signin')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-sm rounded-2xl shadow-sm transition-all text-center cursor-pointer"
          >
            Log In to Exist Client
          </button>
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="mt-8 flex justify-center items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strict Offline-First DB Model. No metadata monetization. Confidentiality protected.</span>
        </div>
      </section>

      {/* Target Competitive Focus area */}
      <section className="bg-white/80 border border-slate-200/50 rounded-3xl p-8 backdrop-blur shadow-sm max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tailored to Your Target Exam</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Different examinations present distinct neurological strains. Dr. Serene optimizes recovery advice based on custom exam pathways:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetExams.map((exam, i) => (
            <div key={i} className="flex flex-col bg-slate-50/50 border border-slate-100 p-5 rounded-2xl hover:border-slate-200/80 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-white border border-slate-200/80 rounded-xl text-xs font-black text-indigo-700 tracking-wide font-mono shadow-sm">
                  {exam.name}
                </span>
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 font-mono">{exam.duration}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-auto border-t border-slate-100 pt-2 font-sans">
                {exam.focus}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Structured Core Features Bento Grid */}
      <section id="features-bento-grid" className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">How Dr. Serene Supports You Daily</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            By analyzing physical, cognitive and environmental parameters, Serene operates as a proactive clinical safety net.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreFeatures.map((f, i) => (
            <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-3xl hover:shadow-lg hover:shadow-slate-100/50 transition-all flex flex-col sm:flex-row gap-4 items-start">
              <div className="p-3 bg-slate-50 rounded-2xl shrink-0 border border-slate-100">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scientific Stress Analytics Preview */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-10 max-w-6xl mx-auto relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/5 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest">
              PROACTIVE BIO-COGNITIVE ALGORITHMS
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Visualize Stress Trajectories Before Chronic Exhaustion Manifests
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dr. Serene maps key metrics—Mood elasticity, Fatigue recovery coefficients, stress spikes, and sleep indicators—into high-congruence telemetry charts. Prevent sudden dropouts by adjusting study sessions to match your biological limits.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Semantic Triage:</strong> Extracts exact academic panic vectors automatically.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pacing Calibration:</strong> Automatically suggests cognitive resting breaks.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Real-Time AI Grounding:</strong> Validated by high-speed server models.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Mock Dashboard Demo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>🎯 Target Exam:</span>
                <span className="text-white font-bold font-sans">JEE Aspirant</span>
              </div>
              <div className="flex justify-between">
                <span>📈 Current Wellness Score:</span>
                <span className="text-emerald-400 font-bold">88 / 100 (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span>⚠️ 7-Day Burnout Risk:</span>
                <span className="text-indigo-300 font-bold font-sans">22% (Very Low)</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-[10px] text-slate-400">
                <span>🔄 Primary Stressors detected:</span>
                <span className="text-white">Chemistry Pervasive Block</span>
              </div>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-xl">
              <p className="text-[10px] text-indigo-300 leading-relaxed font-sans">
                "Your energy scores are high but sleep recovery remains below 5 hours. Please skip late night chemical kinetics formulas tonight."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Question Block */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <HelpCircle className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-slate-900 mb-1.5">Are my personal study journals confidential?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Absolutely. Dr. Serene operates on a private JSON storage database pattern. No logs or private descriptions are ever processed for external telemetry or targeting. It is highly secure.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl">
            <h4 className="text-xs font-black uppercase font-mono tracking-wide text-slate-900 mb-1.5">How does the 7-Day Burnout Predictor work?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you log a wellness log, physical parameters (mood, energy, fatigue levels) are processed by chronological AI regression estimators. This dynamically maps whether you are pacing correctly or building high fatigue risk.
            </p>
          </div>
        </div>
      </section>

      {/* Massive modern CTA block */}
      <section className="text-center py-10 bg-slate-100/50 border border-slate-200/60 rounded-3xl max-w-5xl mx-auto p-8 relative overflow-hidden">
        <h3 className="text-2xl font-black text-slate-900 mb-3">Begin Your Paced, Stress-Free Journey</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
          Access specialized counseling, predictive analytics forecasting, and interactive AI wellness pacing immediately.
        </p>

        <button
          id="block-cta-signup"
          onClick={() => onGetStarted('signup')}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all text-center inline-flex items-center gap-2"
        >
          Create My Secure Student Portal
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
