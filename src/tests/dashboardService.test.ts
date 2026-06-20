import { describe, it, expect } from 'vitest';
import { calculateDashboardStats } from '../services/dashboardService.js';
import { JournalEntry, StressAnalysis, BurnoutPrediction } from '../types.js';

describe('Dashboard Service Statistics Calculations', () => {

  it('correctly aggregates statistics for a fresh session with 0 journal entries (zero state)', () => {
    const stats = calculateDashboardStats('JEE', [], [], undefined);

    expect(stats.wellnessScore).toBe(0);
    expect(stats.burnoutRisk).toBe(0);
    expect(stats.productivityAverage).toBe(0);
    expect(stats.stressAverage).toBe(0);
    expect(stats.examType).toBe('JEE');
    expect(stats.moodTimeline).toEqual([]);
    expect(stats.stressTriggers).toEqual([]);
    expect(stats.burnoutForecast).toEqual([]);
    expect(stats.weeklyInsights[0]).toContain("write your first student diary entry");
    expect(stats.monthlyInsights[0]).toContain("Once your logs are recorded");
  });

  it('correctly calculates averaged metrics and timelines for multiple journal entries', () => {
    const mockJournals: JournalEntry[] = [
      {
        id: 'j1',
        sessionId: 'session_test',
        date: '2026-06-19T10:00:00Z',
        content: 'Day 1 logging.',
        mood: 8,         // 1-10
        energy: 7,       // 1-10
        stress: 4,       // 1-10 (inverse stress = 6)
        productivity: 8  // 1-10
      },
      {
        id: 'j2',
        sessionId: 'session_test',
        date: '2026-06-20T10:00:00Z',
        content: 'Day 2 logging.',
        mood: 6,         // 1-10
        energy: 5,       // 1-10
        stress: 8,       // 1-10 (inverse stress = 2)
        productivity: 4  // 1-10
      }
    ];

    // Scores calculation logic check:
    // Entry 1: (80 + 70 + 80 + 60) / 4 = 290 / 4 = 72.5
    // Entry 2: (60 + 50 + 40 + 20) / 4 = 170 / 4 = 42.5
    // Mean: (72.5 + 42.5) / 2 = 57.5 -> rounded to 58

    const mockAnalyses: StressAnalysis[] = [
      {
        id: 'sa1',
        journalId: 'j1',
        sessionId: 'session_test',
        createdAt: '2026-06-19T10:05:00Z',
        triggers: [
          { trigger: 'Time Management', percentage: 60 },
          { trigger: 'Mock Test Anxiety', percentage: 40 }
        ],
        detailedInsights: [],
        anxietyRisk: 30,
        focusScore: 70
      },
      {
        id: 'sa2',
        journalId: 'j2',
        sessionId: 'session_test',
        createdAt: '2026-06-20T10:05:00Z',
        triggers: [
          { trigger: 'Mock Test Anxiety', percentage: 80 },
          { trigger: 'Lack of Sleep', percentage: 50 }
        ],
        detailedInsights: [],
        anxietyRisk: 80,
        focusScore: 40
      }
    ];

    const mockPrediction: BurnoutPrediction = {
      id: 'bp1',
      sessionId: 'session_test',
      createdAt: '2026-06-20T11:00:00Z',
      burnoutProbability: 65,
      predictedRisk7Days: 85,
      confidenceScore: 80,
      primaryCauses: ['Fatigue'],
      trend: 'increasing',
      explainableAnalysis: 'High risk'
    };

    const stats = calculateDashboardStats('JEE', mockJournals, mockAnalyses, mockPrediction);

    expect(stats.wellnessScore).toBe(58);
    expect(stats.burnoutRisk).toBe(65);
    expect(stats.productivityAverage).toBe(6.0); // (8 + 4) / 2
    expect(stats.stressAverage).toBe(6.0); // (4 + 8) / 2
    expect(stats.examType).toBe('JEE');

    // Mood timeline format check
    expect(stats.moodTimeline.length).toBe(2);
    expect(stats.moodTimeline[0].date).toBe('Jun 19');
    expect(stats.moodTimeline[1].date).toBe('Jun 20');
    expect(stats.moodTimeline[0].mood).toBe(8);
    expect(stats.moodTimeline[1].stress).toBe(8);

    // Triggers sorting and averaging check:
    // 'Time Management' avg: 60 / 1 = 60
    // 'Mock Test Anxiety' avg: (40 + 80) / 2 = 60
    // 'Lack of Sleep' avg: 50 / 1 = 50
    // Sorted should have 'Mock Test Anxiety' and 'Time Management' first
    expect(stats.stressTriggers.length).toBe(3);
    expect(stats.stressTriggers[0].trigger).toBe('Time Management'); // order depends on object keys sorting, stable sorting retains TM or MTA
    expect(stats.stressTriggers[0].percentage).toBe(60);
    expect(stats.stressTriggers[1].percentage).toBe(60);
    expect(stats.stressTriggers[2].trigger).toBe('Lack of Sleep');
    expect(stats.stressTriggers[2].percentage).toBe(50);

    // Forecast interpolation check (7 days)
    expect(stats.burnoutForecast.length).toBe(6);
    expect(stats.burnoutForecast[0].day).toBe('Tomorrow');
    expect(stats.burnoutForecast[0].predictedRisk).toBe(65);
    expect(stats.burnoutForecast[5].day).toBe('7-Day Risk');
    expect(stats.burnoutForecast[5].predictedRisk).toBe(85);
  });
});
