import { getMonthFromDate, pickSeasonalSpecies, type SeasonalSpecies } from "@/lib/seasonal-species";

export type AnimalSpecies = SeasonalSpecies & {
  habitat: string;
  imageUrl: string;
  imageAlt: string;
  whyToday: string;
  weatherTags?: import("@/lib/weather-aware-species").DailyWeatherTag[];
};

export const ANIMAL_SPECIES: AnimalSpecies[] = [
  {
    slug: "spring-peeper",
    commonName: "Spring Peeper",
    scientificName: "Pseudacris crucifer",
    monthsActive: [3, 4, 5],
    seasons: ["spring"],
    habitat: "pond edge, wetland, and damp woodland habitat",
    imageUrl: "/field-guide/frogs.png",
    imageAlt: "Spring peeper field-guide illustration",
    regionalNotes: "A classic Southern Maryland early-spring amphibian voice.",
    whyToday: "cool wet spring evenings make calling frogs one of the easiest seasonal signs to notice",
    weatherTags: ["rain", "damp", "wetland"]
  },
  {
    slug: "eastern-gray-squirrel",
    commonName: "Eastern Gray Squirrel",
    scientificName: "Sciurus carolinensis",
    monthsActive: [1, 2, 3, 4, 5, 9, 10, 11, 12],
    seasons: ["spring", "fall", "winter"],
    habitat: "yard trees, wooded park edges, and mast-rich trails",
    imageUrl: "/field-guide/mammals.png",
    imageAlt: "Eastern gray squirrel field-guide illustration",
    regionalNotes: "Common and highly visible around homes, parks, and schoolyard edges.",
    whyToday: "active tree-edge foraging makes squirrels a reliable family observation animal in this season",
    weatherTags: ["cool", "woods", "scouting"]
  },
  {
    slug: "eastern-box-turtle",
    commonName: "Eastern Box Turtle",
    scientificName: "Terrapene carolina carolina",
    monthsActive: [4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    habitat: "wooded edges, damp leaf litter, and slow park trails",
    imageUrl: "/field-guide/turtles.png",
    imageAlt: "Eastern box turtle field-guide illustration",
    regionalNotes: "Most believable on warm, humid days near cover.",
    whyToday: "warmer ground and damp woodland edges make turtles more likely to be moving",
    weatherTags: ["warm", "sun"]
  },
  {
    slug: "green-darner",
    commonName: "Green Darner",
    scientificName: "Anax junius",
    monthsActive: [5, 6, 7, 8, 9, 10],
    seasons: ["summer", "fall"],
    habitat: "pond edges, wet meadows, and still water with flying insects",
    imageUrl: "/field-guide/dragonflies.png",
    imageAlt: "Green darner field-guide illustration",
    regionalNotes: "A strong warm-season insect ambassador near ponds and marshes.",
    whyToday: "warm air over ponds and wet edges gives dragonflies better hunting and flight conditions",
    weatherTags: ["warm", "sun", "wetland"]
  },
  {
    slug: "white-tailed-deer",
    commonName: "White-tailed Deer",
    scientificName: "Odocoileus virginianus",
    monthsActive: [1, 2, 3, 4, 5, 10, 11, 12],
    seasons: ["spring", "fall", "winter"],
    habitat: "field edges, wooded openings, and quiet trail corridors",
    imageUrl: "/field-guide/mammals.png",
    imageAlt: "White-tailed deer field-guide illustration",
    regionalNotes: "Best for low-light family observation at edges rather than deep woods.",
    whyToday: "edge habitat and low-light movement patterns make deer a believable family watch animal right now",
    weatherTags: ["low-light", "woods", "scouting"]
  }
];

export function pickAnimalOfTheDay(requestDate?: string) {
  return pickSeasonalSpecies(ANIMAL_SPECIES, requestDate, "animal");
}

export function findAnimalSpeciesByName(name: string) {
  const normalized = normalize(name);
  return ANIMAL_SPECIES.find((species) => normalize(species.commonName) === normalized) ?? null;
}

export function describeAnimalSeasonality(species: AnimalSpecies, requestDate?: string) {
  const month = getMonthFromDate(requestDate);
  return `${species.commonName} fits today because ${species.whyToday} in month ${month}.`;
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
