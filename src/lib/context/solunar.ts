export type SolunarSummary = {
  rating: "low" | "moderate" | "high";
  bestWindow: string;
  summary: string;
};

export function getSolunarSummary(requestDate: string) {
  const date = new Date(`${requestDate}T12:00:00`);
  const phaseIndex = getMoonPhaseIndex(date);

  if (phaseIndex <= 1 || phaseIndex >= 7) {
    return {
      rating: "high",
      bestWindow: "early morning and the last two hours before sunset",
      summary: "Moon timing is one supportive factor today, especially near dawn and late afternoon."
    } satisfies SolunarSummary;
  }

  if (phaseIndex === 3 || phaseIndex === 4) {
    return {
      rating: "low",
      bestWindow: "focus more on calm weather windows than moon timing",
      summary: "Solunar timing is less compelling today, so weather, access, and shade matter more."
    } satisfies SolunarSummary;
  }

  return {
    rating: "moderate",
    bestWindow: "morning or late afternoon",
    summary: "Solunar timing is moderately favorable, but it should be treated as just one factor."
  } satisfies SolunarSummary;
}

function getMoonPhaseIndex(date: Date) {
  const synodicMonth = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  return Math.floor((phase / synodicMonth) * 8);
}
