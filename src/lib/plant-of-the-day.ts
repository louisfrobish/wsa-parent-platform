import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnvironmentalContext } from "@/lib/context/engine";
import { findRecommendedSpots, resolveLocationContext } from "@/lib/context/nearby-spots";
import { createOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { plantOutputJsonSchema, plantOutputSchema, type PlantOutput, type GenerationRecord } from "@/lib/generations";
import { saveGeneration } from "@/lib/generation-store";
import { PLANT_SPECIES } from "@/lib/plant-species";
import { buildSpeciesGallery, resolveSpeciesPhoto } from "@/lib/species-photo";
import { buildWhyFitsToday, deriveDailyWeatherSignals, pickWeatherAwareSpecies } from "@/lib/weather-aware-species";

type PlantBriefingInput = {
  requestDate: string;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
  radiusMiles: number;
  weatherCondition: string;
  studentId?: string;
  householdMode?: boolean;
};

export async function generatePlantBriefing({
  supabase,
  userId,
  input,
  save = true
}: {
  supabase: SupabaseClient;
  userId: string;
  input: PlantBriefingInput;
  save?: boolean;
}): Promise<{ output: PlantOutput; generation: GenerationRecord | null }> {
  const location = resolveLocationContext(input);
  const environmental = await getEnvironmentalContext(supabase, input);
  const signals = deriveDailyWeatherSignals(environmental);
  const spots = await findRecommendedSpots({
    supabase,
    location,
    activityTag: "general_nature",
    habitatTags: ["woods", "park", "meadow"],
    limit: 4
  });
  const selectedPlant = pickWeatherAwareSpecies(PLANT_SPECIES, input.requestDate, signals, "plant");

  const openai = createOpenAIClient();
  const response = await openai.responses.create({
    model: getOpenAIModel(),
    input: [
      "You are creating a Plant of the Day field briefing for Wild Stallion Academy families.",
      input.householdMode ? "Keep it broad, seasonal, and useful for a family daily field briefing." : "Keep it clear and family-friendly.",
      `Date: ${input.requestDate}`,
      `Location: ${input.locationLabel}`,
      `Weather: ${input.weatherCondition}`,
      `Chosen plant: ${selectedPlant.commonName} (${selectedPlant.scientificName})`,
      `Seasonal fit note: ${buildWhyFitsToday(`${selectedPlant.commonName} fits today because ${selectedPlant.whyToday}.`, signals, selectedPlant.regionalNotes)}`,
      `Likely habitat emphasis: ${selectedPlant.likelyHabitat}`,
      `Nearby habitats: ${spots.map((spot) => `${spot.name} (${spot.spotType})`).join(", ") || "woods, park, and meadow edges"}`,
      "Keep the chosen plant and explain why it makes sense today instead of selecting a different plant.",
      "Return a short field-guide briefing with key features, seasonal note, family challenge, journal prompt, facebook caption, and image fields."
    ].join("\n"),
    text: {
      format: {
        type: "json_schema",
        name: "plant_of_the_day",
        schema: plantOutputJsonSchema
      }
    }
  });

  const baseOutput = plantOutputSchema.parse(JSON.parse(response.output_text));
  const speciesPhoto = await resolveSpeciesPhoto({
    commonName: selectedPlant.commonName,
    scientificName: selectedPlant.scientificName,
    fallbackImageUrl: selectedPlant.imageUrl,
    fallbackImageAlt: selectedPlant.imageAlt,
    guideImageUrl: selectedPlant.imageUrl,
    guideImageAlt: selectedPlant.imageAlt,
    photoLabel: selectedPlant.commonName
  });
  const output = plantOutputSchema.parse({
    ...baseOutput,
    plantName: selectedPlant.commonName,
    scientificName: selectedPlant.scientificName,
    broadExplanation: buildWhyFitsToday(`${selectedPlant.commonName} fits today because ${selectedPlant.whyToday}.`, signals, baseOutput.broadExplanation),
    likelyHabitat: selectedPlant.likelyHabitat,
    imageUrl: speciesPhoto.imageUrl,
    imageAlt: speciesPhoto.imageAlt,
    guideImageUrl: speciesPhoto.guideImageUrl,
    guideImageAlt: speciesPhoto.guideImageAlt,
    quickIdTip: `Quick ID tip: ${baseOutput.keyFeatures[0]}`,
    photoSource: speciesPhoto.photoSource,
    images: buildSpeciesGallery({
      category: "plant",
      slug: selectedPlant.slug,
      commonName: selectedPlant.commonName,
      heroImageUrl: speciesPhoto.imageUrl,
      heroImageAlt: speciesPhoto.imageAlt
    }),
    bestNearbyPlaceType: spots[0]?.spotType?.replaceAll("_", " ") ?? selectedPlant.likelyPlaceType,
    recommendedNearbySpots: spots
  });

  if (!save) return { output, generation: null };

  const generation = (await saveGeneration({
    supabase,
    userId,
    studentId: input.studentId,
    toolType: "plant_of_the_day",
    title: output.plantName,
    inputJson: { ...input, audience: input.householdMode ? "household" : "student" },
    outputJson: output
  })) as GenerationRecord;

  return { output, generation };
}
