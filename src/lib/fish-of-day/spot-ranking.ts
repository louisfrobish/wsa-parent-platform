import type { RecommendedSpot } from "@/lib/context/nearby-spots";
import type { WaterType } from "@/lib/fish-of-day/water-type";
import { inferWaterTypeFromSpotType } from "@/lib/fish-of-day/water-type";

export function rankSpotsForWaterType(spots: RecommendedSpot[], waterType: WaterType) {
  return [...spots]
    .sort((a, b) => scoreSpotForWaterType(b, waterType) - scoreSpotForWaterType(a, waterType))
    .map((spot) => {
      const inferred = spot.waterType ?? inferWaterTypeFromSpotType(spot.spotType);
      if (inferred !== waterType) return spot;

      return {
        ...spot,
        reason: `${spot.reason} This one is especially aligned with today's ${waterType.replace("_", " ")} plan.`,
        recommendedUseToday:
          waterType === "shoreline"
            ? "Best for a short shoreline session or a quick bait-movement scout."
            : waterType === "river" || waterType === "creek"
              ? "Best for careful current reading, short casts, or family scouting."
              : "Best for a calm family fishing stop close to cover and easy bank access."
      };
    });
}

function scoreSpotForWaterType(spot: RecommendedSpot, waterType: WaterType) {
  const inferred = spot.waterType ?? inferWaterTypeFromSpotType(spot.spotType);
  let score = inferred === waterType ? 10 : 0;
  if (spot.familyFriendly) score += 2;
  if (spot.distanceMiles !== null) score += Math.max(0, 6 - spot.distanceMiles);
  return score;
}
