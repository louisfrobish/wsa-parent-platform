import { FISH_SPECIES } from "@/lib/fish-species";
import { FISH_DATA } from "@/lib/species/fish-data";
import type { DiscoverCategory } from "@/lib/identify";

export type RegionPackCategory =
  | "birds"
  | "fish"
  | "mammals"
  | "reptiles"
  | "amphibians"
  | "insects"
  | "plants"
  | "trees"
  | "mushrooms";

export type RegionPackSpecies = {
  slug: string;
  commonName: string;
  scientificName: string;
  category: RegionPackCategory;
  taxonomy: {
    kingdom: string;
    phylum?: string;
    className?: string;
    order?: string;
    family?: string;
    genus?: string;
    species?: string;
  };
  monthsActive: number[];
  habitatTags?: string[];
  rangeNote?: string;
  aliases?: string[];
  fishDataSlug?: string;
};

export type SpeciesPack = {
  id: string;
  region: string;
  species: RegionPackSpecies[];
};

export const southernMarylandSpeciesPack: SpeciesPack = {
  id: "southern-maryland-core",
  region: "Southern Maryland",
  species: [
    {
      slug: "osprey",
      commonName: "Osprey",
      scientificName: "Pandion haliaetus",
      category: "birds",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Aves",
        order: "Accipitriformes",
        family: "Pandionidae",
        genus: "Pandion",
        species: "P. haliaetus"
      },
      monthsActive: [3, 4, 5, 6, 7, 8, 9],
      habitatTags: ["shoreline", "river", "marsh", "pond"],
      rangeNote: "A signature warm-season Chesapeake and Southern Maryland bird."
    },
    {
      slug: "great-blue-heron",
      commonName: "Great Blue Heron",
      scientificName: "Ardea herodias",
      category: "birds",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Aves",
        order: "Pelecaniformes",
        family: "Ardeidae",
        genus: "Ardea",
        species: "A. herodias"
      },
      monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      habitatTags: ["pond", "marsh", "shoreline", "creek"]
    },
    {
      slug: "northern-cardinal",
      commonName: "Northern Cardinal",
      scientificName: "Cardinalis cardinalis",
      category: "birds",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Aves",
        order: "Passeriformes",
        family: "Cardinalidae",
        genus: "Cardinalis",
        species: "C. cardinalis"
      },
      monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      habitatTags: ["yard", "woodland", "edge"]
    },
    {
      slug: "eastern-gray-squirrel",
      commonName: "Eastern Gray Squirrel",
      scientificName: "Sciurus carolinensis",
      category: "mammals",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Mammalia",
        order: "Rodentia",
        family: "Sciuridae",
        genus: "Sciurus",
        species: "S. carolinensis"
      },
      monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      habitatTags: ["yard", "park", "woodland"],
      aliases: ["Gray Squirrel"]
    },
    {
      slug: "spring-peeper",
      commonName: "Spring Peeper",
      scientificName: "Pseudacris crucifer",
      category: "amphibians",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Amphibia",
        order: "Anura",
        family: "Hylidae",
        genus: "Pseudacris",
        species: "P. crucifer"
      },
      monthsActive: [2, 3, 4, 5],
      habitatTags: ["wetland", "marsh", "pond", "creek"]
    },
    {
      slug: "eastern-box-turtle",
      commonName: "Eastern Box Turtle",
      scientificName: "Terrapene carolina carolina",
      category: "reptiles",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Reptilia",
        order: "Testudines",
        family: "Emydidae",
        genus: "Terrapene",
        species: "T. carolina"
      },
      monthsActive: [4, 5, 6, 7, 8, 9, 10],
      habitatTags: ["woodland", "trail", "yard"]
    },
    {
      slug: "monarch-butterfly",
      commonName: "Monarch Butterfly",
      scientificName: "Danaus plexippus",
      category: "insects",
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Arthropoda",
        className: "Insecta",
        order: "Lepidoptera",
        family: "Nymphalidae",
        genus: "Danaus",
        species: "D. plexippus"
      },
      monthsActive: [5, 6, 7, 8, 9, 10],
      habitatTags: ["field", "garden", "meadow"]
    },
    {
      slug: "red-maple",
      commonName: "Red Maple",
      scientificName: "Acer rubrum",
      category: "trees",
      taxonomy: {
        kingdom: "Plantae",
        phylum: "Tracheophyta",
        className: "Magnoliopsida",
        order: "Sapindales",
        family: "Sapindaceae",
        genus: "Acer",
        species: "A. rubrum"
      },
      monthsActive: [1, 2, 3, 4, 10, 11, 12],
      habitatTags: ["yard", "woodland", "wetland"]
    },
    {
      slug: "flowering-dogwood",
      commonName: "Flowering Dogwood",
      scientificName: "Cornus florida",
      category: "trees",
      taxonomy: {
        kingdom: "Plantae",
        phylum: "Tracheophyta",
        className: "Magnoliopsida",
        order: "Cornales",
        family: "Cornaceae",
        genus: "Cornus",
        species: "C. florida"
      },
      monthsActive: [3, 4, 5, 9, 10],
      habitatTags: ["yard", "trail", "woodland"]
    },
    {
      slug: "common-milkweed",
      commonName: "Common Milkweed",
      scientificName: "Asclepias syriaca",
      category: "plants",
      taxonomy: {
        kingdom: "Plantae",
        phylum: "Tracheophyta",
        className: "Magnoliopsida",
        order: "Gentianales",
        family: "Apocynaceae",
        genus: "Asclepias",
        species: "A. syriaca"
      },
      monthsActive: [5, 6, 7, 8, 9],
      habitatTags: ["field", "garden", "meadow"]
    },
    {
      slug: "goldenrod",
      commonName: "Goldenrod",
      scientificName: "Solidago spp.",
      category: "plants",
      taxonomy: {
        kingdom: "Plantae",
        phylum: "Tracheophyta",
        className: "Magnoliopsida",
        order: "Asterales",
        family: "Asteraceae",
        genus: "Solidago",
        species: "Solidago"
      },
      monthsActive: [7, 8, 9, 10],
      habitatTags: ["field", "meadow", "roadside"]
    },
    {
      slug: "turkey-tail",
      commonName: "Turkey Tail",
      scientificName: "Trametes versicolor",
      category: "mushrooms",
      taxonomy: {
        kingdom: "Fungi",
        phylum: "Basidiomycota",
        className: "Agaricomycetes",
        order: "Polyporales",
        family: "Polyporaceae",
        genus: "Trametes",
        species: "T. versicolor"
      },
      monthsActive: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      habitatTags: ["woodland", "log", "trail"]
    },
    ...FISH_SPECIES.map((species) => ({
      slug: species.slug,
      commonName: species.commonName,
      scientificName: species.scientificName,
      category: "fish" as const,
      taxonomy: {
        kingdom: "Animalia",
        phylum: "Chordata",
        className: "Actinopterygii"
      },
      monthsActive: species.monthsActive,
      habitatTags: species.water,
      rangeNote: species.regionalNotes,
      fishDataSlug: species.slug
    }))
  ]
};

export function getRegionSpeciesPack(region = "Southern Maryland") {
  if (region.toLowerCase().includes("southern maryland")) {
    return southernMarylandSpeciesPack;
  }

  return southernMarylandSpeciesPack;
}

export function mapDiscoverCategoryToRegionPackCategory(category: DiscoverCategory): RegionPackCategory[] {
  switch (category) {
    case "animal":
      return ["mammals", "reptiles", "amphibians"];
    case "bird":
      return ["birds"];
    case "bug":
      return ["insects"];
    case "tree":
      return ["trees"];
    case "fish":
      return ["fish"];
    case "plant":
      return ["plants"];
    case "mushroom":
      return ["mushrooms"];
  }
}

export function findRegionalSpeciesByName(region: string, name: string, categories?: RegionPackCategory[]) {
  const pack = getRegionSpeciesPack(region);
  const normalized = normalize(name);
  return (
    pack.species.find((species) => {
      if (categories?.length && !categories.includes(species.category)) {
        return false;
      }

      const aliases = species.aliases ?? [];
      return [species.commonName, species.scientificName, ...aliases]
        .map(normalize)
        .some((value) => normalized.includes(value));
    }) ?? null
  );
}

export function getRegionalFishProfiles() {
  return FISH_DATA;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
