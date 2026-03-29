export type FishCulinaryProfile = {
  slug: string;
  commonName: string;
  flavorProfile: string;
  bestCookingMethods: string[];
  preparationTips: string;
  bestBait: string;
  bestLures: string[];
  bestSeason: string;
  wsaAnglerTip: string;
};

export const FISH_DATA: FishCulinaryProfile[] = [
  {
    slug: "largemouth-bass",
    commonName: "Largemouth Bass",
    flavorProfile: "Mild, flaky, and best when kept simple and fresh.",
    bestCookingMethods: ["pan-fry", "blacken", "grill"],
    preparationTips: "Trim darker meat and keep fillets cold so the flavor stays cleaner.",
    bestBait: "Nightcrawlers or live minnows around cover.",
    bestLures: ["soft plastics", "spinnerbaits", "topwater frogs"],
    bestSeason: "Late spring through early fall",
    wsaAnglerTip: "Start around weed edges, brush, and shaded cover before working open water."
  },
  {
    slug: "bluegill",
    commonName: "Bluegill",
    flavorProfile: "Sweet, delicate, and one of the most family-friendly panfish flavors.",
    bestCookingMethods: ["pan-fry", "whole fry", "fish tacos"],
    preparationTips: "Scale carefully and use small fillets or cook whole once cleaned well.",
    bestBait: "Worms under a bobber.",
    bestLures: ["tiny jigs", "micro spinners"],
    bestSeason: "Warm spring through summer",
    wsaAnglerTip: "Look for calm shallows near grass, dock posts, or warm sunny banks."
  },
  {
    slug: "channel-catfish",
    commonName: "Channel Catfish",
    flavorProfile: "Mild and firm when taken from cleaner moving water.",
    bestCookingMethods: ["fry", "grill", "stew"],
    preparationTips: "Trim belly fat and darker areas for a cleaner flavor.",
    bestBait: "Cut bait, chicken liver, or stink bait.",
    bestLures: ["scented soft baits", "catfish rigs"],
    bestSeason: "Late spring through fall evenings",
    wsaAnglerTip: "Focus on deeper holes, current breaks, and calmer banks near moving water."
  },
  {
    slug: "white-perch",
    commonName: "White Perch",
    flavorProfile: "Light and mild, especially when fish are kept fresh and iced quickly.",
    bestCookingMethods: ["pan-fry", "bake", "fish cakes"],
    preparationTips: "Fillet carefully around the rib line and remove pin bones if needed.",
    bestBait: "Bloodworms, grass shrimp, or small minnows.",
    bestLures: ["small spoons", "jigs", "inline spinners"],
    bestSeason: "Spring runs and fall schooling windows",
    wsaAnglerTip: "Check tidal creeks, dock edges, and moderate current seams before open shoreline."
  },
  {
    slug: "yellow-perch",
    commonName: "Yellow Perch",
    flavorProfile: "Sweet, clean, and one of the best-tasting local panfish.",
    bestCookingMethods: ["pan-fry", "bake", "fish sandwich"],
    preparationTips: "Thin fillets cook fast, so avoid overcooking.",
    bestBait: "Worm pieces or minnows.",
    bestLures: ["small jigs", "beetle spins"],
    bestSeason: "Cool spring and fall windows",
    wsaAnglerTip: "Probe cooler deeper edges and transition zones instead of shallow heat."
  },
  {
    slug: "black-crappie",
    commonName: "Black Crappie",
    flavorProfile: "Delicate, mild, and excellent for simple pan frying.",
    bestCookingMethods: ["pan-fry", "bake", "air fry"],
    preparationTips: "Small fillets benefit from light breading and quick cooking.",
    bestBait: "Minnows or worm pieces.",
    bestLures: ["tube jigs", "small marabou jigs"],
    bestSeason: "Spring and fall around structure",
    wsaAnglerTip: "Search brush piles, dock corners, and nearby drop-offs first."
  },
  {
    slug: "chain-pickerel",
    commonName: "Chain Pickerel",
    flavorProfile: "Lean with a stronger flavor, best for families who do not mind more bones.",
    bestCookingMethods: ["fry", "fish cakes", "grind for patties"],
    preparationTips: "Expect extra bones and trim carefully.",
    bestBait: "Live minnows.",
    bestLures: ["spoons", "jerkbaits", "spinnerbaits"],
    bestSeason: "Cool spring, fall, and mild winter days",
    wsaAnglerTip: "Work quiet weedy pockets and ambush cover with a slow, careful approach."
  },
  {
    slug: "atlantic-croaker",
    commonName: "Atlantic Croaker",
    flavorProfile: "Mild and slightly sweet when fish are fresh.",
    bestCookingMethods: ["whole fry", "grill", "bake"],
    preparationTips: "Scale well and keep simple seasoning so the fish stays approachable.",
    bestBait: "Bloodworms, shrimp, or squid strips.",
    bestLures: ["small metal jigs", "bottom rigs"],
    bestSeason: "Warm summer tidal periods",
    wsaAnglerTip: "Choose easy tidal shoreline access where bait movement is visible."
  },
  {
    slug: "spot",
    commonName: "Spot",
    flavorProfile: "Light and mild, especially for fresh summer fish.",
    bestCookingMethods: ["whole fry", "pan-fry", "grill"],
    preparationTips: "Smaller fish are often easiest cooked whole once cleaned.",
    bestBait: "Bloodworms, shrimp, or Fishbites strips.",
    bestLures: ["small bottom rigs", "tiny jigs"],
    bestSeason: "Summer through early fall",
    wsaAnglerTip: "Set up where families can watch bait and tide movement without fighting heavy surf."
  },
  {
    slug: "striped-bass",
    commonName: "Striped Bass",
    flavorProfile: "Rich and meaty, better for larger meals than quick snacks.",
    bestCookingMethods: ["grill", "bake", "broil"],
    preparationTips: "Trim darker meat and check local regulations carefully before harvest.",
    bestBait: "Cut bait or live bait where legal.",
    bestLures: ["bucktails", "swimbaits", "topwater plugs"],
    bestSeason: "Spring and fall migration windows",
    wsaAnglerTip: "Treat striped bass days as water-reading missions built around tide and bait movement."
  }
];

export function getFishDataBySlug(slug: string) {
  return FISH_DATA.find((entry) => entry.slug === slug) ?? null;
}

export function getFishDataByName(name: string) {
  const normalized = normalize(name);
  return FISH_DATA.find((entry) => normalize(entry.commonName) === normalized) ?? null;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
