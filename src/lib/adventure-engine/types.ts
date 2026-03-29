import { z } from "zod";

export const adventureCategories = [
  "bird_watch",
  "fishing_trip",
  "trail_tracking",
  "amphibian_search",
  "nature_journal",
  "insect_hunt",
  "plant_identification",
  "weather_observation",
  "map_exploration",
  "diy_nature_project",
  "rainy_day_field_lab"
] as const;

export const energyLevels = ["low", "medium", "high"] as const;
export const gearLevels = ["beginner", "standard", "advanced"] as const;
export const windLevels = ["calm", "light", "breezy", "windy", "strong"] as const;
export const durationModes = ["short", "medium", "extended"] as const;

export type AdventureCategory = (typeof adventureCategories)[number];
export type EnergyLevel = (typeof energyLevels)[number];
export type GearLevel = (typeof gearLevels)[number];
export type WindLevel = (typeof windLevels)[number];
export type DurationMode = (typeof durationModes)[number];

export const adventureEngineRequestSchema = z.object({
  requestDate: z.string().trim().min(1),
  studentId: z.string().uuid().optional(),
  studentName: z.string().trim().min(1).max(80).optional(),
  energyLevel: z.enum(energyLevels).default("medium"),
  availableTimeMinutes: z.coerce.number().int().min(10).max(240).default(45),
  gearLevel: z.enum(gearLevels).default("beginner"),
  rainyDayMode: z.coerce.boolean().default(false),
  preferredHabitatType: z.string().trim().max(60).optional().or(z.literal("")),
  locationLabel: z.string().trim().min(2).max(120).default("Southern Maryland"),
  notesPreferences: z.string().trim().max(240).optional().or(z.literal("")),
  weatherCondition: z.string().trim().max(60).optional().or(z.literal("")),
  temperature: z.coerce.number().int().min(-20).max(120).optional(),
  windLevel: z.enum(windLevels).default("light"),
  precipitationChance: z.coerce.number().int().min(0).max(100).default(20),
  severeWeatherFlag: z.coerce.boolean().default(false),
  currentMonth: z.coerce.number().int().min(1).max(12).optional(),
  currentSeason: z.string().trim().max(20).optional().or(z.literal("")),
  dayOfWeek: z.string().trim().max(20).optional().or(z.literal("")),
  timeOfDay: z.string().trim().max(20).optional().or(z.literal(""))
});

export type AdventureEngineRequest = z.infer<typeof adventureEngineRequestSchema>;

export type AdventureEngineSignals = {
  birdMigrationIntensity: "low" | "medium" | "high";
  fishActivityLevel: "low" | "medium" | "high";
  amphibianActivityLevel: "low" | "medium" | "high";
  insectActivityLevel: "low" | "medium" | "high";
  bloomStage: "dormant" | "emerging" | "active" | "peak" | "fading";
  huntingSeasonAwareness: "low" | "medium" | "high";
};

export type NormalizedAdventureInput = {
  requestDate: string;
  student: {
    id: string | null;
    name: string | null;
    age: number;
    rank: string;
    interests: string[];
    completedAdventuresCount: number;
  };
  session: {
    energyLevel: EnergyLevel;
    availableTimeMinutes: number;
    gearLevel: GearLevel;
    rainyDayMode: boolean;
    preferredHabitatType: string | null;
    locationLabel: string;
    notesPreferences: string | null;
  };
  time: {
    currentMonth: number;
    currentSeason: string;
    dayOfWeek: string;
    timeOfDay: string;
  };
  weather: {
    weatherCondition: string;
    temperature: number | null;
    windLevel: WindLevel;
    precipitationChance: number;
    severeWeatherFlag: boolean;
  };
  signals: AdventureEngineSignals;
};

export type AdventureDecision = {
  selectedCategory: AdventureCategory;
  whyThisCategory: string;
  bestTimeWindow: string;
  suggestedPlaceType: string;
  gearList: string[];
  safetyNote: string;
  durationMode: DurationMode;
  shouldUseRainyDayBackup: boolean;
  contextSummary: string;
  rainyDayBackup: string;
  scoreBreakdown: Array<{
    category: AdventureCategory;
    score: number;
    reasons: string[];
  }>;
};

export const adventureGenerationOutputSchema = z.object({
  adventureTitle: z.string().min(1),
  whatIsHappeningInNature: z.string().min(1),
  whyTodayIsGoodForThis: z.string().min(1),
  missionBrief: z.string().min(1),
  bestTimeWindow: z.string().min(1),
  suggestedPlaceType: z.string().min(1),
  gearChecklist: z.array(z.string().min(1)).min(2).max(10),
  safetyNote: z.string().min(1),
  outdoorMission: z.string().min(1),
  journalPrompt: z.string().min(1),
  discussionQuestion: z.string().min(1),
  quickVersion: z.string().min(1),
  rainyDayBackup: z.string().min(1),
  optionalBonusChallenge: z.string().min(1),
  printableSummary: z.string().min(1)
});

export type AdventureGenerationOutput = z.infer<typeof adventureGenerationOutputSchema>;

export const adventureGenerationOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    adventureTitle: { type: "string" },
    whatIsHappeningInNature: { type: "string" },
    whyTodayIsGoodForThis: { type: "string" },
    missionBrief: { type: "string" },
    bestTimeWindow: { type: "string" },
    suggestedPlaceType: { type: "string" },
    gearChecklist: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 10
    },
    safetyNote: { type: "string" },
    outdoorMission: { type: "string" },
    journalPrompt: { type: "string" },
    discussionQuestion: { type: "string" },
    quickVersion: { type: "string" },
    rainyDayBackup: { type: "string" },
    optionalBonusChallenge: { type: "string" },
    printableSummary: { type: "string" }
  },
  required: [
    "adventureTitle",
    "whatIsHappeningInNature",
    "whyTodayIsGoodForThis",
    "missionBrief",
    "bestTimeWindow",
    "suggestedPlaceType",
    "gearChecklist",
    "safetyNote",
    "outdoorMission",
    "journalPrompt",
    "discussionQuestion",
    "quickVersion",
    "rainyDayBackup",
    "optionalBonusChallenge",
    "printableSummary"
  ]
} as const;
