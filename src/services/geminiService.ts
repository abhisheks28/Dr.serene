/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { 
  StressAnalysis, 
  BurnoutPrediction, 
  WellnessPlan, 
  ChatMessage, 
  JournalEntry,
  StudyBreakRecommendation
} from "../types.js";

// Lazy-initialize Gemini SDK to prevent startup crashes when the API key is not yet set.
let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Using simulated outputs.");
      // We will handle missing API key gracefully rather than crashing the Express server on start.
    }
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIInstance;
}

/**
 * Returns whether real Gemini calls are available.
 */
function isAIEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * AI Stress Detective:
 * Uses gemini-3.5-flash with a structured response schema to analyze stress triggers.
 */
export async function analyzeStress(
  content: string, 
  sessionId: string, 
  journalId: string
): Promise<StressAnalysis> {
  const defaultAnalysis: StressAnalysis = {
    id: `stress_${Math.random().toString(36).slice(2, 9)}`,
    journalId,
    sessionId,
    createdAt: new Date().toISOString(),
    triggers: [
      { trigger: "Academic Pressure", percentage: 35 },
      { trigger: "Fear of Failure", percentage: 20 },
      { trigger: "Sleep Issues", percentage: 15 },
      { trigger: "Parent Expectations", percentage: 10 },
      { trigger: "Social Comparison", percentage: 10 },
      { trigger: "Time Management Problems", percentage: 10 }
    ],
    detailedInsights: [
      "Moderate pressure observed from heavy mock mock-tests and competitive preparation syllabus.",
      "Consider setting up a strictly bound wind-down routine 45 minutes before sleep.",
      "Focus on process rather than ultimate test rank comparisons."
    ],
    anxietyRisk: 40,
    focusScore: 75
  };

  if (!isAIEnabled()) {
    return defaultAnalysis;
  }

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following student's private study journal entry and extract emotional indicators, specifically focusing on competitive exam stress (like JEE, NEET, UPSC, SSC, GATE).
      
      Journal text:
      "${content}"`,
      config: {
        systemInstruction: `You are a Psychological Stress Trigger Engine. Your mission is to detect stress indicators and trigger intensities in students.
        Extract precisely 5-8 stress trigger intensities as percentages (sum does not have to be 100%, each is a relative concern level 0-100%).
        Also provide 3 constructive, short, action-focused wellness bullet points to mitigate the triggers.
        Assign an overall anxietyRisk (0-100) and focusScore (0-100).
        Ensure response strictly adheres to the requested JSON format. Be highly empathetic and constructive. Do not mention system details.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["triggers", "detailedInsights", "anxietyRisk", "focusScore"],
          properties: {
            triggers: {
              type: Type.ARRAY,
              description: "Stress trigger labels (e.g., 'Academic Pressure', 'Parent Expectations', 'Fear of Failure', 'Sleep Issues', 'Time Management', 'Social Comparison', 'Motivation Loss', 'Anxiety Patterns') and their parsed intensity value from 0 to 100.",
              items: {
                type: Type.OBJECT,
                required: ["trigger", "percentage"],
                properties: {
                  trigger: { type: Type.STRING },
                  percentage: { type: Type.INTEGER }
                }
              }
            },
            detailedInsights: {
              type: Type.ARRAY,
              description: "Three concise, highly empathetic, supportive, action-oriented items directly countering the detected triggers.",
              items: { type: Type.STRING }
            },
            anxietyRisk: {
              type: Type.INTEGER,
              description: "Overall evaluated anxiety risk (0 to 100)."
            },
            focusScore: {
              type: Type.INTEGER,
              description: "Current focus / productivity coefficient (0 to 100)."
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        id: `stress_${Math.random().toString(36).slice(2, 9)}`,
        journalId,
        sessionId,
        createdAt: new Date().toISOString(),
        triggers: parsed.triggers || defaultAnalysis.triggers,
        detailedInsights: parsed.detailedInsights || defaultAnalysis.detailedInsights,
        anxietyRisk: parsed.anxietyRisk !== undefined ? parsed.anxietyRisk : defaultAnalysis.anxietyRisk,
        focusScore: parsed.focusScore !== undefined ? parsed.focusScore : defaultAnalysis.focusScore
      };
    }
  } catch (err) {
    console.error("Gemini analyzeStress failed, returning safety fallback:", err);
  }

  return defaultAnalysis;
}

