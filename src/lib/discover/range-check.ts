import { buildMushroomSafetyNote } from "@/lib/discoveries";
import type { DiscoveryLocationMeta } from "@/lib/discover/location";
import {
  categoryFallbackLookalikes,
  outOfRegionKeywords,
  southernMarylandSpecies,
  type DiscoverRangePlausibility,
  type LocalSpeciesEntry
} from "@/lib/discover/local-species";
import type { DiscoverCategory, IdentifyResponse } from "@/lib/identify";

type RangeCheckInput = {
  result: Omit<
    IdentifyResponse,
    "observed_near" | "region_label" | "regional_plausibility" | "regional_plausibility_note" | "local_look_alikes"
  >;
  selectedCategory: DiscoverCategory;
  requestDate: string;
  location: DiscoveryLocationMeta;
};

export function applyDiscoveryRangeCheck({
  result,
  selectedCategory,
  requestDate,
  location
}: RangeCheckInput): IdentifyResponse {
  const month = new Date(requestDate).getMonth() + 1;
  const matchedSpecies = findLocalSpeciesMatch(selectedCategory, result.possible_identification, result.scientific_name);
  const habitatMatch = matchedSpecies ? hasHabitatFit(matchedSpecies, location.locationLabel) : false;
  const looksOutOfRegion = outOfRegionKeywords[selectedCategory].some((keyword) =>
    normalize(result.possible_identification).includes(keyword)
  );

  let regionalPlausibility: DiscoverRangePlausibility = "unknown";
  let regionalPlausibilityNote = buildUnknownRegionalNote(location.regionLabel, selectedCategory);
  let localLookAlikes = matchedSpecies?.localLookalikes ?? categoryFallbackLookalikes[selectedCategory];
  let confidenceLevel = result.confidence_level;
  let lookAlikes = result.look_alikes;

  if (matchedSpecies) {
    const inSeason = matchedSpecies.monthsActive.includes(month);

    if (inSeason && (habitatMatch || !matchedSpecies.habitatHints?.length)) {
      regionalPlausibility = "likely_local";
      regionalPlausibilityNote = `Likely and regionally plausible for ${location.regionLabel}, especially ${buildSeasonPhrase(
        month
      )}.`;
    } else if (inSeason) {
      regionalPlausibility = "possible_but_uncommon";
      regionalPlausibilityNote = `A possible match for ${location.regionLabel}, but double-check habitat clues and nearby local look-alikes.`;
      confidenceLevel = downgradeConfidence(confidenceLevel);
    } else {
      regionalPlausibility = "possible_but_uncommon";
      regionalPlausibilityNote = `${matchedSpecies.commonName} can be a possible match, but it is less expected in ${location.regionLabel} ${buildSeasonPhrase(
        month
      )}.`;
      confidenceLevel = downgradeConfidence(confidenceLevel);
    }
  } else if (looksOutOfRegion) {
    regionalPlausibility = "low_regional_confidence";
    regionalPlausibilityNote = `Low regional confidence for ${location.regionLabel}. A similar local species is more likely than this first guess.`;
    confidenceLevel = downgradeConfidence(downgradeConfidence(confidenceLevel));
  }

  const mergedLookAlikes = [...new Set([...localLookAlikes, ...lookAlikes])].slice(0, 4);
  lookAlikes = mergedLookAlikes;

  const nextResult: IdentifyResponse = {
    ...result,
    confidence_level: confidenceLevel,
    observed_near: location.observedNear,
    region_label: location.regionLabel,
    regional_plausibility: regionalPlausibility,
    regional_plausibility_note: regionalPlausibilityNote,
    local_look_alikes: localLookAlikes.slice(0, 4),
    look_alikes: lookAlikes
  };

  if (selectedCategory === "mushroom") {
    nextResult.safety_note = buildMushroomSafetyNote(nextResult.safety_note);
  }

  return nextResult;
}

function findLocalSpeciesMatch(category: DiscoverCategory, commonName: string, scientificName: string) {
  const normalizedCommonName = normalize(commonName);
  const normalizedScientificName = normalize(scientificName);

  return southernMarylandSpecies.find((entry) => {
    if (entry.category !== category) return false;

    const aliases = entry.aliases ?? [];
    return [entry.commonName, entry.scientificName, ...aliases]
      .map((value) => normalize(value))
      .some((value) => normalizedCommonName.includes(value) || normalizedScientificName.includes(value));
  });
}

function hasHabitatFit(entry: LocalSpeciesEntry, locationLabel: string) {
  if (!entry.habitatHints?.length) return true;

  const normalizedLocation = normalize(locationLabel);
  return entry.habitatHints.some((hint) => normalizedLocation.includes(normalize(hint)));
}

function buildUnknownRegionalNote(regionLabel: string, category: DiscoverCategory) {
  switch (category) {
    case "bird":
      return `Possible match, but use local field marks and migration timing to confirm what fits ${regionLabel} best today.`;
    case "fish":
      return `Possible match, but water type and local species still matter for ${regionLabel}.`;
    case "mushroom":
      return `Possible match only. Mushroom IDs need extra caution, especially when regional confidence is unclear.`;
    default:
      return `Possible match. Compare it with common local species before treating the identification as settled.`;
  }
}

function buildSeasonPhrase(month: number) {
  if ([12, 1, 2].includes(month)) return "in winter";
  if ([3, 4, 5].includes(month)) return "in spring";
  if ([6, 7, 8].includes(month)) return "in summer";
  return "in fall";
}

function downgradeConfidence(confidence: IdentifyResponse["confidence_level"]): IdentifyResponse["confidence_level"] {
  if (confidence === "high") return "medium";
  if (confidence === "medium") return "low";
  return "low";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
