export type SeasonLabel = "spring" | "summer" | "fall" | "winter";

export type SeasonalSpecies = {
  slug: string;
  commonName: string;
  scientificName: string;
  monthsActive: number[];
  seasons?: SeasonLabel[];
  regionalNotes?: string;
};

export function getMonthFromDate(requestDate?: string) {
  const fallback = new Date();
  if (!requestDate) return fallback.getMonth() + 1;
  const parsed = new Date(requestDate);
  if (Number.isNaN(parsed.getTime())) return fallback.getMonth() + 1;
  return parsed.getMonth() + 1;
}

export function getSeasonForMonth(month: number): SeasonLabel {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

export function filterSpeciesForMonth<T extends SeasonalSpecies>(species: T[], month: number) {
  const directMatches = species.filter((entry) => entry.monthsActive.includes(month));
  if (directMatches.length) return directMatches;

  const season = getSeasonForMonth(month);
  const seasonMatches = species.filter((entry) => entry.seasons?.includes(season));
  return seasonMatches.length ? seasonMatches : species;
}

export function pickSeasonalSpecies<T extends SeasonalSpecies>(species: T[], requestDate?: string, salt = "") {
  const month = getMonthFromDate(requestDate);
  const pool = filterSpeciesForMonth(species, month);
  const key = `${requestDate ?? "today"}:${salt}`;
  const index = stableHash(key) % Math.max(pool.length, 1);
  return pool[index] ?? species[0];
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
