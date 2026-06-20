/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  RefreshCw, 
  Coffee, 
  Moon, 
  Lightbulb, 
  Play, 
  Square,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { WellnessPlan } from '../types.js';

interface SectionCoachProps {
  sessionId: string;
  plan: WellnessPlan | null;
  loading: boolean;
  onRegenerate: () => Promise<void>;
  examType: string;
}

export default function SectionCoach({ sessionId, plan, loading, onRegenerate, examType }: SectionCoachProps) {
  const [regenLoading, setRegenLoading] = useState(false);
  
  // Realtime Breathing Visualizer variables
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Prepare'>('Prepare');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRegenerate = async () => {
    setRegenLoading(true);
    try {
      await onRegenerate();
    } finally {
      setRegenLoading(false);
    }
  };

  // Safe default boundaries for breathing pacing
  const inhaleSec = plan?.breathingExercise?.inhaleSeconds || 4;
  const holdSec = plan?.breathingExercise?.holdSeconds || 4;
  const exhaleSec = plan?.breathingExercise?.exhaleSeconds || 4;

  useEffect(() => {
    if (!breathingActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setBreathingPhase('Prepare');
      setPhaseSecondsLeft(4);
      return;
    }

    setBreathingPhase('Inhale');
    setPhaseSecondsLeft(inhaleSec);

    timerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch breathing transitions
          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'Inhale') {
              // Hold state
              if (holdSec > 0) {
                setPhaseSecondsLeft(holdSec);
                return 'Hold';
              } else {
                setPhaseSecondsLeft(exhaleSec);
                return 'Exhale';
              }
            } else if (currentPhase === 'Hold') {
              setPhaseSecondsLeft(exhaleSec);
              return 'Exhale';
            } else {
              // Loop back to inhale
              setPhaseSecondsLeft(inhaleSec);
              return 'Inhale';
            }
          });
          return 4; // safety anchor placeholder
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breathingActive, inhaleSec, holdSec, exhaleSec]);

  // Breathing pacer animation states
  const breActiveTransformValue = () => {
    return breathingActive && breathingPhase === 'Inhale' 
      ? 'scale-110 opacity-100' 
      : breathingActive && breathingPhase === 'Exhale' 
      ? 'scale-95 opacity-50' 
      : 'scale-100';
  };

  const breActiveTransformValueInner = () => {
    return breathingActive && breathingPhase === 'Inhale' 
      ? 'scale-[1.12]' 
      : breathingActive && breathingPhase === 'Exhale' 
      ? 'scale-[0.94]' 
      : 'scale-100';
  };

  const breActiveTime = () => {
    return breathingActive ? `${phaseSecondsLeft}s` : '00';
  };

  return (
    <div id="wellness-coach-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans">
      
      {/* Dynamic recovery items column */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Main Coach Advice Container */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 relative pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">
                Your AI Recovery Coach CoachPlan
              </h2>
            </div>
            
            <button
              id="btn-regenerate-wellness"
              onClick={handleRegenerate}
              disabled={regenLoading || loading}
              className={`text-xs px-3.5 py-2 rounded-xl font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                regenLoading || loading
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-indigo-700 border-slate-200 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${regenLoading ? 'animate-spin' : ''}`} />
              {regenLoading ? 'Updating Recommendations...' : 'Regenerate Coach Advice'}
            </button>
          </div>

          {!plan && !loading ? (
            <p className="text-xs text-slate-500 py-6">Loading custom coach details...</p>
          ) : (
            <div className="space-y-5 relative">
              <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-xs leading-relaxed text-slate-800">
                <span className="font-bold text-indigo-700 block mb-1">Restructuring Strategy:</span>
                {plan?.recoveryPlan || "Your recovery plan is compiling. Provide study log diaries to seed diagnostic details."}
              </div>

              {/* Study break blocks */}
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Suggested Cognitive Intermission Protocols:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan?.studyBreaks && plan.studyBreaks.length > 0 ? (
                    plan.studyBreaks.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 shadow-none hover:border-slate-200 transition-all">
                        <Coffee className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 mb-1">{item.type}</h4>
                          <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold bg-orange-100 text-orange-800 rounded-md">
                            Duration: {item.durationMinutes} mins
                          </span>
                          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-4 bg-slate-50 text-center rounded-2xl text-xs text-slate-500 border border-dashed border-slate-200">
                      Write your first diary entry to parse custom break protocols.
                    </div>
                  )}
                </div>
              </div>

              {/* Sleep improvement metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-800">Focus & Syllabus Pacing</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {plan?.focusImprovementPlan || "Unlocks when daily logs are inputted. Tracks syllabus load blocks."}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 font-sans">Sleep & Circadian Alignment</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {plan?.sleepImprovementPlan || "Awaiting sleep habit index from your journal logs to balance mental clarity."}
                  </p>
                </div>
              </div>

              {/* Motivation Strategy advice */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-xs text-slate-700 leading-relaxed font-sans flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 font-display">Mindset Target for {examType}:</span>{' '}
                  {plan?.motivationStrategy || "Log exam friction today to parse tactical clinical focus motivation guidelines."}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Interactive Autonomic Deep Breathing circle on right */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">
              Respiration Vagal Pacer
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
            Pacing respiration triggers parasympathetic stabilization, which reduces stress and improves memory/reasoning.
          </p>

          <div className="flex flex-col items-center justify-center py-4">
            
            {/* Pulsating respiratory circle */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              
              {/* Outer wave rings */}
              <div 
                className={`absolute inset-0 rounded-full bg-indigo-100/30 border border-indigo-200/40 transition-all duration-1000 ${
                  breActiveTransformValue()
                }`} 
              />
              <div 
                className={`absolute inset-3 rounded-full bg-indigo-50/50 border border-indigo-100/60 transition-all duration-1000 ${
                  breActiveTransformValueInner()
                }`} 
              />

              {/* Core interactive circle */}
              <div 
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-center shadow-xl transition-all duration-1500 ${
                  breathingActive && breathingPhase === 'Inhale' 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 scale-[1.12]' 
                    : breathingActive && breathingPhase === 'Hold' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 scale-[1.12]' 
                    : breathingActive && breathingPhase === 'Exhale' 
                    ? 'bg-gradient-to-br from-indigo-700 to-indigo-900 scale-[0.92]' 
                    : 'bg-slate-100 border border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  breathingActive ? 'text-indigo-250' : 'text-slate-500'
                }`}>
                  {breathingActive ? breathingPhase : 'Inactive'}
                </span>
                <span className={`text-2xl font-mono font-black mt-1 ${
                  breathingActive ? 'text-white' : 'text-slate-600'
                }`}>
                  {breActiveTime()}
                </span>
              </div>
            </div>

            {/* Instruction bar */}
            <div className="text-center font-sans text-xs px-4 h-12 flex items-center justify-center">
              {breathingActive ? (
                breathingPhase === 'Inhale' ? (
                  <span className="text-indigo-700 font-bold">Draw breath in slowly... fill lungs.</span>
                ) : breathingPhase === 'Hold' ? (
                  <span className="text-purple-700 font-bold">Hold position. Balance focus blocks.</span>
                ) : (
                  <span className="text-indigo-900 font-medium">Slowly release through the mouth... relax slate.</span>
                )
              ) : (
                <span className="text-slate-400 text-[11px] leading-relaxed">
                  Click begin below. Align breathing to expanding rings to soothe somatic panic.
                </span>
              )}
            </div>

            {/* Start / reset breathing buttons */}
            <button
              id="btn-breathing-toggle"
              onClick={() => setBreathingActive(!breathingActive)}
              className={`mt-4 px-6 py-2.5 rounded-2xl text-xs font-sans font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                breathingActive
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-rose-600 border border-slate-250'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.98]'
              }`}
            >
              {breathingActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  Terminate Session
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  Begin 4-4-4 Pacer
                </>
              )}
            </button>

          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center">
          Pacer: {inhaleSec}S Inhale | {holdSec}S Hold | {exhaleSec}S Exhale
        </div>
      </div>

    </div>
  );
}
