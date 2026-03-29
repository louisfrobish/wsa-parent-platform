export type FishSpecies = {
  slug: string;
  commonName: string;
  scientificName: string;
  water: ("lake" | "river" | "tidal" | "pond")[];
  difficulty: "easy" | "moderate" | "advanced";
  monthsActive: number[];
  seasons?: ("spring" | "summer" | "fall" | "winter")[];
  regionalNotes?: string;
};

export const FISH_SPECIES: FishSpecies[] = [
  {
    slug: "largemouth-bass",
    commonName: "Largemouth Bass",
    scientificName: "Micropterus salmoides",
    water: ["lake", "pond", "river"],
    difficulty: "easy",
    monthsActive: [4, 5, 6, 7, 8, 9, 10],
    seasons: ["spring", "summer", "fall"],
    regionalNotes: "A strong warm-water family fish around cover, weed lines, and pond or lake edges."
  },
  {
    slug: "bluegill",
    commonName: "Bluegill",
    scientificName: "Lepomis macrochirus",
    water: ["lake", "pond"],
    difficulty: "easy",
    monthsActive: [4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    regionalNotes: "Often one of the easiest beginner fish in calm warm water."
  },
  {
    slug: "channel-catfish",
    commonName: "Channel Catfish",
    scientificName: "Ictalurus punctatus",
    water: ["river", "lake"],
    difficulty: "easy",
    monthsActive: [5, 6, 7, 8, 9, 10],
    seasons: ["summer", "fall"],
    regionalNotes: "A practical family target around deeper water and evening windows."
  },
  {
    slug: "white-perch",
    commonName: "White Perch",
    scientificName: "Morone americana",
    water: ["tidal", "river"],
    difficulty: "easy",
    monthsActive: [3, 4, 5, 6, 9, 10, 11],
    seasons: ["spring", "summer", "fall"],
    regionalNotes: "Especially believable around spring runs and tidal river movement."
  },
  {
    slug: "yellow-perch",
    commonName: "Yellow Perch",
    scientificName: "Perca flavescens",
    water: ["lake", "river"],
    difficulty: "easy",
    monthsActive: [1, 2, 3, 10, 11, 12],
    seasons: ["winter", "spring", "fall"],
    regionalNotes: "A cooler-water option when warm-season fish feel less active."
  },
  {
    slug: "black-crappie",
    commonName: "Black Crappie",
    scientificName: "Pomoxis nigromaculatus",
    water: ["lake", "pond"],
    difficulty: "moderate",
    monthsActive: [3, 4, 5, 9, 10],
    seasons: ["spring", "fall"],
    regionalNotes: "Most believable around spring shallows and cooler shoulder seasons."
  },
  {
    slug: "white-crappie",
    commonName: "White Crappie",
    scientificName: "Pomoxis annularis",
    water: ["lake", "river"],
    difficulty: "moderate",
    monthsActive: [3, 4, 5, 9, 10],
    seasons: ["spring", "fall"],
    regionalNotes: "Useful for river or lake structure during spring and fall transitions."
  },
  {
    slug: "chain-pickerel",
    commonName: "Chain Pickerel",
    scientificName: "Esox niger",
    water: ["pond", "river"],
    difficulty: "moderate",
    monthsActive: [1, 2, 3, 4, 10, 11, 12],
    seasons: ["winter", "spring", "fall"],
    regionalNotes: "A cooler-season ambush fish around weeds and quiet cover."
  },
  {
    slug: "striped-bass",
    commonName: "Striped Bass",
    scientificName: "Morone saxatilis",
    water: ["tidal"],
    difficulty: "advanced",
    monthsActive: [3, 4, 5, 10, 11],
    seasons: ["spring", "fall"],
    regionalNotes: "Most believable during migration windows and stronger tidal movement."
  },
  {
    slug: "atlantic-croaker",
    commonName: "Atlantic Croaker",
    scientificName: "Micropogonias undulatus",
    water: ["tidal"],
    difficulty: "easy",
    monthsActive: [6, 7, 8, 9],
    seasons: ["summer"],
    regionalNotes: "A warm-season tidal fish for family-friendly bait rigs."
  },
  {
    slug: "spot",
    commonName: "Spot",
    scientificName: "Leiostomus xanthurus",
    water: ["tidal"],
    difficulty: "easy",
    monthsActive: [6, 7, 8, 9],
    seasons: ["summer"],
    regionalNotes: "A classic easy summer shoreline fish in tidal water."
  },
  {
    slug: "blue-catfish",
    commonName: "Blue Catfish",
    scientificName: "Ictalurus furcatus",
    water: ["river", "tidal"],
    difficulty: "moderate",
    monthsActive: [4, 5, 6, 7, 8, 9, 10],
    seasons: ["spring", "summer", "fall"],
    regionalNotes: "A realistic larger river or tidal-system catfish in warmer periods."
  },
  {
    slug: "flathead-catfish",
    commonName: "Flathead Catfish",
    scientificName: "Pylodictis olivaris",
    water: ["river"],
    difficulty: "advanced",
    monthsActive: [5, 6, 7, 8, 9],
    seasons: ["summer"],
    regionalNotes: "More advanced big-river option, better as a scouting or aspiration species."
  },
  {
    slug: "pumpkinseed",
    commonName: "Pumpkinseed Sunfish",
    scientificName: "Lepomis gibbosus",
    water: ["pond", "lake"],
    difficulty: "easy",
    monthsActive: [4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    regionalNotes: "A friendly warm-season shoreline fish for younger beginners."
  },
  {
    slug: "redbreast-sunfish",
    commonName: "Redbreast Sunfish",
    scientificName: "Lepomis auritus",
    water: ["river"],
    difficulty: "easy",
    monthsActive: [4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    regionalNotes: "A creek and river sunfish that fits light family tackle in warmer months."
  },
  {
    slug: "bowfin",
    commonName: "Bowfin",
    scientificName: "Amia calva",
    water: ["pond", "river"],
    difficulty: "moderate",
    monthsActive: [5, 6, 7, 8, 9],
    seasons: ["summer"],
    regionalNotes: "A warmer-water structure fish around backwaters and vegetation."
  },
  {
    slug: "american-eel",
    commonName: "American Eel",
    scientificName: "Anguilla rostrata",
    water: ["river", "tidal"],
    difficulty: "advanced",
    monthsActive: [5, 6, 7, 8, 9, 10],
    seasons: ["summer", "fall"],
    regionalNotes: "A believable night-oriented river or tidal species, but not a beginner default."
  },
  {
    slug: "gizzard-shad",
    commonName: "Gizzard Shad",
    scientificName: "Dorosoma cepedianum",
    water: ["lake", "river"],
    difficulty: "advanced",
    monthsActive: [4, 5, 6, 7, 8, 9],
    seasons: ["spring", "summer"],
    regionalNotes: "More useful as forage context than as a family target species."
  }
];

export function findFishSpeciesByName(name: string) {
  const normalized = normalizeName(name);

  return FISH_SPECIES.find((species) => normalizeName(species.commonName) === normalized) ?? fallbackMatch(normalized);
}

export function findFishSpeciesBySlug(slug: string) {
  return FISH_SPECIES.find((species) => species.slug === slug) ?? null;
}

function fallbackMatch(normalizedName: string) {
  if (normalizedName === normalizeName("Crappie")) {
    return findFishSpeciesBySlug("black-crappie");
  }

  if (normalizedName === normalizeName("Sunfish")) {
    return findFishSpeciesBySlug("bluegill");
  }

  if (normalizedName === normalizeName("Croaker")) {
    return findFishSpeciesBySlug("atlantic-croaker");
  }

  return null;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
