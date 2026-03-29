import { pickSeasonalSpecies, type SeasonalSpecies } from "@/lib/seasonal-species";

export type BirdSpecies = SeasonalSpecies & {
  habitat: string;
  likelyPlaceType: string;
  imageUrl: string;
  imageAlt: string;
  whyToday: string;
  weatherTags?: import("@/lib/weather-aware-species").DailyWeatherTag[];
};

export const BIRD_SPECIES: BirdSpecies[] = [
  {
    slug: "osprey",
    commonName: "Osprey",
    scientificName: "Pandion haliaetus",
    monthsActive: [3, 4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    habitat: "shoreline, marsh edge, river, and open water habitat",
    likelyPlaceType: "shoreline, river overlook, or marsh edge",
    imageUrl: "/field-guide/birds.png",
    imageAlt: "Osprey field-guide illustration",
    regionalNotes: "A signature Southern Maryland warm-season bird.",
    whyToday: "spring and summer water activity make fish-hunting raptors especially believable in this region",
    weatherTags: ["migration", "shoreline", "wind"]
  },
  {
    slug: "eastern-bluebird",
    commonName: "Eastern Bluebird",
    scientificName: "Sialia sialis",
    monthsActive: [3, 4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    habitat: "open park edges, fence lines, meadow edges, and nest-box habitat",
    likelyPlaceType: "open park edge, field trail, or meadow border",
    imageUrl: "/field-guide/birds.png",
    imageAlt: "Eastern bluebird field-guide illustration",
    regionalNotes: "Best around open edges rather than dense woods.",
    whyToday: "nesting-season movement and open-edge feeding make bluebirds a strong family watch bird right now",
    weatherTags: ["sun", "meadow", "calm"]
  },
  {
    slug: "great-blue-heron",
    commonName: "Great Blue Heron",
    scientificName: "Ardea herodias",
    monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    seasons: ["spring", "summer", "fall", "winter"],
    habitat: "pond edge, creek mouth, tidal flat, and marsh habitat",
    likelyPlaceType: "pond edge, marsh boardwalk, or tidal shoreline",
    imageUrl: "/field-guide/birds.png",
    imageAlt: "Great blue heron field-guide illustration",
    regionalNotes: "Useful year-round water bird for family observation.",
    whyToday: "water edges stay productive for patient hunting birds through much of the year",
    weatherTags: ["shoreline", "wetland", "wind"]
  },
  {
    slug: "yellow-rumped-warbler",
    commonName: "Yellow-rumped Warbler",
    scientificName: "Setophaga coronata",
    monthsActive: [10, 11, 12, 1, 2, 3, 4],
    seasons: ["fall", "winter", "spring"],
    habitat: "wooded edges, evergreen pockets, and migration stopover habitat",
    likelyPlaceType: "wooded edge, park trail, or evergreen border",
    imageUrl: "/field-guide/birds.png",
    imageAlt: "Yellow-rumped warbler field-guide illustration",
    regionalNotes: "Good migration and cool-season yard-edge bird.",
    whyToday: "migration and cool-season edge habitat make small active songbirds more likely to show up now",
    weatherTags: ["migration", "woods", "cool"]
  },
  {
    slug: "red-winged-blackbird",
    commonName: "Red-winged Blackbird",
    scientificName: "Agelaius phoeniceus",
    monthsActive: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    seasons: ["spring", "summer", "fall"],
    habitat: "marsh edge, cattails, wet field, and pond margin habitat",
    likelyPlaceType: "marsh edge, pond trail, or wet meadow",
    imageUrl: "/field-guide/birds.png",
    imageAlt: "Red-winged blackbird field-guide illustration",
    regionalNotes: "A strong call-and-habitat species for families around wetlands.",
    whyToday: "wetland edges and calling activity make blackbirds easier to notice in this part of the year",
    weatherTags: ["wetland", "migration", "damp"]
  }
];

export function pickBirdOfTheDay(requestDate?: string) {
  return pickSeasonalSpecies(BIRD_SPECIES, requestDate, "bird");
}