/**
 * Burnout Prediction Engine:
 * Predicts current burnout, future 7-day burnout trajectory, confidence, and primary factors.
 */
export async function predictBurnout(
  history: JournalEntry[], 
  sessionId: string
): Promise<BurnoutPrediction> {
  const defaultPrediction: BurnoutPrediction = {
    id: `burn_${Math.random().toString(36).slice(2, 9)}`,
    sessionId,
    createdAt: new Date().toISOString(),
    burnoutProbability: 45,
    predictedRisk7Days: 52,
    confidenceScore: 85,
    primaryCauses: ["Heavy preparation loads", "Irregular sleep patterns"],
    trend: 'stable',
    explainableAnalysis: "Your academic load is consistent. Increasing structured breaks keeps your risk in check."
  };

  if (history.length === 0) {
    return defaultPrediction;
  }

  if (!isAIEnabled()) {
    // Generate a reasonable simulated trend if AI is not enabled
    const latest = history[history.length - 1];
    const avgStress = history.reduce((sum, h) => sum + h.stress, 0) / history.length;
    const avgSleep = history.reduce((sum, h) => sum + (10 - h.energy), 0) / history.length; 
    
    const prob = Math.round(Math.min(100, Math.max(0, (avgStress * 7) + (avgSleep * 3))));
    const risk7Days = Math.round(Math.min(100, Math.max(0, prob + (latest.stress > 6 ? 8 : -4))));
    const trend = risk7Days > prob ? 'increasing' : risk7Days < prob ? 'decreasing' : 'stable';

    return {
      ...defaultPrediction,
      burnoutProbability: prob,
      predictedRisk7Days: risk7Days,
      trend,
      primaryCauses: latest.stress > 6 ? ["Increasing study intensity", "Elevated pressure perception", "Sleep reduction"] : ["Standard academic workload"],
      explainableAnalysis: `Based on your recent logs with average stress of ${avgStress.toFixed(1)}/10, your burnout risk is ${trend}. Supporting study habits with mindful pacing is highly encouraged.`
    };
  }

  try {
    const ai = getGenAI();
    
    const logsText = history.slice(-5).map((log, idx) => (
      `Log #${idx+1}: Date: ${log.date.slice(0, 10)}, Stress: ${log.stress}/10, Energy: ${log.energy}/10, Mood: ${log.mood}/10, Productivity: ${log.productivity}/10. Journal snippet: "${log.content.slice(0, 150)}"`
    )).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert Psychological Burnout Prediction Engine. Below are the last 5 days of a student preparing for intense competitive examinations.
      
      Study logs:
      ${logsText}
      
      Analyze these trends to output a detailed Burnout Forecast. Ensure values are mathematically coherent based on standard psychological burnout fatigue indexes (Maslach Burnout Inventory coefficients).`,
      config: {
        systemInstruction: "Assess burnout level, 7-day risk estimate, prediction confidence (0-100), primary contributing triggers, and a neat, concise clinical explanation of why the score exists. Output strictly valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["burnoutProbability", "predictedRisk7Days", "confidenceScore", "primaryCauses", "trend", "explainableAnalysis"],
          properties: {
            burnoutProbability: {
              type: Type.INTEGER,
              description: "Current calculated burnout risk percentage (0 to 100)."
            },
            predictedRisk7Days: {
              type: Type.INTEGER,
              description: "Calculated trajectory projection in 7 days (0 to 100)."
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: "Mathematical confidence coefficient (0 to 100) based on logging density."
            },
            primaryCauses: {
              type: Type.ARRAY,
              description: "Up to 3 specific core academic/physical/mental pain-points detected.",
              items: { type: Type.STRING }
            },
            trend: {
              type: Type.STRING,
              description: "Directional pattern: 'increasing', 'stable', or 'decreasing'."
            },
            explainableAnalysis: {
              type: Type.STRING,
              description: "A supportive, 2-3 sentence personalized prediction breakdown highlighting why these estimates exist."
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        id: `burn_${Math.random().toString(36).slice(2, 9)}`,
        sessionId,
        createdAt: new Date().toISOString(),
        burnoutProbability: parsed.burnoutProbability !== undefined ? parsed.burnoutProbability : defaultPrediction.burnoutProbability,
        predictedRisk7Days: parsed.predictedRisk7Days !== undefined ? parsed.predictedRisk7Days : defaultPrediction.predictedRisk7Days,
        confidenceScore: parsed.confidenceScore !== undefined ? parsed.confidenceScore : defaultPrediction.confidenceScore,
        primaryCauses: parsed.primaryCauses || defaultPrediction.primaryCauses,
        trend: parsed.trend as any || defaultPrediction.trend,
        explainableAnalysis: parsed.explainableAnalysis || defaultPrediction.explainableAnalysis
      };
    }
  } catch (err) {
    console.error("Gemini predictBurnout failed, using fallback:", err);
  }

  return defaultPrediction;
}

/**
 * AI Wellness Coach:
 * Generates custom, actionable recovery routines, optimal study breaks, and focused guidelines.
 */
export async function generateWellnessPlan(
  latestAnalysis: StressAnalysis | undefined,
  prediction: BurnoutPrediction | undefined,
  sessionId: string,
  examType: string
): Promise<WellnessPlan> {
  const defaultPlan: WellnessPlan = {
    id: `plan_${Math.random().toString(36).slice(2, 9)}`,
    sessionId,
    createdAt: new Date().toISOString(),
    recoveryPlan: `Maintain your study momentum with strategic pauses. Set a 50-minute timer for deep, undisturbed study, then reward yourself with 10 minutes of active relaxation.`,
    studyBreaks: [
      { type: "Physical Micro-recharge", durationMinutes: 10, description: "Do a 5-minute passive stretch followed by a gentle walk to increase cerebral blood flow." },
      { type: "Sensory Wind-down", durationMinutes: 15, description: "Rest your eyes with hydration and look at far distances to reverse orbital muscle tension." }
    ],
    breathingExercise: {
      name: "Box Breathing (Sama Vritti)",
      description: "A powerful autonomic regulator used by high-performers for clear cerebral focus.",
      inhaleSeconds: 4,
      holdSeconds: 4,
      exhaleSeconds: 4,
      cycles: 4
    },
    focusImprovementPlan: "Incorporate the Pomodoro technique with full terminal blocks (turn off all social feeds). Tackle the hardest subjects first when focus is highest.",
    sleepImprovementPlan: "Limit display exposure and high-dopamine inputs after 10:00 PM. Keep your study area physically separated from your sleeping zone if possible.",
    motivationStrategy: "Focus on incremental concepts mastered rather than the entire competitive syllabus. Mastering small segments breeds confidence.",
    emergencyResourcesRequired: false
  };

  if (!isAIEnabled()) {
    return defaultPlan;
  }

  try {
    const ai = getGenAI();
    const prompt = `Develop a highly tailored Wellness Recovery Plan for a student preparing for the intensely competitive ${examType} syllabus.
    
    Latest stress triggers detected: ${latestAnalysis ? latestAnalysis.triggers.map(t => `${t.trigger} (${t.percentage}%)`).join(", ") : "N/A"}
    Latest burnout risk projected: ${prediction ? `${prediction.burnoutProbability}% (${prediction.trend} trend)` : "N/A"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an elite Student Academic Coach and cognitive wellness therapist. Generate a personalized, highly tactical mental recovery routine.
        We need:
        1. recoveryPlan: A brief, warm greeting containing strategic pacing suggestions.
        2. studyBreaks: Exactly two specified concrete rest techniques, with duration and descriptions.
        3. breathingExercise: A breathing ritual (like Box, 4-7-8, or Coherent Breathing) designed to restore calm focus.
        4. focusImprovementPlan: syllabus-pacing guidelines.
        5. sleepImprovementPlan: sleep hygiene tailored for high academic cognitive loads.
        6. motivationStrategy: actionable growth mindset hacks for competitive testing.
        7. emergencyResourcesRequired: set to true if the student points out suicidal language, active emergency crisis signs, or severe hopelessness.
        Ensure response strictly adheres to valid JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "recoveryPlan", 
            "studyBreaks", 
            "breathingExercise", 
            "focusImprovementPlan", 
            "sleepImprovementPlan", 
            "motivationStrategy",
            "emergencyResourcesRequired"
          ],
          properties: {
            recoveryPlan: { type: Type.STRING },
            studyBreaks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "durationMinutes", "description"],
                properties: {
                  type: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  description: { type: Type.STRING }
                }
              }
            },
            breathingExercise: {
              type: Type.OBJECT,
              required: ["name", "description", "inhaleSeconds", "holdSeconds", "exhaleSeconds", "cycles"],
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                inhaleSeconds: { type: Type.INTEGER },
                holdSeconds: { type: Type.INTEGER },
                exhaleSeconds: { type: Type.INTEGER },
                cycles: { type: Type.INTEGER }
              }
            },
            focusImprovementPlan: { type: Type.STRING },
            sleepImprovementPlan: { type: Type.STRING },
            motivationStrategy: { type: Type.STRING },
            emergencyResourcesRequired: { type: Type.BOOLEAN }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        id: `plan_${Math.random().toString(36).slice(2, 9)}`,
        sessionId,
        createdAt: new Date().toISOString(),
        recoveryPlan: parsed.recoveryPlan || defaultPlan.recoveryPlan,
        studyBreaks: parsed.studyBreaks || defaultPlan.studyBreaks,
        breathingExercise: parsed.breathingExercise || defaultPlan.breathingExercise,
        focusImprovementPlan: parsed.focusImprovementPlan || defaultPlan.focusImprovementPlan,
        sleepImprovementPlan: parsed.sleepImprovementPlan || defaultPlan.sleepImprovementPlan,
        motivationStrategy: parsed.motivationStrategy || defaultPlan.motivationStrategy,
        emergencyResourcesRequired: !!parsed.emergencyResourcesRequired
      };
    }
  } catch (err) {
    console.error("Gemini generateWellnessPlan failed, returning mock:", err);
  }

  return defaultPlan;
}

