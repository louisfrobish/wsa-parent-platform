import type { WaterType } from "@/lib/fish-of-day/water-type";

export type BaitTackleAdvice = {
  bestBeginnerBait: string;
  optionalLure: string;
  basicTackleSuggestion: string;
  whyItFitsToday: string;
};

export function getBaitAndTackleAdvice(waterType: WaterType): BaitTackleAdvice {
  switch (waterType) {
    case "pond":
      return {
        bestBeginnerBait: "Nightcrawler pieces or live worms under a bobber",
        optionalLure: "Small soft plastic worm or compact spinner",
        basicTackleSuggestion: "Light spinning rod, small hooks, bobber, and a simple split-shot setup",
        whyItFitsToday: "Pond outings reward simple, forgiving tackle that works around weeds, shade, and easy family casting lanes."
      };
    case "lake":
      return {
        bestBeginnerBait: "Worms or small live bait fished near cover",
        optionalLure: "Small spinnerbait or medium soft plastic on a light jig head",
        basicTackleSuggestion: "Medium-light spinning setup with a few bobber and soft-plastic options",
        whyItFitsToday: "Lake water often gives families a choice between shallow cover and slightly deeper edges, so a versatile spinning setup helps."
      };
    case "creek":
      return {
        bestBeginnerBait: "Small worms or natural bait drifted gently through slow pockets",
        optionalLure: "Tiny inline spinner or very small jig",
        basicTackleSuggestion: "Light line, small hooks, and a compact spinning rod that is easy to manage on narrow banks",
        whyItFitsToday: "Creek water usually favors lighter presentations and a slower, more careful approach around pools and current breaks."
      };
    case "river":
      return {
        bestBeginnerBait: "Cut bait, worms, or sturdy live bait that can hold in moving water",
        optionalLure: "Heavier spinner or jig that stays useful in current",
        basicTackleSuggestion: "Medium spinning rod with slightly heavier terminal tackle for current and bottom contact",
        whyItFitsToday: "River outings need tackle that handles current better and keeps bait where fish can notice it instead of washing it away too quickly."
      };
    case "shoreline":
      return {
        bestBeginnerBait: "Shrimp, bloodworm-style bait, or small cut bait on a simple bottom rig",
        optionalLure: "Spoon, casting jig, or small paddletail for tidal edges",
        basicTackleSuggestion: "Medium spinning setup with bottom rigs or simple tidal bait presentations",
        whyItFitsToday: "Tidal shoreline fishing is more believable with bait or rigs that stay useful around moving water, baitfish, and changing wind exposure."
      };
  }
}
