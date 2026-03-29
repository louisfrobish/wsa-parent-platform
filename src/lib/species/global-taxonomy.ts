import { getFishDataByName } from "@/lib/species/fish-data";
import {
  findRegionalSpeciesByName,
  getRegionSpeciesPack,
  mapDiscoverCategoryToRegionPackCategory,
  type RegionPackCategory
} from "@/lib/species/region-pack";
import type { DiscoverCategory } from "@/lib/identify";

export type TaxonomyHierarchy = {
  kingdom?: string;
  phylum?: string;
  className?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
};

export type SpeciesLookupResult = {
  commonName: string;
  scientificName: string;
  taxonomy: TaxonomyHierarchy;
  source: "regional_pack" | "gbif" | "inaturalist" | "catalogue_of_life" | "fishbase" | "fallback";
  rangeSummary?: string;
  regionallyPrioritized: boolean;
  habitatTags?: string[];
  fishTraits?: {
    flavorProfile: string;
    bestCookingMethods: string[];
    preparationTips: string;
    bestBait: string;
    bestLures: string[];
    bestSeason: string;
    wsaAnglerTip: string;
  };
};

type SpeciesLookupInput = {
  commonName: string;
  scientificName?: string;
  category: DiscoverCategory;
  region: string;
};

type TaxonomyProvider = {
  name: SpeciesLookupResult["source"];
  search: (input: SpeciesLookupInput) => Promise<SpeciesLookupResult | null>;
};

const providers: TaxonomyProvider[] = [
  { name: "regional_pack", search: searchRegionalPack },
  { name: "gbif", search: searchGbif },
  { name: "inaturalist", search: searchINaturalist },
  { name: "catalogue_of_life", search: searchCatalogueOfLife },
  { name: "fishbase", search: searchFishBase }
];

export async function lookupSpecies(input: SpeciesLookupInput): Promise<SpeciesLookupResult | null> {
  for (const provider of providers) {
    try {
      const match = await provider.search(input);
      if (match) return match;
    } catch {
      continue;
    }
  }

  return buildFallbackResult(input);
}

export function getSupportedTaxonomyProviders() {
  return providers.map((provider) => provider.name);
}

async function searchRegionalPack(input: SpeciesLookupInput) {
  const categories = mapDiscoverCategoryToRegionPackCategory(input.category);
  const species = findRegionalSpeciesByName(input.region, input.commonName, categories);
  if (!species) return null;

  return {
    commonName: species.commonName,
    scientificName: species.scientificName,
    taxonomy: species.taxonomy,
    source: "regional_pack" as const,
    rangeSummary: species.rangeNote || `A curated ${input.region} field-guide species.`,
    regionallyPrioritized: true,
    habitatTags: species.habitatTags,
    fishTraits: species.fishDataSlug ? getFishDataByName(species.commonName) ?? undefined : undefined
  };
}

async function searchGbif(input: SpeciesLookupInput) {
  const q = encodeURIComponent(input.scientificName?.trim() || input.commonName.trim());
  const response = await fetchWithTimeout(`https://api.gbif.org/v1/species/match?verbose=true&name=${q}`);
  if (!response?.ok) return null;
  const payload = (await response.json()) as {
    scientificName?: string;
    canonicalName?: string;
    kingdom?: string;
    phylum?: string;
    class?: string;
    order?: string;
    family?: string;
    genus?: string;
    rank?: string;
    status?: string;
  };

  if (!payload.scientificName && !payload.canonicalName) return null;

  return {
    commonName: input.commonName,
    scientificName: payload.scientificName || input.scientificName || input.commonName,
    taxonomy: {
      kingdom: payload.kingdom,
      phylum: payload.phylum,
      className: payload.class,
      order: payload.order,
      family: payload.family,
      genus: payload.genus,
      species: payload.canonicalName
    },
    source: "gbif" as const,
    rangeSummary: "Matched through GBIF taxonomy lookup.",
    regionallyPrioritized: false,
    habitatTags: undefined,
    fishTraits: input.category === "fish" ? getFishDataByName(input.commonName) ?? undefined : undefined
  };
}

