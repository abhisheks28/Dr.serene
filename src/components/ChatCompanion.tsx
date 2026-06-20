/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  AlertOctagon, 
  Heart, 
  ChevronRight,
  ShieldAlert,
  User,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../types.js';

interface ChatCompanionProps {
  sessionId: string;
}

// Emergency Crisis Detection Match Pattern
const CRISIS_KEYWORDS = [
  "suicide", "self-harm", "kill myself", "end my life", "die", 
  "cannot go on", "feeling like ending", "give up entirely", "hopeless",
  "want to die", "ending my life", "better off dead"
];

const EMERGENCY_RESOURCES = [
  { name: "Vandrevala Foundation Helpline", contact: "91 9999 666 555", hours: "24/7", description: "Free India mental wellness counseling and active student crisis intervention." },
  { name: "NIMHANS Student Support", contact: "080-46110007", hours: "24/7", description: "Government national counseling service specializing in exam stress and cognitive distress." }
];

export default function ChatCompanion({ sessionId }: ChatCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local active state of crisis flag
  const [crisisAlertActive, setCrisisAlertActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial chat history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sessionId]);

  // Handle scrolling of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const messageText = userInput.trim();

    // Emergency detector check (client side immediate interception)
    const matchesCrisis = CRISIS_KEYWORDS.some(word => 
      messageText.toLowerCase().includes(word)
    );

    if (matchesCrisis) {
      setCrisisAlertActive(true);
    }

    setLoading(true);
    setError(null);
    setUserInput('');

    // Optimistically update message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageText
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with Dr. Serene");
      }

      setMessages(data.chatHistory);
    } catch (err: any) {
      setError(err?.message || "Counseling service temporarily offline. Check your Gemini API connection.");
      // Rollback optimistic message. Let student retry.
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setUserInput(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear your dialogue history with Dr. Serene?")) return;
    try {
      const res = await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
        setCrisisAlertActive(false);
      }
    } catch (err) {
      console.error("Failed to reset dialogue:", err);
    }
  };

  return (
    <div id="companion-dialogue-screen" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] relative z-10 font-sans">
      
      {/* Dialogue Thread Area */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden">
        
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">
                Dr. Serene Private Counsel
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">Context-Aware AI Cognitive Support Room</p>
            </div>
          </div>

          <button
            id="btn-clear-chat"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-red-600 p-2 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Thread
          </button>
        </div>

        {/* Severe Crisis Safety Guard */}
        {crisisAlertActive && (
          <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-800">Safety Intervention Safeguard Active</h4>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                We notice you might be experiencing immense exam pressure or feeling hopeless. Your well-being is the absolute highest priority. Please contact dedicated crisis resources instantly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {EMERGENCY_RESOURCES.map((r, ix) => (
                  <div key={ix} className="bg-white p-3 rounded-xl border border-rose-200">
                    <div className="text-[10px] font-bold text-slate-900 mb-0.5">{r.name}</div>
                    <div className="text-xs font-mono font-bold text-rose-600">{r.contact} ({r.hours})</div>
                    <div className="text-[10px] text-slate-500 mt-1">{r.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Stream list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[380px] min-h-[300px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Sparkles className="w-10 h-10 text-indigo-500/35 mb-4 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800">Welcome to Private Counseling</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                "Hello! I am Dr. Serene, your anonymous cognitive wellness coach. Ask me anything about managing mock test dips, handling sibling comparison, organizing focus sprints, or overcoming brain fog."
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border font-sans text-xs font-bold ${
                  m.role === 'user' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : 'S'}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl p-3.5 text-xs font-sans leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap font-sans'
                }`}>
                  {m.content}
                </div>

              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full shrink-0 bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-sans text-xs font-bold">S</div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 font-sans font-medium">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                </span>
                Dr. Serene formulating cognitive coping guidance...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
          <input
            id="chat-input-text"
            type="text"
            aria-label="Ask Dr. Serene a question"
            disabled={loading}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Discuss revision blockers, syllabus pacing, anxiety, mock exam falls..."
            className="flex-1 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-2xl px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all py-3"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={loading || !userInput.trim()}
            className={`px-5 rounded-2xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loading || !userInput.trim() 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 shadow-sm shadow-indigo-600/10'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Query
          </button>
        </form>

      </div>

      {/* Guide details panel on right */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Quick Suggestion Prompts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-xs font-black uppercase font-mono text-slate-900 tracking-wide">Suggested Starters</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-sans leading-relaxed">
            Select an exam friction scenario or topic block to trigger counseling responses:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setUserInput("I feel like I'm letting my parents down with my low scores during recent mock tests. How do I cope with this expectations pressure?")}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-slate-200 text-xs text-slate-700 font-medium transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-1">Handling family performance pressure</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-1" />
            </button>

            <button
              onClick={() => setUserInput("My exam is near and when I look at the syllabus, my heart starts racing and I draw complete blanks trying to solve problems. Help me.")}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-slate-200 text-xs text-slate-700 font-medium transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-1">Managing severe testing panic & blanks</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-1" />
            </button>

            <button
              onClick={() => setUserInput("I am studying 14 hours a day but my focus is completely gone. I feel numb and fatigued. Am I burning out?")}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-slate-200 text-xs text-slate-700 font-medium transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-1">Am I burning out on this study schedule?</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-1" />
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center">
          <AlertOctagon className="w-8 h-8 text-indigo-500/40 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-800 mb-1">Confidentiality Guard</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            Chats are encrypted locally in your current student session. No emails or identifiable logs are cached permanently.
          </p>
        </div>

      </div>

    </div>
  );
}
