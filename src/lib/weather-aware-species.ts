import type { EnvironmentalContext } from "@/lib/context/engine";
import type { BirdContext } from "@/lib/context/birds/birdcast";
import { getMonthFromDate, pickSeasonalSpecies, type SeasonalSpecies } from "@/lib/seasonal-species";

export type DailyWeatherTag =
  | "rain"
  | "damp"
  | "sun"
  | "warm"
  | "cool"
  | "wind"
  | "calm"
  | "migration"
  | "shoreline"
  | "woods"
  | "wetland"
  | "meadow"
  | "structure"
  | "low-light"
  | "scouting";

export type WeatherAwareSpecies = SeasonalSpecies & {
  weatherTags?: DailyWeatherTag[];
};

export type DailyWeatherSignals = {
  tags: Set<DailyWeatherTag>;
  supportLevel: "poor" | "fair" | "good";
  weatherPhrase: string;
  migrationLevel: BirdContext["migrationLevel"];
};

export function deriveDailyWeatherSignals(environmental: EnvironmentalContext) {
  const tags = new Set<DailyWeatherTag>();
  const forecastText = `${environmental.weather?.shortForecast ?? ""} ${environmental.fallbackWeatherSummary.summary}`.toLowerCase();
  const temperature = environmental.weather?.temperature;
  const precipitation = environmental.weather?.precipitationChance ?? 0;

  if (/(rain|drizzle|shower|wet|storm)/.test(forecastText) || precipitation >= 45) {
    tags.add("rain");
    tags.add("damp");
    tags.add("wetland");
  }

  if (/(sun|clear|fair|bright)/.test(forecastText)) {
    tags.add("sun");
    tags.add("calm");
  }

  if (/(wind|breezy|gust)/.test(forecastText) || environmental.fallbackWeatherSummary.windExposure === "high") {
    tags.add("wind");
    tags.add("shoreline");
    tags.add("structure");
  }

  if (typeof temperature === "number" && temperature >= 68) {
    tags.add("warm");
    tags.add("sun");
  }

  if ((typeof temperature === "number" && temperature <= 50) || /(cool|cold|chilly|gray|cloudy|overcast)/.test(forecastText)) {
    tags.add("cool");
    tags.add("woods");
    tags.add("scouting");
  }

  if (environmental.solunar.bestWindow.toLowerCase().includes("morning") || environmental.solunar.bestWindow.toLowerCase().includes("sunset")) {
    tags.add("low-light");
  }

  if (environmental.bird.migrationLevel !== "low") {
    tags.add("migration");
  }

  if (environmental.fallbackWeatherSummary.supportLevel !== "good") {
    tags.add("scouting");
  }

  return {
    tags,
    supportLevel: environmental.fallbackWeatherSummary.supportLevel,
    weatherPhrase: buildWeatherPhrase(environmental, tags),
    migrationLevel: environmental.bird.migrationLevel
  } satisfies DailyWeatherSignals;
}

export function pickWeatherAwareSpecies<T extends WeatherAwareSpecies>(
  species: T[],
  requestDate: string | undefined,
  signals: DailyWeatherSignals,
  salt: string
) {
  const month = getMonthFromDate(requestDate);
  const scored = species
    .filter((entry) => entry.monthsActive.includes(month) || Boolean(entry.seasons?.length))
    .map((entry) => ({
      entry,
      score: scoreSpecies(entry, signals)
    }))
    .sort((left, right) => right.score - left.score || left.entry.slug.localeCompare(right.entry.slug));

  const bestScore = scored[0]?.score ?? 0;
  const bestPool = scored.filter((item) => item.score === bestScore).map((item) => item.entry);
  return pickSeasonalSpecies(bestPool.length ? bestPool : species, requestDate, salt);
}

export function buildWhyFitsToday(baseReason: string, signals: DailyWeatherSignals, extra?: string) {
  return [baseReason, signals.weatherPhrase, extra].filter(Boolean).join(" ").trim();
}

function scoreSpecies(species: WeatherAwareSpecies, signals: DailyWeatherSignals) {
  const tags = species.weatherTags ?? [];
  return tags.reduce((score, tag) => score + (signals.tags.has(tag) ? 2 : 0), 0);
}

function buildWeatherPhrase(environmental: EnvironmentalContext, tags: Set<DailyWeatherTag>) {
  if (tags.has("rain")) {
    return "The damp conditions make wet edges, fresh movement, and easier-to-notice nature clues more likely today.";
  }

  if (tags.has("wind")) {
    return "The wind makes protected edges, stronger fliers, and structure-oriented observation more useful today.";
  }

  if (tags.has("warm") && tags.has("sun")) {
    return "The warmer, brighter conditions make active basking, feeding, and edge habitat easier to notice today.";
  }

  if (tags.has("cool")) {
    return "The cooler, quieter feel makes slower observation, bark-and-bud study, and sheltered habitat a better fit today.";
  }

  return environmental.fallbackWeatherSummary.summary;
}
