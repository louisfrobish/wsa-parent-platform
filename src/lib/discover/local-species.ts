import type { DiscoverCategory } from "@/lib/identify";

export type DiscoverRangePlausibility = "likely_local" | "possible_but_uncommon" | "low_regional_confidence" | "unknown";

export type LocalSpeciesEntry = {
  category: DiscoverCategory;
  commonName: string;
  scientificName: string;
  aliases?: string[];
  monthsActive: number[];
  habitatHints?: string[];
  localLookalikes?: string[];
  regionalNote?: string;
};

export const southernMarylandSpecies: LocalSpeciesEntry[] = [
  {
    category: "bird",
    commonName: "Osprey",
    scientificName: "Pandion haliaetus",
    monthsActive: [3, 4, 5, 6, 7, 8, 9],
    habitatHints: ["shoreline", "river", "marsh", "pond"],
    localLookalikes: ["Bald Eagle", "Great Blue Heron"],
    regionalNote: "A classic warm-season Southern Maryland shoreline bird."
  },
  {
    category: "bird",
    commonName: "Great Blue Heron",
    scientificName: "Ardea herodias",
    monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    habitatHints: ["shoreline", "marsh", "pond", "creek"],
    localLookalikes: ["Green Heron", "Great Egret"]
  },
  {
    category: "bird",
    commonName: "Red-winged Blackbird",
    scientificName: "Agelaius phoeniceus",
    monthsActive: [3, 4, 5, 6, 7, 8, 9, 10],
    habitatHints: ["marsh", "field", "pond"],
    localLookalikes: ["Common Grackle", "Brown-headed Cowbird"]
  },
  {
    category: "bird",
    commonName: "Northern Cardinal",
    scientificName: "Cardinalis cardinalis",
    monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    habitatHints: ["yard", "woodland", "edge"],
    localLookalikes: ["Summer Tanager", "House Finch"]
  },
  {
    category: "fish",
    commonName: "Largemouth Bass",
    scientificName: "Micropterus salmoides",
    monthsActive: [3, 4, 5, 6, 7, 8, 9, 10],
    habitatHints: ["pond", "lake", "river"],
    localLookalikes: ["Chain Pickerel", "Bluegill"]
  },
  {
    category: "fish",
    commonName: "Bluegill",
    scientificName: "Lepomis macrochirus",
    monthsActive: [4, 5, 6, 7, 8, 9],
    habitatHints: ["pond", "lake"],
    localLookalikes: ["Pumpkinseed Sunfish", "Redbreast Sunfish"]
  },
  {
    category: "fish",
    commonName: "White Perch",
    scientificName: "Morone americana",
    monthsActive: [3, 4, 5, 6, 9, 10, 11],
    habitatHints: ["shoreline", "tidal", "river"],
    localLookalikes: ["Yellow Perch", "Striped Bass"]
  },
  {
    category: "fish",
    commonName: "Channel Catfish",
    scientificName: "Ictalurus punctatus",
    monthsActive: [4, 5, 6, 7, 8, 9, 10],
    habitatHints: ["river", "lake", "pond"],
    localLookalikes: ["Blue Catfish", "Bullhead Catfish"]
  },
  {
    category: "animal",
    commonName: "Eastern Gray Squirrel",
    scientificName: "Sciurus carolinensis",
    aliases: ["Gray Squirrel"],
    monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    habitatHints: ["yard", "woodland", "park"],
    localLookalikes: ["Fox Squirrel"]
  },
  {
    category: "animal",
    commonName: "Spring Peeper",
    scientificName: "Pseudacris crucifer",
    monthsActive: [2, 3, 4, 5],
    habitatHints: ["wetland", "marsh", "pond", "creek"],
    localLookalikes: ["Green Frog", "Gray Treefrog"]
  },
  {
    category: "animal",
    commonName: "Eastern Box Turtle",
    scientificName: "Terrapene carolina carolina",
    monthsActive: [4, 5, 6, 7, 8, 9, 10],
    habitatHints: ["woodland", "trail", "yard"],
    localLookalikes: ["Painted Turtle", "Eastern Mud Turtle"]
  },
  {
    category: "bug",
    commonName: "Eastern Tiger Swallowtail",
    scientificName: "Papilio glaucus",
    monthsActive: [4, 5, 6, 7, 8, 9],
    habitatHints: ["garden", "field", "yard"],
    localLookalikes: ["Spicebush Swallowtail", "Black Swallowtail"]
  },
  {
    category: "bug",
    commonName: "Monarch Butterfly",
    scientificName: "Danaus plexippus",
    monthsActive: [5, 6, 7, 8, 9, 10],
    habitatHints: ["field", "garden", "meadow"],
    localLookalikes: ["Viceroy", "Queen Butterfly"]
  },
  {
    category: "bug",
    commonName: "Common Green Darner",
    scientificName: "Anax junius",
    monthsActive: [4, 5, 6, 7, 8, 9, 10],
    habitatHints: ["pond", "marsh", "creek"],
    localLookalikes: ["Blue Dasher", "Eastern Pondhawk"]
  },
  {
    category: "tree",
    commonName: "Red Maple",
    scientificName: "Acer rubrum",
    monthsActive: [1, 2, 3, 4, 10, 11, 12],
    habitatHints: ["yard", "woodland", "wetland"],
    localLookalikes: ["Sugar Maple", "Sweetgum"]
  },
  {
    category: "tree",
    commonName: "Flowering Dogwood",
    scientificName: "Cornus florida",
    monthsActive: [3, 4, 5, 9, 10],
    habitatHints: ["yard", "woodland", "trail"],
    localLookalikes: ["Kousa Dogwood", "Redbud"]
  },
  {
    category: "plant",
    commonName: "Common Milkweed",
    scientificName: "Asclepias syriaca",
    monthsActive: [5, 6, 7, 8, 9],
    habitatHints: ["field", "garden", "meadow"],
    localLookalikes: ["Dogbane", "Butterfly Weed"]
  },
  {
    category: "plant",
    commonName: "Goldenrod",
    scientificName: "Solidago spp.",
    monthsActive: [7, 8, 9, 10],
    habitatHints: ["field", "meadow", "roadside"],
    localLookalikes: ["Ragweed", "Asters"]
  },
  {
    category: "plant",
    commonName: "American Holly",
    scientificName: "Ilex opaca",
    monthsActive: [10, 11, 12, 1, 2],
    habitatHints: ["woodland", "yard"],
    localLookalikes: ["Inkberry", "Winterberry"]
  },
  {
    category: "mushroom",
    commonName: "Turkey Tail",
    scientificName: "Trametes versicolor",
    monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    habitatHints: ["woodland", "log", "trail"],
    localLookalikes: ["False Turkey Tail", "Stereum"]
  },
  {
    category: "mushroom",
    commonName: "Chicken of the Woods",
    scientificName: "Laetiporus sulphureus",
    monthsActive: [5, 6, 7, 8, 9, 10],
    habitatHints: ["woodland", "log", "tree"],
    localLookalikes: ["Jack-o'-lantern Mushroom", "Old shelf fungi"]
  }
];

export const outOfRegionKeywords: Record<DiscoverCategory, string[]> = {
  animal: ["kangaroo", "koala", "sloth", "lemur"],
  bird: ["toucan", "macaw", "penguin", "puffin", "flamingo"],
  bug: ["tarantula hawk", "atlas moth"],
  tree: ["baobab", "sequoia", "saguaro"],
  fish: ["clownfish", "marlin", "tarpon", "piranha"],
  plant: ["saguaro", "baobab", "mangrove"],
  mushroom: ["fly agaric", "ghost fungus"]
};

export const categoryFallbackLookalikes: Record<DiscoverCategory, string[]> = {
  animal: ["Eastern Gray Squirrel", "Eastern Box Turtle", "White-tailed Deer"],
  bird: ["Northern Cardinal", "Great Blue Heron", "Red-winged Blackbird"],
  bug: ["Monarch Butterfly", "Eastern Tiger Swallowtail", "Common Green Darner"],
  tree: ["Red Maple", "Flowering Dogwood", "White Oak"],
  fish: ["Largemouth Bass", "Bluegill", "White Perch"],
  plant: ["Common Milkweed", "Goldenrod", "American Holly"],
  mushroom: ["Turkey Tail", "Chicken of the Woods", "Common shelf fungi"]
};
