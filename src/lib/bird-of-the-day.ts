import type { SupabaseClient } from "@supabase/supabase-js";
import { BIRD_SPECIES } from "@/lib/bird-species";
import { getAnimalHabitatRecommendation } from "@/lib/context/animal-habitat";
import { getEnvironmentalContext } from "@/lib/context/engine";
import { createOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { birdOutputJsonSchema, birdOutputSchema, type BirdOutput, type GenerationRecord } from "@/lib/generations";
import { saveGeneration } from "@/lib/generation-store";
import { buildSpeciesGallery, resolveSpeciesPhoto } from "@/lib/species-photo";
import { buildWhyFitsToday, deriveDailyWeatherSignals, pickWeatherAwareSpecies } from "@/lib/weather-aware-species";

type BirdBriefingInput = {
  requestDate: string;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
  radiusMiles: number;
  weatherCondition: string;
  studentId?: string;
  householdMode?: boolean;
};

export async function generateBirdBriefing({
  supabase,
  userId,
  input,
  save = true
}: {
  supabase: SupabaseClient;
  userId: string;
  input: BirdBriefingInput;
  save?: boolean;
}): Promise<{ output: BirdOutput; generation: GenerationRecord | null }> {
  const environmental = await getEnvironmentalContext(supabase, input);
  const signals = deriveDailyWeatherSignals(environmental);
  const selectedBird = pickWeatherAwareSpecies(BIRD_SPECIES, input.requestDate, signals, "bird");
  const openai = createOpenAIClient();
  const response = await openai.responses.create({
    model: getOpenAIModel(),
    input: [
      "You are creating a Bird of the Day field briefing for Wild Stallion Academy families.",
      input.householdMode
        ? "Keep it broad, parent-friendly, practical, and rooted in what a family might notice today."
        : "Keep it age-aware if a student later uses this, but do not make it childish.",
      `Date: ${input.requestDate}`,
      `Location: ${input.locationLabel}`,
      `Weather: ${input.weatherCondition}`,
      `Chosen bird: ${selectedBird.commonName} (${selectedBird.scientificName})`,
      `Seasonal fit note: ${buildWhyFitsToday(`${selectedBird.commonName} fits today because ${selectedBird.whyToday}.`, signals, selectedBird.regionalNotes)}`,
      `Likely habitat emphasis: ${selectedBird.habitat}`,
      `Likely place type: ${selectedBird.likelyPlaceType}`,
      "Keep the chosen bird and explain why it makes sense today instead of selecting a different species.",
      "Return a short field-guide briefing with field marks, listening cues, family challenge, journal prompt, facebook caption, and image fields."
    ].join("\n"),
    text: {
      format: {
        type: "json_schema",
        name: "bird_of_the_day",
        schema: birdOutputJsonSchema
      }
    }
  });

  const baseOutput = birdOutputSchema.parse(JSON.parse(response.output_text));
  const habitatRecommendation = await getAnimalHabitatRecommendation(supabase, {
    animalName: selectedBird.commonName,
    habitatText: selectedBird.habitat,
    requestDate: input.requestDate,
    locationLabel: input.locationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMiles: input.radiusMiles,
    weatherCondition: input.weatherCondition
  });
  const speciesPhoto = await resolveSpeciesPhoto({
    commonName: selectedBird.commonName,
    scientificName: selectedBird.scientificName,
    fallbackImageUrl: selectedBird.imageUrl,
    fallbackImageAlt: selectedBird.imageAlt,
    guideImageUrl: selectedBird.imageUrl,
    guideImageAlt: selectedBird.imageAlt,
    photoLabel: selectedBird.commonName
  });

  const output = birdOutputSchema.parse({
    ...baseOutput,
    birdName: selectedBird.commonName,
    scientificName: selectedBird.scientificName,
    broadExplanation: buildWhyFitsToday(`${selectedBird.commonName} fits today because ${selectedBird.whyToday}.`, signals, baseOutput.broadExplanation),
    imageUrl: speciesPhoto.imageUrl,
    imageAlt: speciesPhoto.imageAlt,
    guideImageUrl: speciesPhoto.guideImageUrl,
    guideImageAlt: speciesPhoto.guideImageAlt,
    quickIdTip: `Quick ID tip: ${baseOutput.fieldMarks[0]}`,
    photoSource: speciesPhoto.photoSource,
    images: buildSpeciesGallery({
      category: "bird",
      slug: selectedBird.slug,
      commonName: selectedBird.commonName,
      heroImageUrl: speciesPhoto.imageUrl,
      heroImageAlt: speciesPhoto.imageAlt
    }),
    likelyHabitat: selectedBird.habitat,
    bestNearbyPlaceType: habitatRecommendation.bestNearbyPlaceType,
    bestTimeWindow: habitatRecommendation.bestTimeWindow,
    safetyNote: `${baseOutput.safetyNote} ${habitatRecommendation.safetyNote}`.trim(),
    recommendedNearbySpots: habitatRecommendation.recommendedNearbySpots
  });

  if (!save) return { output, generation: null };

  const generation = (await saveGeneration({
    supabase,
    userId,
    studentId: input.studentId,
    toolType: "bird_of_the_day",
    title: output.birdName,
    inputJson: { ...input, audience: input.householdMode ? "household" : "student" },
    outputJson: output
  })) as GenerationRecord;

  return { output, generation };
}
