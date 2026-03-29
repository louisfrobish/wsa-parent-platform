export type WeatherContextInput = {
  weatherCondition?: string | null;
  requestDate?: string | null;
};

export type WeatherContextSummary = {
  label: string;
  supportLevel: "poor" | "fair" | "good";
  windExposure: "low" | "medium" | "high";
  summary: string;
};

export function mapForecastToWeatherCondition(shortForecast?: string | null, hazards: string[] = []) {
  const combined = `${shortForecast ?? ""} ${hazards.join(" ")}`.trim().toLowerCase();

  if (/(severe thunderstorm|tornado|hurricane|storm warning|flash flood|thunderstorm|severe)/.test(combined)) {
    return "stormy";
  }

  if (/(rain|showers|drizzle|wet|downpour)/.test(combined)) {
    return "rainy";
  }

  if (/(wind|breezy|gust)/.test(combined)) {
    return "windy";
  }

  if (/(sunny|mostly sunny|clear|fair)/.test(combined)) {
    return "clear";
  }

  return "mixed";
}

export function deriveWeatherContext({ weatherCondition, requestDate }: WeatherContextInput): WeatherContextSummary {
  const normalized = (weatherCondition ?? "").trim().toLowerCase();
  const month = requestDate ? new Date(`${requestDate}T12:00:00`).getMonth() + 1 : new Date().getMonth() + 1;
  const seasonalNote =
    month <= 2 || month === 12
      ? "Cool-season conditions can slow long outings."
      : month >= 6 && month <= 8
        ? "Heat and humidity may make shaded or shorter trips feel better."
        : "Mild seasonal conditions support flexible outdoor time.";

  if (/(storm|severe|thunder)/.test(normalized)) {
    return {
      label: "Stormy",
      supportLevel: "poor",
      windExposure: "high",
      summary: `Conditions look rough for a full outing. ${seasonalNote}`
    };
  }

  if (/(rain|drizzle|wet)/.test(normalized)) {
    return {
      label: "Rainy",
      supportLevel: "fair",
      windExposure: "medium",
      summary: `Covered spaces, creek edges, and quick observation stops will work better today. ${seasonalNote}`
    };
  }

  if (/(wind|breezy)/.test(normalized)) {
    return {
      label: "Windy",
      supportLevel: "fair",
      windExposure: "high",
      summary: `Protected woods, creek bends, and quieter coves will likely feel better than open shoreline. ${seasonalNote}`
    };
  }

  if (/(sun|clear|fair)/.test(normalized)) {
    return {
      label: "Clear",
      supportLevel: "good",
      windExposure: "low",
      summary: `Conditions support a straightforward outdoor outing today. ${seasonalNote}`
    };
  }

  return {
    label: "Mixed",
    supportLevel: "fair",
    windExposure: "medium",
    summary: `Conditions are usable, but it helps to keep plans flexible. ${seasonalNote}`
  };
}
