import type { RecommendedSpot } from "@/lib/context/nearby-spots";

export const waterTypes = ["pond", "lake", "creek", "river", "shoreline"] as const;
export type WaterType = (typeof waterTypes)[number];

export function inferWaterTypeFromSpotType(value: string) {
  const text = value.toLowerCase();
  if (text.includes("shoreline") || text.includes("marsh")) return "shoreline" satisfies WaterType;
  if (text.includes("creek") || text.includes("stream")) return "creek" satisfies WaterType;
  if (text.includes("river")) return "river" satisfies WaterType;
  if (text.includes("lake")) return "lake" satisfies WaterType;
  return "pond" satisfies WaterType;
}

export function inferWaterTypeFromRecommendedSpots(spots: RecommendedSpot[]): WaterType {
  const counts = new Map<WaterType, number>();
  for (const type of waterTypes) counts.set(type, 0);

  for (const spot of spots) {
    const inferred = normalizeWaterType(spot.waterType) ?? inferWaterTypeFromSpotType(spot.spotType);
    counts.set(inferred, (counts.get(inferred) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "pond";
}

export function getWaterTypeLabel(waterType: WaterType) {
  switch (waterType) {
    case "pond":
      return "Pond water";
    case "lake":
      return "Lake water";
    case "creek":
      return "Creek water";
    case "river":
      return "River water";
    case "shoreline":
      return "Shoreline or tidal water";
  }
}

function normalizeWaterType(value: string | null | undefined): WaterType | null {
  if (!value) return null;
  return waterTypes.includes(value as WaterType) ? (value as WaterType) : null;
}
