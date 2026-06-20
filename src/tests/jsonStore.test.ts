import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db/jsonStore.js';
import { ExamType, JournalEntry, ChatMessage, User } from '../types.js';

describe('JSONStore Database Tests', () => {
  const testSessionId = 'session_test_123';
  const testEmail = 'user@example.com';

  beforeEach(() => {
    db.resetForTest();
  });

  describe('User Operations', () => {
    it('should create and retrieve users correctly', () => {
      const examType: ExamType = 'UPSC';
      const createdUser = db.createUser(testEmail, 'testpass123', examType);

      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(testEmail);
      expect(createdUser.password).toBe('testpass123');
      expect(createdUser.examType).toBe(examType);

      const retrievedUser = db.getUser(testEmail);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.email).toBe(testEmail);
      expect(retrievedUser?.password).toBe('testpass123');
      expect(retrievedUser?.examType).toBe(examType);
    });

    it('should return undefined for unregistered users', () => {
      const nonExistent = db.getUser('notreal_user@test.com');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Session Operations', () => {
    it('should create and fetch sessions', () => {
      const examType: ExamType = 'NEET';
      const session = db.createSession(testSessionId, examType);

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
      expect(session.examType).toBe(examType);

      const retrieved = db.getSession(testSessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testSessionId);
      expect(retrieved?.examType).toBe(examType);
    });
  });

  describe('Journal Operations', () => {
    it('should save and retrieve journal entries for a session chronologically', () => {
      const journal1: JournalEntry = {
        id: 'j1',
        sessionId: testSessionId,
        date: '2026-06-19T10:00:00Z',
        content: 'Felt tired preparing for Mock Exam',
        stress: 7,
        energy: 4,
        mood: 5,
        productivity: 6
      };

      const journal2: JournalEntry = {
        id: 'j2',
        sessionId: testSessionId,
        date: '2026-06-20T10:00:00Z',
        content: 'Productive day, did box breathing!',
        stress: 3,
        energy: 8,
        mood: 8,
        productivity: 9
      };

      db.saveJournal(journal1);
      db.saveJournal(journal2);

      const journals = db.getJournals(testSessionId);
      expect(journals).toHaveLength(2);
      expect(journals[0].id).toBe('j1');
      expect(journals[1].id).toBe('j2');
    });
  });

  describe('Stress Analysis Operations', () => {
    it('should save and load stress analyses correctly', () => {
      const analysis = {
        id: 'stress_1',
        journalId: 'j1',
        sessionId: testSessionId,
        createdAt: new Date().toISOString(),
        triggers: [
          { trigger: 'Academic Load', percentage: 70 }
        ],
        detailedInsights: ['Take a micro break.'],
        anxietyRisk: 65,
        focusScore: 80
      };

      db.saveStressAnalysis(analysis);
      const analyses = db.getStressAnalyses(testSessionId);
      expect(analyses).toBeDefined();
      expect(analyses.length).toBeGreaterThanOrEqual(1);
      expect(analyses.some(a => a.id === 'stress_1')).toBe(true);
    });
  });

  describe('Burnout Predictions and Wellness Plans', () => {
    it('should save and fetch latest burnout prediction', () => {
      const prediction = {
        id: 'burn_1',
        sessionId: testSessionId,
        createdAt: '2026-06-19T12:00:00Z',
        burnoutProbability: 40,
        predictedRisk7Days: 45,
        confidenceScore: 90,
        primaryCauses: ['Study Hours'],
        trend: 'stable' as const,
        explainableAnalysis: 'Keep pacing.'
      };

      const predictionLater = {
        id: 'burn_2',
        sessionId: testSessionId,
        createdAt: '2026-06-20T12:00:00Z',
        burnoutProbability: 50,
        predictedRisk7Days: 55,
        confidenceScore: 92,
        primaryCauses: ['Poor Sleep'],
        trend: 'increasing' as const,
        explainableAnalysis: 'Sleep hygiene needed.'
      };

      db.saveBurnoutPrediction(prediction);
      db.saveBurnoutPrediction(predictionLater);

      const latest = db.getLatestBurnoutPrediction(testSessionId);
      expect(latest).toBeDefined();
      expect(latest?.id).toBe('burn_2');
      expect(latest?.burnoutProbability).toBe(50);
    });

    it('should save and fetch latest wellness plans', () => {
      const plan = {
        id: 'plan_1',
        sessionId: testSessionId,
        createdAt: '2026-06-20T11:00:00Z',
        recoveryPlan: 'Do box breathing',
        studyBreaks: [],
        breathingExercise: {
          name: 'Box Breathing',
          description: 'Calming',
          inhaleSeconds: 4,
          holdSeconds: 4,
          exhaleSeconds: 4,
          cycles: 4
        },
        focusImprovementPlan: 'Study actively',
        sleepImprovementPlan: 'Sleep 8 hours',
        motivationStrategy: 'Daily steps',
        emergencyResourcesRequired: false
      };

      db.saveWellnessPlan(plan);
      const latestPlan = db.getLatestWellnessPlan(testSessionId);
      expect(latestPlan).toBeDefined();
      expect(latestPlan?.id).toBe('plan_1');
    });
  });

  describe('Chat History Operations', () => {
    it('should add to chat histories, clear them, and handle sessions', () => {
      const initialChat = db.getOrCreateChat(testSessionId);
      expect(initialChat).toBeDefined();

      const message: ChatMessage = {
        id: 'm1',
        role: 'user',
        content: 'Hi Dr. Serene',
        timestamp: new Date().toISOString()
      };

      db.addChatMessage(testSessionId, message);
      const currentChat = db.getOrCreateChat(testSessionId);
      expect(currentChat).toHaveLength(1);
      expect(currentChat[0].content).toBe('Hi Dr. Serene');

      db.clearChat(testSessionId);
      const clearedChat = db.getOrCreateChat(testSessionId);
      expect(clearedChat).toHaveLength(0);
    });
  });
});
