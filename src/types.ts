/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Target competitive examinations
export type ExamType = 'JEE' | 'NEET' | 'UPSC' | 'GATE' | 'CAT' | 'CUET' | 'SSC' | 'Banking' | 'Government Exams' | 'Other';

export interface User {
  email: string;
  password?: string;
  salt?: string;
  examType: ExamType;
  createdAt: string;
}

export interface AnonymousSession {
  id: string;
  createdAt: string;
  examType: ExamType;
}

export interface JournalEntry {
  id: string;
  sessionId: string;
  date: string; // ISO String
  content: string;
  mood: number;         // 1-10
  energy: number;       // 1-10
  stress: number;       // 1-10
  productivity: number; // 1-10
}

export interface StressTriggerIntensity {
  trigger: string;
  percentage: number;
}

export interface StressAnalysis {
  id: string;
  journalId: string;
  sessionId: string;
  createdAt: string;
  triggers: StressTriggerIntensity[];
  detailedInsights: string[];
  anxietyRisk: number; // 0-100
  focusScore: number; // 0-100
}

export interface BurnoutPrediction {
  id: string;
  sessionId: string;
  createdAt: string;
  burnoutProbability: number; // 0-100
  predictedRisk7Days: number; // 0-100
  confidenceScore: number;    // 0-100
  primaryCauses: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  explainableAnalysis: string;
}

export interface StudyBreakRecommendation {
  type: string;
  durationMinutes: number;
  description: string;
}

export interface WellnessPlan {
  id: string;
  sessionId: string;
  createdAt: string;
  recoveryPlan: string;
  studyBreaks: StudyBreakRecommendation[];
  breathingExercise: {
    name: string;
    description: string;
    inhaleSeconds: number;
    holdSeconds: number;
    exhaleSeconds: number;
    cycles: number;
  };
  focusImprovementPlan: string;
  sleepImprovementPlan: string;
  motivationStrategy: string;
  emergencyResourcesRequired: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

export interface EmergencyAlert {
  id: string;
  sessionId: string;
  createdAt: string;
  triggeredBy: string; // 'keyword' | 'extreme_stress' | 'burnout_crisis'
  severity: 'severe' | 'critical';
  supportResources: {
    name: string;
    contact: string;
    hours: string;
    description: string;
  }[];
  activeCopers: string[];
}

export interface DashboardStats {
  wellnessScore: number; // 0-100
  burnoutRisk: number; // 0-100
  productivityAverage: number; // 1-10
  stressAverage: number; // 1-10
  examType: ExamType;
  moodTimeline: { date: string; mood: number; stress: number; energy: number; productivity: number }[];
  stressTriggers: StressTriggerIntensity[];
  burnoutForecast: { day: string; predictedRisk: number }[];
  weeklyInsights: string[];
  monthlyInsights: string[];
}
