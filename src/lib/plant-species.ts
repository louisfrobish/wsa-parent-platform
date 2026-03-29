import { pickSeasonalSpecies, type SeasonalSpecies } from "@/lib/seasonal-species";

export type PlantSpecies = SeasonalSpecies & {
  likelyHabitat: string;
  likelyPlaceType: string;
  imageUrl: string;
  imageAlt: string;
  whyToday: string;
  weatherTags?: import("@/lib/weather-aware-species").DailyWeatherTag[];
};

export const PLANT_SPECIES: PlantSpecies[] = [
  {
    slug: "red-maple",
    commonName: "Red Maple",
    scientificName: "Acer rubrum",
    monthsActive: [2, 3, 4],
    seasons: ["spring"],
    likelyHabitat: "yard edges, wet woods, and park tree lines",
    likelyPlaceType: "park trail, yard tree line, or wet woodland edge",
    imageUrl: "/field-guide/leaf-and-bark-id.png",
    imageAlt: "Red maple field-guide illustration",
    regionalNotes: "One of the clearest early-spring tree signals in Maryland.",
    whyToday: "early buds and color changes make this a strong plant clue in late winter and spring",
    weatherTags: ["cool", "woods"]
  },
  {
    slug: "eastern-redbud",
    commonName: "Eastern Redbud",
    scientificName: "Cercis canadensis",
    monthsActive: [3, 4, 5],
    seasons: ["spring"],
    likelyHabitat: "woodland edges, yards, and sunny trail borders",
    likelyPlaceType: "yard edge, sunny path, or park border",
    imageUrl: "/field-guide/leaf-and-bark-id.png",
    imageAlt: "Eastern redbud field-guide illustration",
    regionalNotes: "A standout spring flowering tree for family observation.",
    whyToday: "spring bloom timing makes redbud one of the easiest colorful trees to notice right now",
    weatherTags: ["sun", "warm"]
  },
  {
    slug: "milkweed",
    commonName: "Common Milkweed",
    scientificName: "Asclepias syriaca",
    monthsActive: [6, 7, 8, 9],
    seasons: ["summer", "fall"],
    likelyHabitat: "meadow edges, sunny field margins, and pollinator habitat",
    likelyPlaceType: "meadow path, sunny field edge, or pollinator garden",
    imageUrl: "/field-guide/leaf-and-bark-id.png",
    imageAlt: "Common milkweed field-guide illustration",
    regionalNotes: "Useful for monarch and pollinator conversations.",
    whyToday: "warm-season meadow growth makes milkweed and its insect visitors more relevant now",
    weatherTags: ["sun", "warm", "meadow"]
  },
  {
    slug: "goldenrod",
    commonName: "Goldenrod",
    scientificName: "Solidago spp.",
    monthsActive: [8, 9, 10],
    seasons: ["summer", "fall"],
    likelyHabitat: "field edges, roadsides, meadows, and sunny open habitat",
    likelyPlaceType: "meadow edge, field path, or sunny roadside pull-off",
    imageUrl: "/field-guide/leaf-and-bark-id.png",
    imageAlt: "Goldenrod field-guide illustration",
    regionalNotes: "A very believable late-season field-guide plant.",
    whyToday: "late-summer and fall color in open habitat makes goldenrod an easy family nature-study win",
    weatherTags: ["sun", "meadow", "warm"]
  },
  {
    slug: "american-holly",
    commonName: "American Holly",
    scientificName: "Ilex opaca",
    monthsActive: [11, 12, 1, 2],
    seasons: ["fall", "winter"],
    likelyHabitat: "wooded yards, evergreen pockets, and forest edges",
    likelyPlaceType: "evergreen edge, yard tree line, or woodland border",
    imageUrl: "/field-guide/leaf-and-bark-id.png",
    imageAlt: "American holly field-guide illustration",
    regionalNotes: "Winter leaves and berries make this useful when flowers are scarce.",
    whyToday: "evergreen leaves, berries, and winter structure make holly a strong cold-season plant study",
    weatherTags: ["cool", "woods", "scouting"]
  }
];

export function pickPlantOfTheDay(requestDate?: string) {
  return pickSeasonalSpecies(PLANT_SPECIES, requestDate, "plant");
}
