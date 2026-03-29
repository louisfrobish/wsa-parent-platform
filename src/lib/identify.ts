import { z } from "zod";

export const discoverCategoryValues = ["animal", "bug", "tree", "bird", "fish", "plant", "mushroom"] as const;
export const discoverCategorySchema = z.enum(discoverCategoryValues);
export type DiscoverCategory = z.infer<typeof discoverCategorySchema>;

export const discoverCategoryOptions: Array<{
  value: DiscoverCategory;
  label: string;
  shortDescription: string;
  promptFocus: string[];
}> = [
  {
    value: "animal",
    label: "Animal",
    shortDescription: "Best for mammals, reptiles, amphibians, and general wildlife finds.",
    promptFocus: [
      "Focus on body shape, habitat fit, movement clues, and practical wildlife observation."
    ]
  },
  {
    value: "bird",
    label: "Bird",
    shortDescription: "Emphasize plumage, beak shape, wing shape, posture, and behavior clues.",
    promptFocus: [
      "Prioritize field marks like plumage pattern, beak shape, body shape, and wing shape.",
      "Include one behavior, listening, or habitat clue families can notice next."
    ]
  },
  {
    value: "bug",
    label: "Bug",
    shortDescription: "Emphasize wing pattern, color, body segments, host plants, and insect clues.",
    promptFocus: [
      "Prioritize wing pattern, color, shape, body segments, and insect-family clues.",
      "Include one nectar plant, host plant, or habitat observation idea when practical."
    ]
  },
  {
    value: "tree",
    label: "Tree",
    shortDescription: "Emphasize leaves, bark, buds, seeds, and tree-form clues.",
    promptFocus: [
      "Prioritize leaf shape, bark, buds, seeds, and plant/tree clues.",
      "Include one bark, seed, or seasonal clue when practical."
    ]
  },
  {
    value: "fish",
    label: "Fish",
    shortDescription: "Emphasize body shape, fin placement, color pattern, and water habitat.",
    promptFocus: [
      "Prioritize body shape, fin placement, mouth shape, and water habitat clues.",
      "Include one shoreline, pond, creek, or water-type observation idea when practical."
    ]
  },
  {
    value: "plant",
    label: "Plant",
    shortDescription: "Emphasize flowers, leaves, growth form, and seasonal plant clues.",
    promptFocus: [
      "Prioritize flowers, leaves, stems, growth form, and nearby habitat clues.",
      "Include one seasonal or pollinator-related observation idea when practical."
    ]
  },
  {
    value: "mushroom",
    label: "Mushroom",
    shortDescription: "Emphasize cap, gills, stem, growth surface, and strong safety language.",
    promptFocus: [
      "Prioritize cap shape, gills or pores, stem details, and growth surface clues.",
      "Always include strong caution that image ID is not enough to judge edibility."
    ]
  }
];

export const identifyBaseResponseSchema = z.object({
  possible_identification: z.string().min(1),
  scientific_name: z.string(),
  confidence_level: z.enum(["low", "medium", "high"]),
  category: z.string().min(1),
  key_features: z.array(z.string().min(1)).min(3).max(6),
  look_alikes: z.array(z.string().min(1)).max(4),
  safety_note: z.string().min(1),
  wsa_observation_challenge: z.string().min(1),
  journal_prompt: z.string().min(1),
  facebook_caption: z.string().min(1)
});

export const identifyResponseSchema = identifyBaseResponseSchema.extend({
  observed_near: z.string().min(1),
  region_label: z.string().min(1),
  regional_plausibility: z.enum(["likely_local", "possible_but_uncommon", "low_regional_confidence", "unknown"]),
  regional_plausibility_note: z.string().min(1),
  local_look_alikes: z.array(z.string().min(1)).max(4),
  taxonomy_hierarchy: z
    .object({
      kingdom: z.string().optional(),
      phylum: z.string().optional(),
      className: z.string().optional(),
      order: z.string().optional(),
      family: z.string().optional(),
      genus: z.string().optional(),
      species: z.string().optional()
    })
    .optional(),
  taxonomy_source: z.string().optional(),
  range_summary: z.string().optional(),
  regionally_prioritized: z.boolean().optional(),
  water_type: z.string().optional(),
  best_bait: z.string().optional(),
  best_lures: z.array(z.string().min(1)).optional(),
  best_cooking_methods: z.array(z.string().min(1)).optional(),
  flavor_profile: z.string().optional(),
  preparation_tips: z.string().optional(),
  best_season: z.string().optional(),
  wsa_angler_tip: z.string().optional(),
  regulation_status: z.enum(["in_season", "out_of_season", "protected", "limited", "unknown"]).optional(),
  season_note: z.string().optional(),
  bag_limit_note: z.string().optional(),
  size_limit_note: z.string().optional(),
  protected_note: z.string().optional(),
  gear_rule_note: z.string().optional(),
  regulation_source: z.string().optional(),
  regulation_source_url: z.string().optional(),
  regulation_last_checked: z.string().optional()
});

export type IdentifyResponse = z.infer<typeof identifyResponseSchema>;

export const identifyResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    possible_identification: { type: "string" },
    scientific_name: { type: "string" },
    confidence_level: { type: "string", enum: ["low", "medium", "high"] },
    category: { type: "string" },
    key_features: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 6
    },
    look_alikes: {
      type: "array",
      items: { type: "string" },
      maxItems: 4
    },
    safety_note: { type: "string" },
    wsa_observation_challenge: { type: "string" },
    journal_prompt: { type: "string" },
    facebook_caption: { type: "string" }
  },
  required: [
    "possible_identification",
    "scientific_name",
    "confidence_level",
    "category",
    "key_features",
    "look_alikes",
    "safety_note",
    "wsa_observation_challenge",
    "journal_prompt",
    "facebook_caption"
  ]
} as const;
