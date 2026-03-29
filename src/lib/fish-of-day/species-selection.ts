import type { WaterType } from "@/lib/fish-of-day/water-type";
import { FISH_SPECIES } from "@/lib/fish-species";
import { filterSpeciesForMonth, getMonthFromDate } from "@/lib/seasonal-species";

type FishSelectionInput = {
  waterType: WaterType;
  requestDate: string;
  supportLevel: "good" | "fair" | "poor";
  windExposure?: "low" | "medium" | "high";
  temperature?: number | null;
  precipitationChance?: number | null;
};

export type FishSelection = {
  fishName: string;
  likelyRelatedSpecies: string[];
  likelyHabitat: string;
  habitatCues: string[];
  bestUseOfOuting: string;
  whyThisWaterFits: string;
  scoutingAdvice: string;
};

type FishProfile = FishSelection & {
  cautiousOuting: string;
};

export function selectFishForWaterType({ waterType, requestDate, supportLevel, windExposure, temperature, precipitationChance }: FishSelectionInput): FishSelection {
  const month = getMonthFromDate(requestDate);
  const seasonalPool = filterSpeciesForMonth(
    FISH_SPECIES.filter((species) => species.water.includes(mapWaterType(waterType))),
    month
  );
  const fishName = chooseSpeciesName(
    waterType,
    month,
    supportLevel,
    seasonalPool.map((species) => species.commonName),
    windExposure,
    temperature,
    precipitationChance
  );
  const profile = fishProfiles[fishName] ?? fishProfiles["Largemouth Bass"];

  return {
    fishName,
    likelyRelatedSpecies: profile.likelyRelatedSpecies,
    likelyHabitat: profile.likelyHabitat,
    habitatCues: profile.habitatCues,
    bestUseOfOuting: supportLevel === "poor" ? profile.cautiousOuting : profile.bestUseOfOuting,
    whyThisWaterFits: profile.whyThisWaterFits,
    scoutingAdvice: profile.scoutingAdvice
  };
}

function mapWaterType(waterType: WaterType) {
  if (waterType === "shoreline") return "tidal" as const;
  if (waterType === "creek") return "river" as const;
  return waterType;
}

function chooseSpeciesName(
  waterType: WaterType,
  month: number,
  supportLevel: "good" | "fair" | "poor",
  seasonalNames: string[],
  windExposure?: "low" | "medium" | "high",
  temperature?: number | null,
  precipitationChance?: number | null
) {
  const names = new Set(seasonalNames);
  const coolWindow = typeof temperature === "number" && temperature <= 55;
  const warmWindow = typeof temperature === "number" && temperature >= 68;
  const wetWindow = (precipitationChance ?? 0) >= 45;

  if (waterType === "pond") {
    if (supportLevel === "poor" && names.has("Bluegill")) return "Bluegill";
    if (warmWindow && names.has("Largemouth Bass")) return "Largemouth Bass";
    if (month >= 4 && month <= 5 && names.has("Black Crappie")) return "Black Crappie";
    if (month >= 6 && month <= 9 && names.has("Largemouth Bass")) return "Largemouth Bass";
    if (names.has("Pumpkinseed Sunfish")) return "Pumpkinseed Sunfish";
  }

  if (waterType === "lake") {
    if (month >= 3 && month <= 5 && names.has("Black Crappie")) return "Black Crappie";
    if ((coolWindow || month <= 3 || month >= 10) && names.has("Yellow Perch")) return "Yellow Perch";
    if (month >= 6 && month <= 9 && names.has("Largemouth Bass")) return "Largemouth Bass";
    if (names.has("Bluegill")) return "Bluegill";
  }

  if (waterType === "creek") {
    if ((wetWindow || month <= 4) && names.has("Chain Pickerel")) return "Chain Pickerel";
    if (month >= 5 && month <= 9 && names.has("Redbreast Sunfish")) return "Redbreast Sunfish";
    if (names.has("White Perch")) return "White Perch";
  }

  if (waterType === "river") {
    if (month >= 3 && month <= 5 && names.has("White Perch")) return "White Perch";
    if (windExposure === "high" && names.has("Channel Catfish")) return "Channel Catfish";
    if (month >= 6 && month <= 10 && names.has("Channel Catfish")) return "Channel Catfish";
    if (month >= 6 && month <= 9 && names.has("Blue Catfish")) return "Blue Catfish";
    if (names.has("Yellow Perch")) return "Yellow Perch";
  }

  if (waterType === "shoreline") {
    if (month >= 3 && month <= 5 && names.has("White Perch")) return "White Perch";
    if (month >= 6 && month <= 9 && names.has("Spot")) return "Spot";
    if (windExposure === "high" && names.has("White Perch")) return "White Perch";
    if (month >= 6 && month <= 9 && names.has("Atlantic Croaker")) return "Atlantic Croaker";
    if (names.has("Striped Bass")) return "Striped Bass";
  }

  return seasonalNames[0] ?? "Largemouth Bass";
}

