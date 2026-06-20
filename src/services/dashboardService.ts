import { 
  JournalEntry, 
  StressAnalysis, 
  BurnoutPrediction, 
  DashboardStats, 
  ExamType 
} from '../types.js';

export function calculateDashboardStats(
  examType: ExamType,
  journals: JournalEntry[],
  analyses: StressAnalysis[],
  latestPrediction: BurnoutPrediction | undefined
): DashboardStats {
  let wellnessScore = 0;
  let finalBurnoutRisk = 0;
  let prodAvg = 0.0;
  let stressAvg = 0.0;
  let moodTimeline: Array<{ date: string; mood: number; stress: number; energy: number; productivity: number }> = [];
  let finalTriggers: Array<{ trigger: string; percentage: number }> = [];
  let burnoutForecast: Array<{ day: string; predictedRisk: number }> = [];
  let weeklyInsights: string[] = [];
  let monthlyInsights: string[] = [];

  if (journals.length === 0) {
    wellnessScore = 0;
    finalBurnoutRisk = 0;
    prodAvg = 0;
    stressAvg = 0;
    moodTimeline = [];
    finalTriggers = [];
    burnoutForecast = [];
    weeklyInsights = [
      "Your dashboard is ready! Tap 'Wellness Logs' to write your first student diary entry to initialize personalized stress analysis."
    ];
    monthlyInsights = [
      "Once your logs are recorded, Dr. Serene will populate this space with dynamic cognitive advice, pacing reminders, and clinical triggers."
    ];
  } else {
    const scores = journals.map(j => {
      const inverseStress = 10 - j.stress;
      return (j.mood * 10 + j.energy * 10 + j.productivity * 10 + inverseStress * 10) / 4;
    });
    wellnessScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const riskCoefficient = latestPrediction ? latestPrediction.burnoutProbability : 30;
    finalBurnoutRisk = Math.round(riskCoefficient);

    prodAvg = Number((journals.reduce((sum, j) => sum + j.productivity, 0) / journals.length).toFixed(1));
    stressAvg = Number((journals.reduce((sum, j) => sum + j.stress, 0) / journals.length).toFixed(1));

    moodTimeline = journals.map(j => {
      const formattedDate = new Date(j.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return {
        date: formattedDate,
        mood: j.mood,
        stress: j.stress,
        energy: j.energy,
        productivity: j.productivity
      };
    });

    const computedTriggers: Record<string, { total: number; count: number }> = {};
    analyses.forEach(sa => {
      sa.triggers.forEach(t => {
        if (!computedTriggers[t.trigger]) {
          computedTriggers[t.trigger] = { total: 0, count: 0 };
        }
        computedTriggers[t.trigger].total += t.percentage;
        computedTriggers[t.trigger].count += 1;
      });
    });

    const compiledTriggers = Object.keys(computedTriggers).map(key => ({
      trigger: key,
      percentage: Math.round(computedTriggers[key].total / computedTriggers[key].count)
    })).sort((a, b) => b.percentage - a.percentage);

    finalTriggers = compiledTriggers;

    const dayLabels = ["Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "7-Day Risk"];
    const currentProbability = latestPrediction ? latestPrediction.burnoutProbability : 40;
    const targetRisk = latestPrediction ? latestPrediction.predictedRisk7Days : 50;

    burnoutForecast = dayLabels.map((day, ix) => {
      const factor = ix / (dayLabels.length - 1);
      const predictedRisk = Math.round(currentProbability + (targetRisk - currentProbability) * factor);
      return { day, predictedRisk };
    });

    weeklyInsights = [
      `Focus index is pacing at ${prodAvg}/10. Keep utilizing short 5-minute walks during sessions.`,
      latestPrediction && latestPrediction.burnoutProbability > 60 
        ? "CRITICAL WARNING: Continuous cognitive exhaustion detected. Elevate your rest intervals immediately." 
        : "Workload and fatigue correlation is within optimal ranges. Maintain structured pauses."
    ];

    monthlyInsights = [
      `Stress trends average ${stressAvg}/10. Focus on incremental mastering techniques before mock papers.`,
      "Prioritize sleeping minimum 7 hours before big mock-test releases to optimize cognitive scores."
    ];
  }

  return {
    wellnessScore,
    burnoutRisk: finalBurnoutRisk,
    productivityAverage: prodAvg,
    stressAverage: stressAvg,
    examType,
    moodTimeline,
    stressTriggers: finalTriggers,
    burnoutForecast,
    weeklyInsights,
    monthlyInsights
  };
}
