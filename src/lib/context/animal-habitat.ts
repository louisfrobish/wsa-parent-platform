import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnvironmentalContext } from "@/lib/context/engine";
import { findRecommendedSpots, resolveLocationContext, type LocationContextInput, type RecommendedSpot } from "@/lib/context/nearby-spots";

export type AnimalHabitatRecommendation = {
  likelyHabitatType: string;
  bestNearbyPlaceType: string;
  whyThisPlaceFits: string;
  bestTimeWindow: string;
  whatToBring: string[];
  recommendedNearbySpots: RecommendedSpot[];
  safetyNote: string;
};

export async function getAnimalHabitatRecommendation(
  supabase: SupabaseClient,
  input: LocationContextInput & {
    animalName: string;
    habitatText: string;
    weatherCondition?: string | null;
    requestDate?: string | null;
  }
): Promise<AnimalHabitatRecommendation> {
  const profile = inferAnimalProfile(input.animalName, input.habitatText);
  const location = resolveLocationContext(input);
  const environmental = await getEnvironmentalContext(supabase, {
    requestDate: input.requestDate ?? new Date().toISOString().slice(0, 10),
    locationLabel: input.locationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMiles: input.radiusMiles,
    weatherCondition: input.weatherCondition
  });
  const spots = await findRecommendedSpots({
    supabase,
    location,
    activityTag: profile.activityTag,
    habitatTags: profile.habitatTags,
    requireBirding: profile.requireBirding,
    limit: 4
  });
  const leadSpot = spots[0];
  const weatherLine = environmental.weather?.shortForecast ?? environmental.fallbackWeatherSummary.summary;
  const birdLine = profile.requireBirding ? environmental.bird.migrationSummary : "";

  return {
    likelyHabitatType: profile.habitatLabel,
    bestNearbyPlaceType: profile.placeType,
    whyThisPlaceFits: [
      leadSpot ? `${leadSpot.name} is a strong first place to check because ${leadSpot.reason.toLowerCase()}` : profile.reason,
      birdLine || weatherLine
    ]
      .filter(Boolean)
      .join(" "),
    bestTimeWindow: profile.requireBirding
      ? `${profile.bestTimeWindow}. ${environmental.bird.birdingRelevance}`
      : profile.bestTimeWindow,
    whatToBring: profile.whatToBring,
    recommendedNearbySpots: spots,
    safetyNote: `${profile.safetyNote} ${environmental.weather?.hazards?.length ? `Weather alerts: ${environmental.weather.hazards.join("; ")}.` : ""}`.trim()
  };
}

function inferAnimalProfile(animalName: string, habitatText: string) {
  const text = `${animalName} ${habitatText}`.toLowerCase();

  if (/(osprey|heron|egret|duck|goose|kingfisher|shorebird)/.test(text)) {
    return {
      habitatLabel: "shoreline, pond edge, or marsh habitat",
      placeType: "shoreline, marsh edge, or pond access",
      reason: "Water-loving birds are more likely around open shoreline, marsh edges, and places with fish or shallow feeding areas.",
      bestTimeWindow: "early morning or the last two hours before sunset",
      whatToBring: ["Binoculars", "Field notebook", "Water bottle", "Quiet shoes"],
      habitatTags: ["shoreline", "marsh", "river", "pond"],
      activityTag: "birding",
      requireBirding: true,
      safetyNote: "Watch footing near water and observe birds from a respectful distance instead of crowding nesting or feeding spots."
    };
  }

  if (/(frog|toad|salamander|tadpole|amphibian)/.test(text)) {
    return {
      habitatLabel: "pond, creek edge, or wetland habitat",
      placeType: "pond edge, wetland boardwalk, or quiet creek bend",
      reason: "Amphibians are most likely where damp edges, shallow water, and protected cover meet.",
      bestTimeWindow: "after rain or during mild late-afternoon light",
      whatToBring: ["Mud-friendly shoes", "Magnifying glass", "Notebook", "Water bottle"],
      habitatTags: ["pond", "wetland", "creek", "marsh"],
      activityTag: "amphibians",
      requireBirding: false,
      safetyNote: "Look carefully without handling wildlife, and choose stable ground near muddy or wet edges."
    };
  }

  if (/(butterfly|bee|moth|dragonfly|insect|pollinator)/.test(text)) {
    return {
      habitatLabel: "sunny meadow, garden edge, or wildflower habitat",
      placeType: "meadow, park, or garden-style trail edge",
      reason: "Pollinators are easier to find where flowers, sun, and sheltered edges come together.",
      bestTimeWindow: "mid-morning through early afternoon on a calm day",
      whatToBring: ["Notebook", "Colored pencils", "Water bottle", "Magnifying glass"],
      habitatTags: ["meadow", "park"],
      activityTag: "birding",
      requireBirding: false,
      safetyNote: "Move slowly around pollinators and avoid grabbing at insects or flowers."
    };
  }

  if (/(squirrel|fox|deer|owl|hawk|woodpecker|songbird|bird)/.test(text)) {
    return {
      habitatLabel: "wooded edge, park, or mature trail habitat",
      placeType: "wooded trail, park edge, or oak-heavy nature stop",
      reason: "Tree cover, edges, and quiet trails give families a better chance of seeing feeding, movement, and habitat use.",
      bestTimeWindow: "morning or late afternoon",
      whatToBring: ["Binoculars", "Field notebook", "Water bottle", "Closed-toe shoes"],
      habitatTags: ["woods", "trail", "park"],
      activityTag: "birding",
      requireBirding: /(owl|hawk|woodpecker|songbird|bird)/.test(text),
      safetyNote: "Stay on known paths and observe quietly so the animal keeps behaving naturally."
    };
  }

  return {
    habitatLabel: "mixed outdoor habitat",
    placeType: "park, trail edge, or nearby natural area",
    reason: "A mix of woods, edges, and open family-friendly habitat gives the best chance for a useful observation.",
    bestTimeWindow: "morning or a calm late-afternoon window",
    whatToBring: ["Field notebook", "Water bottle", "Closed-toe shoes"],
    habitatTags: ["park", "woods", "trail"],
    activityTag: "general_nature",
    requireBirding: false,
    safetyNote: "Choose a family-friendly access point and let the animal keep its distance."
  };
}
