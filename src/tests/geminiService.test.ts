import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  analyzeStress, 
  predictBurnout, 
  generateWellnessPlan, 
  generateCompanionChatResponse 
} from '../services/geminiService.js';
import { JournalEntry, ChatMessage } from '../types.js';

describe('Gemini Cognitive Service Fallback tests', () => {
  const sessionId = 'test_session_abc';

  beforeEach(() => {
    // Ensure GEMINI_API_KEY is unset to test fallback logic
    vi.stubEnv('GEMINI_API_KEY', '');
  });

  it('analyzeStress falls back gracefully to a robust structure', async () => {
    const journalId = 'j1';
    const content = 'Extremely high stress prepping for heavy testing tomorrow.';
    
    const res = await analyzeStress(content, sessionId, journalId);
    expect(res).toBeDefined();
    expect(res.journalId).toBe(journalId);
    expect(res.sessionId).toBe(sessionId);
    expect(res.triggers.length).toBeGreaterThan(0);
    expect(res.detailedInsights.length).toBeGreaterThan(0);
    expect(typeof res.anxietyRisk).toBe('number');
    expect(typeof res.focusScore).toBe('number');
  });

  it('predictBurnout returns standard simulated trend correctly based on student history', async () => {
    const history: JournalEntry[] = [
      {
        id: 'h1',
        sessionId,
        date: '2026-06-18',
        content: 'Long study day.',
        stress: 8,
        energy: 2,
        mood: 3,
        productivity: 7
      },
      {
        id: 'h2',
        sessionId,
        date: '2026-06-19',
        content: 'Tired and cannot sleep.',
        stress: 9,
        energy: 1,
        mood: 2,
        productivity: 5
      }
    ];

    const res = await predictBurnout(history, sessionId);
    expect(res).toBeDefined();
    expect(res.sessionId).toBe(sessionId);
    expect(res.burnoutProbability).toBeGreaterThanOrEqual(1);
    expect(res.predictedRisk7Days).toBeGreaterThanOrEqual(1);
    expect(res.primaryCauses.length).toBeGreaterThan(0);
    expect(res.explainableAnalysis).toBeDefined();
  });

  it('generateWellnessPlan falls back to comprehensive mental recovery steps', async () => {
    const res = await generateWellnessPlan(undefined, undefined, sessionId, 'JEE');
    expect(res).toBeDefined();
    expect(res.sessionId).toBe(sessionId);
    expect(res.breathingExercise).toBeDefined();
    expect(res.breathingExercise.name).toContain('Box');
    expect(res.studyBreaks.length).toBe(2);
    expect(res.focusImprovementPlan).toBeDefined();
  });

  it('generateCompanionChatResponse returns warm fallback message when AI is offline', async () => {
    const messages: ChatMessage[] = [];
    const journals: JournalEntry[] = [];
    const chatResponse = await generateCompanionChatResponse('Help me cope with exam pressure', messages, journals, undefined, 'NEET');
    
    expect(chatResponse).toBeDefined();
    expect(chatResponse).toContain('NEET');
    expect(chatResponse).toContain('steps');
    expect(chatResponse).toContain('overwhelming');
  });
});
