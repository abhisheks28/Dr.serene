/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Activity, 
  Flame, 
  TrendingUp, 
  VolumeX, 
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { DashboardStats } from '../types.js';

interface CardDashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function CardDashboard({ stats, loading }: CardDashboardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center min-h-[400px]">
        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm text-slate-500 font-sans font-medium animate-pulse">Assembling dynamic student metrics...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center h-[350px] bg-white rounded-3xl border border-slate-200 border-dashed">
        <AlertTriangle className="w-10 h-10 text-slate-400 mb-4" />
        <span className="text-sm text-slate-700 font-sans font-bold">No Log Data Found</span>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Please register your first student logs inside the <strong>Wellness Logs</strong> tab to seed initial AI diagnostics.
        </p>
      </div>
    );
  }

  // Stress-trigger colors
  const TRIGGER_COLORS = ['#6366f1', '#a855f7', '#f43f5e', '#f97316', '#eab308', '#06b6d4'];

  const noLogs = !stats.moodTimeline || stats.moodTimeline.length === 0;

  return (
    <div id="dashboard-analytics-panel" className="space-y-6">
      
      {/* SECTION 1: Standard Numeric Meters with Glowing Backdrops */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Cognitive Wellness */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-3 relative">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Cognitive Wellness Score</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 relative">
            <span className="text-3xl font-black text-slate-900 font-display">{stats.wellnessScore}%</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {noLogs ? "Ready" : "▲ Optimal Pacing"}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden relative">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600" style={{ width: `${noLogs ? 100 : stats.wellnessScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 relative">
            {noLogs ? "Write logs to initialize core scores." : "Aggregated health index based on mood and fatigue recovery."}
          </p>
        </div>

        {/* Metric 2: Burnout Forecast */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-3 relative">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Current Burnout Risk</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 relative">
            <span className={`text-3xl font-black font-display ${noLogs ? 'text-slate-400' : 'text-slate-900'}`}>
              {noLogs ? "0%" : `${stats.burnoutRisk}%`}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              noLogs ? 'bg-slate-100 text-slate-500' :
              stats.burnoutRisk > 60 ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {noLogs ? "Awaiting Data" : stats.burnoutRisk > 60 ? '⚠️ High Fatigue' : '● Controlled Pace'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden relative">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500" style={{ width: `${noLogs ? 0 : stats.burnoutRisk}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 relative">Active cognitive exhaustion coefficient tracker.</p>
        </div>

        {/* Metric 3: Academic Productivity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-3 relative">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Productivity Index</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 relative">
            <span className="text-3xl font-black text-slate-900 font-display">
              {noLogs ? "0.0" : stats.productivityAverage}/10
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Daily average</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden relative">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-600" style={{ width: `${noLogs ? 100 : stats.productivityAverage * 10}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 relative">Syllabus progression & study retention rate indices.</p>
        </div>

        {/* Metric 4: Diagnostic Target syllabus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-3 relative">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Active Stream</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 relative">
            <span className="text-2xl font-black text-slate-900 font-display">{stats.examType}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden relative">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `100%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 relative">Pacing profiles match candidate targets strictly.</p>
        </div>

      </div>

      {/* SECTION 2: Dynamic Timeline Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Chart A: Dual-Axis Mood vs Stress Track */}
        <div className="xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" /> Cognitive Stability History
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Bi-weekly correlation of self-reported moods, focus outputs and stress pressure</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-50 text-[10px] font-mono font-bold rounded-lg border border-slate-200">
              Session Tracks
            </span>
          </div>

          <div className="h-[280px] w-full">
            {!noLogs ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.moodTimeline} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} fontClassName="font-mono" />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={9} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', boxShadow: '0 4px 12px rbg(0 0 0 / 5%)' }}
                    labelStyle={{ fontSize: '10px', color: '#1e293b', fontFamily: 'monospace', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px', padding: '1px 0', color: '#334155' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                  <Area type="monotone" name="Mood State (1-10)" dataKey="mood" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMood)" />
                  <Area type="monotone" name="Stress Pressure (1-10)" dataKey="stress" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStress)" />
                  <Line type="monotone" name="Focus Level" dataKey="productivity" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                <p className="font-bold text-slate-700 mb-1">Stability Chart Offline</p>
                <p className="max-w-xs text-[11px] text-slate-500">
                  Write and submit your first study journal log to unlock chronological trend data mapping.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart B: Stress Trigger bar indicators */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-indigo-600" /> Stress Trigger Intensity
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Diagnosis</span>
            </div>
            
            <div className="h-[210px] w-full">
              {!noLogs && stats.stressTriggers && stats.stressTriggers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.stressTriggers} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid stroke="none" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="trigger" type="category" stroke="#475569" fontSize={8} width={85} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px', color: '#1e293b' }}
                    />
                    <Bar dataKey="percentage" name="Intensity %" radius={[0, 6, 6, 0]}>
                      {stats.stressTriggers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TRIGGER_COLORS[index % TRIGGER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 p-4">
                  <p className="font-bold text-slate-700 mb-1">Radar Offline</p>
                  <p className="text-[10px] text-slate-500 max-w-[150px]">Requires journal content text to parse stress vectors.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Primary Trigger:</span>
            {!noLogs && stats.stressTriggers && stats.stressTriggers.length > 0 ? (
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {stats.stressTriggers[0]?.trigger} ({stats.stressTriggers[0]?.percentage}%)
              </span>
            ) : (
              <span className="text-slate-400">Awaiting Log</span>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 3: Burnout Projection Engine */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Burnout Curve Forecast */}
        <div className="xl:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> 7-Day Burnout Trajectory Projection
            </h3>
            <p className="text-[11px] text-slate-500">
              AI-driven safety projection mapping consecutive study intervals against biological recovery indicators
            </p>
          </div>

          <div className="h-[200px] w-full mt-4">
            {!noLogs && stats.burnoutForecast && stats.burnoutForecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.burnoutForecast} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', color: '#1e293b' }}
                  />
                  <Line type="monotone" name="Burnout Probability %" dataKey="predictedRisk" stroke="#6366f1" strokeWidth={3} dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 p-6">
                <p className="font-bold text-slate-700 mb-0.5">Forecast Simulator Offline</p>
                <p className="text-[10px] text-slate-500 max-w-[220px]">Burnout forecasting triggers require study logs for timeline calculation sequences.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Weekly/Monthly Narrative Counseling Insights */}
        <div className="xl:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">
                Dr. Serene Clinical Pacing Insight
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Focus Strategy Recommendation:</span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 text-xs text-slate-700 leading-relaxed font-sans">
                  {stats.weeklyInsights && stats.weeklyInsights[0] ? (
                    stats.weeklyInsights[0]
                  ) : (
                    "Dashboard online! Open the 'Wellness Logs' and record notes about today's chemistry/math schedules to prompt live focus pacing."
                  )}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Syllabus block safety:</span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/40 text-xs text-slate-700 leading-relaxed font-sans">
                  {stats.weeklyInsights && stats.weeklyInsights[1] ? (
                    stats.weeklyInsights[1]
                  ) : (
                    "Pacing models check sleep trends and test friction indices automatically. Tap the logs tab to begin tracking."
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 mt-4 font-sans justify-between flex">
            <span>Clinical algorithm engine v1.4</span>
            <span>Local SSL sandboxed</span>
          </div>
        </div>

      </div>

    </div>
  );
}
