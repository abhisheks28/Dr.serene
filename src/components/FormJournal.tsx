/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smile, 
  Zap, 
  Flame, 
  Lightbulb, 
  BookOpen, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { StressAnalysis, BurnoutPrediction, WellnessPlan } from '../types.js';

interface FormJournalProps {
  sessionId: string;
  onJournalLogged: (data: {
    journal: any;
    stressAnalysis: StressAnalysis;
    burnoutPrediction: BurnoutPrediction;
    wellnessPlan: WellnessPlan;
  }) => void;
  examType: string;
}

const TEMPLATE_PROMPTS = [
  {
    label: "Mock Test Failure Pressure – UPSC",
    text: "My score yesterday on the UPSC test series was discouraging. I ranked 430th in my batch, down over 100 ranks. My family is sacrificing so much to fund my preparation in Delhi. I feel like an absolute fraud and that I am wasting everyone's dreams. I can't sleep for more than 4 hours because my heart starts racing whenever I close my eyes thinking about the final list."
  },
  {
    label: "NEET Revision Block Panic",
    text: "There are only 60 days left for NEET. The physical chemistry modules are completely untouched and whenever I open biology to revise genetics, my brain freezes up. My mother calls me twice a day to tell me how the neighborhood doctor's daughter cleared it on her first attempt. I am physically exhausted, experiencing daily headaches, and feel like breaking down."
  },
  {
    label: "Parent Expectations & Burnout – GATE",
    text: "Preparing for GATE is taking everything out of me. Working a 9-to-5 IT job and study prep at nights has burned me out. My father tells me this is my only exit route from a low salary IT career. Solve problem sets, test schedules, workplace load... my neck holds extreme tension, and I have zero energy remains."
  }
];

export default function FormJournal({ sessionId, onJournalLogged, examType }: FormJournalProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(5);
  const [productivity, setProductivity] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Last analyzed record summary showcase
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const selectTemplate = (text: string) => {
    setContent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write down some notes or click one of the template scenarios above to test.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content,
          mood,
          energy,
          stress,
          productivity
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to log diary entry to Express server");
      }

      setAnalysisResult(data);
      onJournalLogged(data);
      
      // Reset form variables
      setContent('');
      setMood(6);
      setEnergy(6);
      setStress(5);
      setProductivity(6);
    } catch (err: any) {
      setError(err?.message || "An exception occurred verifying the stress analytics. Verify process.env.GEMINI_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="journal-input-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans">
      
      {/* Logger Core Panel */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase font-mono text-slate-900 tracking-wide">Daily Stress Diary & Metrics</h2>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Log your study journal below. Focus on academic stressors like mock test loads, peer pressure, pacing, parent expectations, or sleep habits. Dr. Serene securely analyzes stress triggers and updates your recovery plan.
          </p>

          {/* Rapid Test Scenarios */}
          <div className="mb-6">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
              Reviewer Quick-Seeding Prompt templates:
            </span>
            <div className="flex flex-col gap-2">
              {TEMPLATE_PROMPTS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectTemplate(t.text)}
                  className="text-left text-xs bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 hover:border-indigo-500/30 transition-all text-slate-700 cursor-pointer"
                >
                  <div className="font-bold text-indigo-700 text-[11px] mb-0.5">{t.label} (Click to load)</div>
                  <div className="text-[10px] text-slate-500 truncate">{t.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Core Logger Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Write Today's Study Log:
              </label>
              <textarea
                aria-label="Daily study log content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How went your exam preparation modules today? Any heavy test panic, mock test falls, parent calls, target stress, or mental exhaustion? Write freely (Privacy protected under zero metadata collection policy)..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-2xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Range sliders */}
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700"><Smile className="w-4 h-4 text-emerald-600" /> Mood</span>
                  <span className="font-mono font-bold text-slate-800">{mood}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  aria-label="Grade mood from 1 to 10"
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700"><Zap className="w-4 h-4 text-amber-500" /> Energy / Vitality</span>
                  <span className="font-mono font-bold text-slate-800">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  aria-label="Grade energy from 1 to 10"
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700"><Flame className="w-4 h-4 text-red-500" /> Academic Stress</span>
                  <span className="font-mono font-bold text-slate-800">{stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  aria-label="Grade academic stress from 1 to 10"
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700"><Lightbulb className="w-4 h-4 text-cyan-600" /> Productivity</span>
                  <span className="font-mono font-bold text-slate-800">{productivity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={productivity}
                  aria-label="Grade productivity from 1 to 10"
                  onChange={(e) => setProductivity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="btn-journal-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-sans font-bold text-white transition-all flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dr. Serene analyzing via Gemini Clinical Engine...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Log & Trigger Real-Time Analytics
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Stress Detective Showcase Results on right */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Realtime Extraction Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">
                  AI Real-Time Stress Diagnostics
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
                Live Extract
              </span>
            </div>

            {analysisResult ? (
              <div className="space-y-5">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Acupressure Succeeded!</span> Gemini safely processed candidate journal and parsed indicators tailored to the <span className="font-bold text-slate-900">{examType}</span> routine.
                  </div>
                </div>

                {/* Extracted Triggers List */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Extracted Pressure Coefficients:</span>
                  <div className="space-y-3">
                    {analysisResult.stressAnalysis?.triggers.map((t: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 font-bold">{t.trigger}</span>
                          <span className="font-mono text-slate-900 font-bold">{t.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              t.percentage > 70 
                                ? 'bg-gradient-to-r from-red-500 to-rose-400' 
                                : t.percentage > 40 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                                : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                            }`}
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Advice */}
                <div className="space-y-2 mt-4">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Immediate Cognitive Safeguards:</span>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 font-sans leading-relaxed">
                    {analysisResult.stressAnalysis?.detailedInsights.map((ins: string, idx: number) => (
                      <li key={idx}>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Burnout prediction preview */}
                <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs gap-3">
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-400 uppercase font-mono font-bold">Burnout Predictor Verdict</div>
                    <div className="font-bold text-slate-700 mt-1 line-clamp-2 leading-tight">
                      {analysisResult.burnoutPrediction?.explainableAnalysis}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-black font-display text-indigo-700">{analysisResult.burnoutPrediction?.burnoutProbability}%</span>
                    <p className="text-[9px] text-slate-400">Confidence: {analysisResult.burnoutPrediction?.confidenceScore}%</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 p-6 min-h-[350px]">
                <Smile className="w-10 h-10 text-slate-300 mb-3" />
                <span className="text-xs text-slate-700 font-sans font-bold">Diagnostic Sandbox Ready</span>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                  Submit study log notes or select one of the mock scenarios on the left to extract parsed cognitive indexes instantly from the Gemini server.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
