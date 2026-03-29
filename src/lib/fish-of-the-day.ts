import type { SupabaseClient } from "@supabase/supabase-js";
import { getFishingRecommendation } from "@/lib/context/fishing";
import { getBaitAndTackleAdvice } from "@/lib/fish-of-day/bait-tackle";
import { selectFishForWaterType } from "@/lib/fish-of-day/species-selection";
import { getFishImageSet } from "@/lib/fish-images";
import { findFishSpeciesByName } from "@/lib/fish-species";
import { createOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { getMarylandFishRegulation } from "@/lib/regulations/maryland-fish";
import { getFishDataByName } from "@/lib/species/fish-data";
import { fishOutputJsonSchema, fishOutputSchema, type FishOutput, type GenerationRecord } from "@/lib/generations";
import { saveGeneration } from "@/lib/generation-store";
import { buildSpeciesGallery, resolveSpeciesPhoto } from "@/lib/species-photo";

const requiredFishStringKeys = [
  "fishName",
  "speciesSlug",
  "waterType",
  "broadExplanation",
  "likelyHabitat",
  "bestNearbyPlaceType",
  "bestTimeWindow",
  "fishingOutlook",
  "bestUseOfOuting",
  "bestBeginnerBait",
  "optionalLure",
  "basicTackleSuggestion",
  "whyThisFitsToday",
  "safetyAccessNote",
  "quickChallenge",
  "flavorProfile",
  "preparationTips",
  "bestSeason",
  "wsaAnglerTip",
  "seasonNote",
  "bagLimitNote",
  "sizeLimitNote",
  "protectedNote",
  "gearRuleNote",
  "regulationSource",
  "regulationSourceUrl",
  "regulationLastChecked",
  "facebookCaption",
  "imageUrl",
  "imageAlt"
] as const;

type FishBriefingInput = {
  requestDate: string;
  studentId?: string;
  studentName?: string;
  childAge?: number;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
  radiusMiles: number;
  weatherCondition: string;
  householdMode?: boolean;
};

type GenerateFishBriefingInput = {
  supabase: SupabaseClient;
  userId: string;
  input: FishBriefingInput;
  save?: boolean;
};

export async function generateFishBriefing({
  supabase,
  userId,
  input,
  save = true
}: GenerateFishBriefingInput): Promise<{ output: FishOutput; generation: GenerationRecord | null }> {
  const fishingRecommendation = await getFishingRecommendation(supabase, input);
  const fishSelection = selectFishForWaterType({
    waterType: fishingRecommendation.waterType,
    requestDate: input.requestDate,
    supportLevel: fishingRecommendation.supportLevel,
    windExposure: fishingRecommendation.windExposure,
    temperature: fishingRecommendation.temperature,
    precipitationChance: fishingRecommendation.precipitationChance
  });
  const baitAdvice = getBaitAndTackleAdvice(fishingRecommendation.waterType);
  const fishData = getFishDataByName(fishSelection.fishName);
  const fishSpecies = findFishSpeciesByName(fishSelection.fishName);
  const regulation = getMarylandFishRegulation({
    fishName: fishSelection.fishName,
    requestDate: input.requestDate,
    waterType: fishingRecommendation.waterType,
    locationLabel: input.locationLabel
  });
  const safeString = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
  const safeStringArray = (value: unknown, fallback: string[]) => {
    if (!Array.isArray(value)) {
      return fallback;
    }

    const cleaned = value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry) => entry.length > 0);

    return cleaned.length > 0 ? cleaned : fallback;
  };

  const prompt = [
    "You are creating a Fish of the Day card for Wild Stallion Academy families.",
    input.householdMode
      ? "This is a household-level briefing for the whole family, so keep the explanation broad, practical, and parent-friendly."
      : "If a student age is provided, keep the tone age-aware without becoming childish.",
    "Write in a warm field-guide voice that feels practical, educational, and outdoorsy.",
    "Use the provided fish, water type, bait, and tackle guidance as the real foundation instead of inventing a different fishing plan.",
    "Also create one short Facebook-ready caption for Wild Stallion Academy that sounds warm, adventurous, educational, and family-friendly.",
    `Date: ${input.requestDate}`,
    `Location focus: ${input.locationLabel}`,
    `Weather: ${input.weatherCondition}`,
    `Water type today: ${fishingRecommendation.waterTypeLabel}`,
    `Fish to feature: ${fishSelection.fishName}`,
    `Likely habitat: ${fishSelection.likelyHabitat}`,
    `Why this water fits: ${fishSelection.whyThisWaterFits}`,
    `Best use of outing: ${fishSelection.bestUseOfOuting}`,
    `Fishing outlook context: ${fishingRecommendation.fishingOutlook}`,
    `Likely related species nearby: ${fishSelection.likelyRelatedSpecies.join(", ")}`,
    `Best time window: ${fishingRecommendation.bestTimeWindow}`,
    `Best beginner bait: ${baitAdvice.bestBeginnerBait}`,
    `Optional lure: ${baitAdvice.optionalLure}`,
    `Basic tackle suggestion: ${baitAdvice.basicTackleSuggestion}`,
    `Why the bait and tackle fit: ${baitAdvice.whyItFitsToday}`,
    `Flavor profile: ${fishData?.flavorProfile ?? "Mild and family-friendly when fresh."}`,
    `Best cooking methods: ${fishData?.bestCookingMethods.join(", ") ?? "pan-fry, bake"}`,
    `Preparation tip: ${fishData?.preparationTips ?? "Keep the fish cool and cook simply."}`,
    `Best season: ${fishData?.bestSeason ?? "The current active fishing window."}`,
    `WSA angler tip: ${fishData?.wsaAnglerTip ?? fishSelection.scoutingAdvice}`,
    `Regulation status: ${regulation.regulation_status}`,
    `Regulation season note: ${regulation.season_note ?? "Verify current Maryland DNR rules."}`,
    `Bag note: ${regulation.bag_limit_note ?? "Verify current bag or creel rules."}`,
    `Size note: ${regulation.size_limit_note ?? "Verify current size or slot rules."}`,
    `Protected note: ${regulation.protected_note ?? "None noted in this summary."}`,
    `Gear note: ${regulation.gear_rule_note ?? "No extra gear note in this summary."}`,
    `Nearby spots: ${fishingRecommendation.recommendedNearbySpots.map((spot) => `${spot.name} (${spot.spotType})`).join(", ") || "family-friendly shoreline access"}`,
    "Return a concise Fish of the Day with a clear species choice, habitat, time window, outlook, best use of outing, beginner bait, optional lure, tackle suggestion, why it fits today, flavor profile, cooking guidance, preparation tip, best season, WSA angler tip, regulation status, safety/access note, challenge, and facebook caption."
  ].join("\n");

  const openai = createOpenAIClient();
  const response = await openai.responses.create({
    model: getOpenAIModel(),
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "fish_of_the_day",
        schema: fishOutputJsonSchema
      }
    }
  });

  const rawBaseOutput = JSON.parse(response.output_text) as Partial<FishOutput>;
  const imageSet = getFishImageSet(fishSelection.fishName);
  const speciesPhoto = await resolveSpeciesPhoto({
    commonName: safeString(fishSelection.fishName, "Unknown fish"),
    scientificName: fishSpecies?.scientificName,
    fallbackImageUrl: safeString(imageSet.heroUrl, safeString(imageSet.fallbackIllustrationUrl, "/field-guide/big-fish.png")),
    fallbackImageAlt: `${safeString(fishSelection.fishName, "Unknown fish")} field-guide image`,
    guideImageUrl: safeString(imageSet.guideUrl, safeString(imageSet.fallbackIllustrationUrl, "/field-guide/big-fish.png")),
    guideImageAlt: `${safeString(fishSelection.fishName, "Unknown fish")} field-guide graphic`,
    photoLabel: safeString(fishSelection.fishName, "Unknown fish")
  });
  const habitatCueLine = safeStringArray(fishSelection.habitatCues, ["calm water", "safe access", "visible structure"]).join(", ");
  const enhancedSpots = fishingRecommendation.recommendedNearbySpots.map((spot) => ({
    ...spot,
    reason: `${spot.reason} Look for ${habitatCueLine} here if the water and access match.`,
    recommendedUseToday: `${spot.recommendedUseToday} ${fishSelection.scoutingAdvice}`
  }));

  const unsafeOutput: Partial<FishOutput> = {
    ...rawBaseOutput,
    fishName: fishSelection.fishName,
    scientificName: fishSpecies?.scientificName,
    speciesSlug: imageSet.speciesSlug,
    waterType: fishingRecommendation.waterTypeLabel,
    broadExplanation: `${fishSelection.fishName} fits today because ${fishSelection.whyThisWaterFits.toLowerCase()} ${fishingRecommendation.supportLevel === "poor" ? "The weather makes this more of a scouting-minded fishing day." : fishingRecommendation.windExposure === "high" ? "The wind makes protected access and structure more important today." : "The weather still supports a practical family fishing window."} Families will do best by looking for ${habitatCueLine}. ${rawBaseOutput.broadExplanation ?? ""}`.trim(),
    likelyHabitat: `${fishSelection.likelyHabitat}. Focus on ${habitatCueLine}.`,
    fishingOutlook: `${fishingRecommendation.fishingOutlook} Habitat tip: ${fishSelection.scoutingAdvice}`.trim(),
    bestUseOfOuting: fishSelection.bestUseOfOuting,
    bestTimeWindow: fishingRecommendation.bestTimeWindow,
    likelyRelatedSpecies: fishSelection.likelyRelatedSpecies,
    bestBeginnerBait: baitAdvice.bestBeginnerBait,
    optionalLure: baitAdvice.optionalLure,
    basicTackleSuggestion: baitAdvice.basicTackleSuggestion,
    whyThisFitsToday: `${fishSelection.whyThisWaterFits} ${baitAdvice.whyItFitsToday} ${fishSelection.scoutingAdvice}`.trim(),
    safetyAccessNote: `${rawBaseOutput.safetyAccessNote ?? ""} ${fishingRecommendation.safetyNote}`.trim(),
    quickChallenge: fishSelection.scoutingAdvice,
    flavorProfile: fishData?.flavorProfile ?? rawBaseOutput.flavorProfile,
    bestCookingMethods: fishData?.bestCookingMethods ?? rawBaseOutput.bestCookingMethods,
    preparationTips: fishData?.preparationTips ?? rawBaseOutput.preparationTips,
    bestSeason: fishData?.bestSeason ?? rawBaseOutput.bestSeason,
    wsaAnglerTip: fishData?.wsaAnglerTip ?? rawBaseOutput.wsaAnglerTip,
    regulationStatus: regulation.regulation_status,
    seasonNote: regulation.season_note ?? "Verify Maryland DNR seasonal status before harvest.",
    bagLimitNote: regulation.bag_limit_note ?? "Verify Maryland DNR bag or creel rules before harvest.",
    sizeLimitNote: regulation.size_limit_note ?? "Verify Maryland DNR size or slot rules before harvest.",
    protectedNote: regulation.protected_note ?? "",
    gearRuleNote: regulation.gear_rule_note ?? "",
    regulationSource: regulation.regulation_source,
    regulationSourceUrl: regulation.regulation_source_url,
    regulationLastChecked: regulation.regulation_last_checked,
    imageUrl: speciesPhoto.imageUrl,
    imageAlt: speciesPhoto.imageAlt,
    guideImageUrl: speciesPhoto.guideImageUrl,
    guideImageAlt: speciesPhoto.guideImageAlt,
    quickIdTip: `Quick ID tip: Look for ${habitatCueLine}.`,
    photoSource: speciesPhoto.photoSource,
    images: buildSpeciesGallery({
      category: "fish",
      slug: safeString(imageSet.speciesSlug, "unknown-fish"),
      commonName: safeString(fishSelection.fishName, "Unknown fish"),
      heroImageUrl: safeString(speciesPhoto.imageUrl, safeString(imageSet.fallbackIllustrationUrl, "/field-guide/big-fish.png")),
      heroImageAlt: safeString(speciesPhoto.imageAlt, "Unknown fish species photograph"),
      extraImages: imageSet.gallery.map((image) => ({
        label: image.key === "jump" ? "surface action" : image.key === "caught" ? "size view" : "underwater",
        url: image.url,
        alt: image.alt
      }))
    }),
    recommendedNearbySpots: enhancedSpots
  };

  if (process.env.NODE_ENV !== "production") {
    const blankRequiredFields = requiredFishStringKeys.filter((key) => {
      const value = unsafeOutput[key];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (blankRequiredFields.length > 0) {
      console.log("[fish-of-the-day] Blank required fields before parse:", blankRequiredFields);
    }
  }

  const output = fishOutputSchema.parse({
    ...unsafeOutput,
    fishName: safeString(unsafeOutput.fishName, "Unknown fish"),
    scientificName: safeString(unsafeOutput.scientificName, "Scientific name unavailable"),
    speciesSlug: safeString(unsafeOutput.speciesSlug, "unknown-fish"),
    waterType: safeString(unsafeOutput.waterType, "Unknown water type"),
    broadExplanation: safeString(
      unsafeOutput.broadExplanation,
      "This fish fits today as a simple family scouting target based on the local water and conditions."
    ),
    likelyHabitat: safeString(unsafeOutput.likelyHabitat, "Look for safe access near cover, structure, or water movement."),
    bestNearbyPlaceType: safeString(rawBaseOutput.bestNearbyPlaceType, fishingRecommendation.recommendedNearbySpots[0]?.spotType ?? "family-friendly shoreline"),
    bestTimeWindow: safeString(unsafeOutput.bestTimeWindow, "The best window is uncertain today, so plan around the safest family outing time."),
    fishingOutlook: safeString(unsafeOutput.fishingOutlook, "Conditions suggest a simple scouting-first fishing plan today."),
    bestUseOfOuting: safeString(unsafeOutput.bestUseOfOuting, "Scout access, read the water, and make a few simple casts."),
    likelyRelatedSpecies: safeStringArray(unsafeOutput.likelyRelatedSpecies, ["Bluegill"]),
    bestBeginnerBait: safeString(unsafeOutput.bestBeginnerBait, "Worm under a bobber"),
    optionalLure: safeString(unsafeOutput.optionalLure, "Small inline spinner"),
    basicTackleSuggestion: safeString(unsafeOutput.basicTackleSuggestion, "Light spinning setup with simple family-friendly tackle"),
    whyThisFitsToday: safeString(unsafeOutput.whyThisFitsToday, "This fish is a practical local fit for today’s water, weather, and family pace."),
    safetyAccessNote: safeString(unsafeOutput.safetyAccessNote, "Use safe footing, give everyone room near the bank, and watch changing conditions."),
    quickChallenge: safeString(unsafeOutput.quickChallenge, "Find one piece of fish-holding cover before you cast."),
    flavorProfile: safeString(unsafeOutput.flavorProfile, "Flavor profile unavailable"),
    bestCookingMethods: safeStringArray(unsafeOutput.bestCookingMethods, ["Check regulations before keeping fish"]),
    preparationTips: safeString(unsafeOutput.preparationTips, "Preparation guidance unavailable"),
    bestSeason: safeString(unsafeOutput.bestSeason, "Current seasonal guidance unavailable"),
    wsaAnglerTip: safeString(unsafeOutput.wsaAnglerTip, "Start by reading the water and choosing the safest family access point."),
    seasonNote: safeString(unsafeOutput.seasonNote, "Verify Maryland DNR seasonal status before harvest."),
    bagLimitNote: safeString(unsafeOutput.bagLimitNote, "Verify Maryland DNR bag or creel rules before harvest."),
    sizeLimitNote: safeString(unsafeOutput.sizeLimitNote, "Verify Maryland DNR size or slot rules before harvest."),
    protectedNote: safeString(unsafeOutput.protectedNote, "No protected-status note is available in this summary."),
    gearRuleNote: safeString(unsafeOutput.gearRuleNote, "No extra gear restriction note is available in this summary."),
    regulationSource: safeString(unsafeOutput.regulationSource, "Verify current Maryland DNR rules"),
    regulationSourceUrl: safeString(unsafeOutput.regulationSourceUrl, "https://dnr.maryland.gov/fisheries/pages/index.aspx"),
    regulationLastChecked: safeString(unsafeOutput.regulationLastChecked, new Date().toISOString().slice(0, 10)),
    facebookCaption: safeString(unsafeOutput.facebookCaption, "Today’s Fish of the Day is ready for a simple family field look."),
    imageUrl: safeString(unsafeOutput.imageUrl, safeString(imageSet.fallbackIllustrationUrl, "/field-guide/big-fish.png")),
    imageAlt: safeString(unsafeOutput.imageAlt, "Unknown fish field-guide image"),
    guideImageUrl: safeString(unsafeOutput.guideImageUrl, safeString(imageSet.fallbackIllustrationUrl, "/field-guide/big-fish.png")),
    guideImageAlt: safeString(unsafeOutput.guideImageAlt, "Unknown fish field-guide graphic"),
    quickIdTip: safeString(unsafeOutput.quickIdTip, "Look for safe access, visible cover, and signs of fish-holding structure."),
    photoSource: safeString(unsafeOutput.photoSource, "Local field-guide media")
  });

  if (!save) {
    return { output, generation: null };
  }

  const generation = (await saveGeneration({
    supabase,
    userId,
    studentId: input.studentId,
    toolType: "fish_of_the_day",
    title: output.fishName,
    inputJson: {
      ...input,
      audience: input.householdMode ? "household" : "student"
    },
    outputJson: output
  })) as GenerationRecord;

  return { output, generation };
}
