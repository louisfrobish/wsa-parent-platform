import type { SupabaseClient } from "@supabase/supabase-js";
import { getBirdMigrationContext, type BirdContext } from "@/lib/context/birds/birdcast";
import { getMarylandDnrFishingContext, type MarylandDnrFishingContext } from "@/lib/context/fishing/maryland-dnr";
import { resolveLocationContext, type LocationContextInput, type ResolvedLocationContext } from "@/lib/context/nearby-spots";
import { getSolunarSummary, type SolunarSummary } from "@/lib/context/solunar";
import { deriveWeatherContext } from "@/lib/context/weather";
import { getNwsWeatherContext, type WeatherContext } from "@/lib/context/weather/nws";
import { getNearbyUsgsWaterContext, type WaterContext } from "@/lib/context/water/usgs";

export type EnvironmentalContext = {
  location: ResolvedLocationContext;
  weather: WeatherContext | null;
  water: WaterContext | null;
  bird: BirdContext;
  marylandDnr: MarylandDnrFishingContext;
  solunar: SolunarSummary;
  fallbackWeatherSummary: ReturnType<typeof deriveWeatherContext>;
};

export async function getEnvironmentalContext(
  supabase: SupabaseClient,
  input: LocationContextInput & {
    requestDate: string;
    weatherCondition?: string | null;
  }
): Promise<EnvironmentalContext> {
  void supabase;

  const location = resolveLocationContext(input);
  const [weather, water] = await Promise.all([
    location.latitude !== null && location.longitude !== null ? getNwsWeatherContext(location.latitude, location.longitude) : Promise.resolve(null),
    location.latitude !== null && location.longitude !== null
      ? getNearbyUsgsWaterContext(location.latitude, location.longitude, location.displayLabel)
      : Promise.resolve(null)
  ]);

  return {
    location,
    weather,
    water,
    bird: getBirdMigrationContext(input.requestDate, location.displayLabel),
    marylandDnr: getMarylandDnrFishingContext(input.requestDate),
    solunar: getSolunarSummary(input.requestDate),
    fallbackWeatherSummary: deriveWeatherContext(input)
  };
}