/**
 * AI Companion Counselor:
 * Empathetic interactive counselor that retains complete user context (past journals, mood patterns, and current stress reports).
 */
export async function generateCompanionChatResponse(
  currentMessage: string,
  history: ChatMessage[],
  journals: JournalEntry[],
  latestAnalysis: StressAnalysis | undefined,
  examType: string
): Promise<string> {
  const fallbackMessage = "I hear you, and preparing for competitive exams like " + examType + " can feel incredibly overwhelming. Let's break down this concept or pressure together; remember, small consistent daily steps are the absolute key, and physical pacing is just as valuable as long hours.";
  
  if (!isAIEnabled()) {
    return fallbackMessage;
  }

  try {
    const ai = getGenAI();
    
    // Inject student summary into system instructions
    const latestTriggersText = latestAnalysis 
      ? latestAnalysis.triggers.map(t => `${t.trigger}: ${t.percentage}%`).join(", ") 
      : "No triggers calculated yet";
    
    const contextPrompt = `You are a warm, extremely empathetic Academic Mentor, Student Wellness Counselor, and psychological coach named Dr. Serene.
    You specialize in helping students navigate the immense preparation pressure of competitive Indian and global exams like ${examType}.
    You do NOT give answers to subjects; you address the student's anxiety, fears, imposter syndrome, stress, parent pressure, and physical exhaustion.
    
    STUDENT DOSSIER / CURRENT PROFILE:
    - Target Exam: ${examType}
    - Total Private Journals Authored: ${journals.length}
    - Latest Parsed Stress Triggers: ${latestTriggersText}
    - Latest Journal Entry: "${journals.length > 0 ? journals[journals.length - 1].content.slice(0, 300) : "None"}"
    
    INSTRUCTIONS FOR INTERACTION:
    1. Be highly positive, encouraging, and deeply respectful of the enormous effort required for prep.
    2. Write in short, human-friendly, clean paragraphs.
    3. Include 1 practical mindfulness or cognitive framing tip (like questioning negative self-talk) when relevant.
    4. Guard against self-harm or deep crisis: immediately provide supportive comfort and guide gently to professional support without sounding robotic.
    
    CONVERSATION HISTORY:
    ${history.slice(-10).map(m => `${m.role === 'user' ? 'Student' : 'Dr. Serene'}: ${m.content}`).join("\n")}
    
    Student: "${currentMessage}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || fallbackMessage;
  } catch (err) {
    console.error("Gemini companion chat failed, using fallback:", err);
    return fallbackMessage;
  }
}