async function searchINaturalist(input: SpeciesLookupInput) {
  const q = encodeURIComponent(input.commonName.trim());
  const response = await fetchWithTimeout(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${q}&per_page=1`);
  if (!response?.ok) return null;
  const payload = (await response.json()) as {
    results?: Array<{
      preferred_common_name?: string;
      name?: string;
      iconic_taxon_name?: string;
      rank?: string;
    }>;
  };

  const first = payload.results?.[0];
  if (!first?.name) return null;

  return {
    commonName: first.preferred_common_name || input.commonName,
    scientificName: first.name,
    taxonomy: {
      kingdom: first.iconic_taxon_name,
      species: first.name
    },
    source: "inaturalist" as const,
    rangeSummary: "Matched through iNaturalist taxonomy lookup.",
    regionallyPrioritized: false,
    habitatTags: undefined,
    fishTraits: input.category === "fish" ? getFishDataByName(first.preferred_common_name || input.commonName) ?? undefined : undefined
  };
}

async function searchCatalogueOfLife(input: SpeciesLookupInput) {
  const q = encodeURIComponent(input.scientificName?.trim() || input.commonName.trim());
  const response = await fetchWithTimeout(`https://api.catalogueoflife.org/dataset/3LR/nameusage/search?q=${q}&limit=1`);
  if (!response?.ok) return null;
  const payload = (await response.json()) as {
    result?: Array<{
      usage?: {
        scientificName?: string;
        label?: string;
        classification?: Array<{ rank?: string; name?: string }>;
      };
    }>;
  };

  const usage = payload.result?.[0]?.usage;
  if (!usage?.scientificName) return null;
  const taxonomy = buildTaxonomyFromClassification(usage.classification ?? []);

  return {
    commonName: input.commonName,
    scientificName: usage.scientificName,
    taxonomy,
    source: "catalogue_of_life" as const,
    rangeSummary: "Matched through Catalogue of Life taxonomy lookup.",
    regionallyPrioritized: false,
    habitatTags: undefined,
    fishTraits: input.category === "fish" ? getFishDataByName(input.commonName) ?? undefined : undefined
  };
}

async function searchFishBase(input: SpeciesLookupInput) {
  if (input.category !== "fish") return null;

  const regional = findRegionalSpeciesByName(input.region, input.commonName, ["fish"]);
  const fishTraits = getFishDataByName(input.commonName);
  if (!regional && !fishTraits) return null;

  return {
    commonName: regional?.commonName || input.commonName,
    scientificName: regional?.scientificName || input.scientificName || input.commonName,
    taxonomy: regional?.taxonomy || { kingdom: "Animalia", className: "Actinopterygii" },
    source: "fishbase" as const,
    rangeSummary: regional?.rangeNote || "Fish profile enriched with angler-friendly data.",
    regionallyPrioritized: Boolean(regional),
    habitatTags: regional?.habitatTags,
    fishTraits: fishTraits ?? undefined
  };
}

function buildFallbackResult(input: SpeciesLookupInput): SpeciesLookupResult {
  const pack = getRegionSpeciesPack(input.region);
  const fishTraits = input.category === "fish" ? getFishDataByName(input.commonName) ?? undefined : undefined;

  return {
    commonName: input.commonName,
    scientificName: input.scientificName || input.commonName,
    taxonomy: {
      kingdom: guessKingdom(input.category)
    },
    source: "fallback",
    rangeSummary: `No curated ${input.region} match was found, so this remains a broader possible identification.`,
    regionallyPrioritized: pack.region.toLowerCase() === input.region.toLowerCase(),
    habitatTags: undefined,
    fishTraits
  };
}

function buildTaxonomyFromClassification(entries: Array<{ rank?: string; name?: string }>): TaxonomyHierarchy {
  const taxonomy: TaxonomyHierarchy = {};
  for (const entry of entries) {
    const rank = entry.rank?.toLowerCase();
    if (!rank || !entry.name) continue;
    if (rank === "kingdom") taxonomy.kingdom = entry.name;
    if (rank === "phylum") taxonomy.phylum = entry.name;
    if (rank === "class") taxonomy.className = entry.name;
    if (rank === "order") taxonomy.order = entry.name;
    if (rank === "family") taxonomy.family = entry.name;
    if (rank === "genus") taxonomy.genus = entry.name;
    if (rank === "species") taxonomy.species = entry.name;
  }
  return taxonomy;
}

function guessKingdom(category: DiscoverCategory) {
  if (category === "plant" || category === "tree") return "Plantae";
  if (category === "mushroom") return "Fungi";
  return "Animalia";
}

async function fetchWithTimeout(url: string, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal,
      cache: "no-store"
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