const fishProfiles: Record<string, FishProfile> = {
  "Largemouth Bass": {
    fishName: "Largemouth Bass",
    likelyRelatedSpecies: ["Bluegill", "Black Crappie", "Chain Pickerel"],
    likelyHabitat: "calm pond or lake edges with weed lines, fallen timber, shade, and nearby depth",
    habitatCues: ["weed edges", "fallen branches", "shaded banks", "dock or brush cover"],
    bestUseOfOuting: "family bank fishing around cover and low-light edges",
    cautiousOuting: "short scouting and a few simple casts near cover",
    whyThisWaterFits: "Warmer freshwater and easy-to-read edge cover make bass a believable family target in ponds and lakes this time of year.",
    scoutingAdvice: "Look for calm water near weeds, submerged logs, or shaded shoreline pockets before making the first cast."
  },
  "Bluegill": {
    fishName: "Bluegill",
    likelyRelatedSpecies: ["Pumpkinseed Sunfish", "Largemouth Bass", "Black Crappie"],
    likelyHabitat: "warm shallows, calm banks, docks, and simple shoreline cover",
    habitatCues: ["calm shallows", "dock posts", "weeds or grass edges", "sun-warmed banks"],
    bestUseOfOuting: "easy bobber fishing for younger anglers",
    cautiousOuting: "simple scouting and bobber fishing in calm water",
    whyThisWaterFits: "Bluegill stay family-friendly because they often use calmer shallow edges that are easier to reach and easier to understand.",
    scoutingAdvice: "Start where calm water meets grass, weeds, or dock shade and watch for tiny surface movement."
  },
  "Black Crappie": {
    fishName: "Black Crappie",
    likelyRelatedSpecies: ["Bluegill", "Largemouth Bass", "Yellow Perch"],
    likelyHabitat: "spring shallows, brush piles, docks, and drop-offs close to calm coves",
    habitatCues: ["brush piles", "dock shade", "drop-offs", "protected coves"],
    bestUseOfOuting: "spring structure fishing from an easy shoreline spot",
    cautiousOuting: "shoreline scouting around brush and docks",
    whyThisWaterFits: "Crappie become more believable during shoulder-season movements around brush, dock shade, and nearby depth.",
    scoutingAdvice: "Check protected coves, brushy shoreline, and dock corners where fish can slide between shallows and deeper water."
  },
  "Yellow Perch": {
    fishName: "Yellow Perch",
    likelyRelatedSpecies: ["White Perch", "Black Crappie", "Bluegill"],
    likelyHabitat: "cooler lake or river water with edges, points, and modest depth nearby",
    habitatCues: ["cooler shaded water", "drop-offs", "points", "deeper edge lines"],
    bestUseOfOuting: "cool-season scouting with simple bait presentations",
    cautiousOuting: "family scouting around deeper edges and quiet access",
    whyThisWaterFits: "Perch make more sense when cooler water keeps the day from feeling like a fast warm-water bite.",
    scoutingAdvice: "Look for slightly deeper edges, shaded water, or points that give fish a quick path between shallow and deeper zones."
  },
  "Chain Pickerel": {
    fishName: "Chain Pickerel",
    likelyRelatedSpecies: ["Largemouth Bass", "Bluegill", "Yellow Perch"],
    likelyHabitat: "cooler weedy water, quiet coves, and ambush cover near the bank",
    habitatCues: ["weed pockets", "quiet coves", "ambush cover", "edges of darker water"],
    bestUseOfOuting: "cool-season scouting and careful shoreline casts",
    cautiousOuting: "quiet observation of weedy ambush habitat",
    whyThisWaterFits: "Pickerel are a better cool-season fit when warmer-water species feel less active and weedy ambush cover is still available.",
    scoutingAdvice: "Move slowly and check the edges of weeds, darker water, and quiet pockets where an ambush fish can hide."
  },
  "Redbreast Sunfish": {
    fishName: "Redbreast Sunfish",
    likelyRelatedSpecies: ["Bluegill", "White Perch", "Largemouth Bass"],
    likelyHabitat: "small pools, root cover, gentle current seams, and creek bends",
    habitatCues: ["root cover", "small pools", "gentle current seams", "deeper creek bends"],
    bestUseOfOuting: "light-line creek fishing with a simple family setup",
    cautiousOuting: "creek scouting and habitat observation",
    whyThisWaterFits: "Smaller warm-season creek fish make more sense where current is gentle and access stays family-friendly.",
    scoutingAdvice: "Walk slowly and watch for root cover, deeper bends, and small pools instead of fishing the fastest water first."
  },
  "White Perch": {
    fishName: "White Perch",
    likelyRelatedSpecies: ["Yellow Perch", "Striped Bass", "Atlantic Croaker"],
    likelyHabitat: "tidal rivers, creek mouths, docks, and moderate current edges",
    habitatCues: ["creek mouths", "dock edges", "moderate current seams", "bait movement"],
    bestUseOfOuting: "spring or shoulder-season shoreline fishing with simple bait rigs",
    cautiousOuting: "shoreline scouting around tidal access and bait movement",
    whyThisWaterFits: "White perch are especially believable when spring or shoulder-season river and tidal movement brings fish close to accessible shoreline.",
    scoutingAdvice: "Watch creek mouths, piers, and moderate tidal edges where bait and current meet before choosing your first family spot."
  },
  "Channel Catfish": {
    fishName: "Channel Catfish",
    likelyRelatedSpecies: ["Blue Catfish", "White Perch", "Largemouth Bass"],
    likelyHabitat: "river bends, deeper holes, calmer banks, and current breaks",
    habitatCues: ["deeper holes", "current seams", "calmer banks", "bridge or log structure"],
    bestUseOfOuting: "evening bank fishing with simple bait around current breaks",
    cautiousOuting: "protected-bank scouting near deeper holding water",
    whyThisWaterFits: "Warmer river periods make catfish a practical family target where deeper water and current breaks are easy to identify from shore.",
    scoutingAdvice: "Look for deeper water beside calmer banks, bridge shade, or current seams where fish can rest and wait for food."
  },
  "Blue Catfish": {
    fishName: "Blue Catfish",
    likelyRelatedSpecies: ["Channel Catfish", "White Perch", "Striped Bass"],
    likelyHabitat: "larger river channels, deeper tidal edges, and current-influenced structure",
    habitatCues: ["deep channel edges", "current seams", "bridge structure", "deeper tidal pockets"],
    bestUseOfOuting: "serious scouting or patient bait fishing near bigger water structure",
    cautiousOuting: "scouting for deeper accessible water and safe footing",
    whyThisWaterFits: "Bigger catfish become more believable in larger river and tidal systems when warm conditions and current structure line up.",
    scoutingAdvice: "Focus on safe access near deeper channel edges or current seams instead of trying long exposed shoreline stretches."
  },
  "Spot": {
    fishName: "Spot",
    likelyRelatedSpecies: ["Atlantic Croaker", "White Perch", "Striped Bass"],
    likelyHabitat: "warm tidal shoreline, piers, creek mouths, and moving bait water",
    habitatCues: ["piers or docks", "tidal edges", "bait movement", "protected shoreline access"],
    bestUseOfOuting: "easy summer shoreline fishing with family bait rigs",
    cautiousOuting: "short shoreline scouting around protected tidal access",
    whyThisWaterFits: "Warm tidal months make spot one of the more believable easy family fish around simple shoreline access.",
    scoutingAdvice: "Watch for bait movement near piers, creek mouths, and sheltered tidal edges before setting up."
  },
  "Atlantic Croaker": {
    fishName: "Atlantic Croaker",
    likelyRelatedSpecies: ["Spot", "White Perch", "Striped Bass"],
    likelyHabitat: "warmer tidal water, sandy bottoms, and family-friendly shoreline access",
    habitatCues: ["sandy bottoms", "tidal movement", "piers", "protected shore access"],
    bestUseOfOuting: "simple summer bait fishing from easy shoreline access",
    cautiousOuting: "scouting for bait movement and stable tidal access",
    whyThisWaterFits: "Warm-season tidal water and simple bait presentations make croaker a believable family-friendly shoreline fish.",
    scoutingAdvice: "Pick stable shoreline or pier access where gentle tidal movement and bait activity make a straightforward family setup possible."
  },
  "Striped Bass": {
    fishName: "Striped Bass",
    likelyRelatedSpecies: ["White Perch", "Atlantic Croaker", "Spot"],
    likelyHabitat: "tidal current edges, creek mouths, shoreline points, and moving bait water",
    habitatCues: ["current edges", "shoreline points", "bait movement", "tidal seams"],
    bestUseOfOuting: "migration-season shoreline scouting with a few focused casts",
    cautiousOuting: "scouting tidal access and watching water movement",
    whyThisWaterFits: "Striped bass fit best when tidal movement and seasonal migration windows make shoreline or river access more promising.",
    scoutingAdvice: "Treat this as a water-reading mission first and look for moving bait, current seams, and points before expecting action."
  }
};
