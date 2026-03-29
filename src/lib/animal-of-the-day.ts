import type { SupabaseClient } from "@supabase/supabase-js";
import { ANIMAL_SPECIES, describeAnimalSeasonality, findAnimalSpeciesByName } from "@/lib/animal-species";
import { getAnimalHabitatRecommendation } from "@/lib/context/animal-habitat";
import { getEnvironmentalContext } from "@/lib/context/engine";
import { createOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { animalOutputJsonSchema, animalOutputSchema, type AnimalOutput, type GenerationRecord } from "@/lib/generations";
import { saveGeneration } from "@/lib/generation-store";
import { buildSpeciesGallery, resolveSpeciesPhoto } from "@/lib/species-photo";
import { buildWhyFitsToday, deriveDailyWeatherSignals, pickWeatherAwareSpecies } from "@/lib/weather-aware-species";

type AnimalBriefingInput = {
  animalName: string;
  childAge?: number;
  studentId?: string;
  studentName?: string;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
  radiusMiles: number;
  weatherCondition: string;
  requestDate?: string;
  householdMode?: boolean;
};

type GenerateAnimalBriefingInput = {
  supabase: SupabaseClient;
  userId: string;
  input: AnimalBriefingInput;
  save?: boolean;
};

type BackyardMissionBlueprint = {
  title: string;
  objective: string;
  steps: string[];
  materials: string[];
  scienceTieIn: string;
};

export async function generateAnimalBriefing({
  supabase,
  userId,
  input,
  save = true
}: GenerateAnimalBriefingInput): Promise<{ output: AnimalOutput; generation: GenerationRecord | null }> {
  const requestDate = input.requestDate ?? new Date().toISOString().slice(0, 10);
  const environmental = await getEnvironmentalContext(supabase, {
    requestDate,
    locationLabel: input.locationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMiles: input.radiusMiles,
    weatherCondition: input.weatherCondition
  });
  const signals = deriveDailyWeatherSignals(environmental);
  const selectedAnimal =
    input.animalName.toLowerCase() === "surprise me"
      ? pickWeatherAwareSpecies(ANIMAL_SPECIES, requestDate, signals, "animal")
      : findAnimalSpeciesByName(input.animalName);
  const animalName = selectedAnimal?.commonName ?? (input.animalName.toLowerCase() === "surprise me" ? "a fitting surprise animal" : input.animalName);
  const seasonalReason = selectedAnimal
    ? buildWhyFitsToday(describeAnimalSeasonality(selectedAnimal, requestDate), signals, selectedAnimal.regionalNotes)
    : "Choose a realistic animal that makes sense for the season, region, and nearby habitat today.";
  const prompt = [
    "You are creating an Animal of the Day card for homeschool families.",
    input.householdMode
      ? "This is a household-level briefing for the whole family, so keep it broad, practical, and parent-friendly."
      : "Keep the explanation age-appropriate for the named student when that context is provided.",
    "Use plain language, be practical for parents, outdoors-friendly, and concise but useful.",
    "kidChallenge must be a Backyard Mission, not a passive observation task.",
    "A Backyard Mission must always use this structure in order: Title, Objective, Build/Action Steps, Materials, Science Tie-In.",
    "The Backyard Mission must be hands-on, start immediately, use only common household or backyard items, fit a normal suburban backyard, and never require finding a wild animal.",
    "Choose only from these Backyard Mission categories: Habitat Building, Simple Experiments, Animal Attraction, Nature Engineering, Gardening.",
    "drawingPrompt should be a short creative Challenge Activity, not another mission plan.",
    "Also create one short Facebook-ready caption for Wild Stallion Academy that sounds warm, adventurous, educational, and family-friendly.",
    input.childAge ? `Child age focus: ${input.childAge}` : "No single child age is provided, so write for the household.",
    `Requested animal: ${animalName}`,
    `Seasonal fit note: ${seasonalReason}`,
    `Location focus: ${input.locationLabel}`,
    `Weather: ${input.weatherCondition}`,
    "Use the seasonal fit note as real selection context, not as decoration.",
    "Return short, helpful sections that a parent can read quickly and use today, including the facebook caption."
  ].join("\n");

  const openai = createOpenAIClient();
  const response = await openai.responses.create({
    model: getOpenAIModel(),
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "animal_of_the_day",
        schema: animalOutputJsonSchema
      }
    }
  });

  const baseOutput = animalOutputSchema.parse(JSON.parse(response.output_text));
  const habitatRecommendation = await getAnimalHabitatRecommendation(supabase, {
    animalName,
    habitatText: selectedAnimal?.habitat ?? baseOutput.habitat,
    requestDate,
    locationLabel: input.locationLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMiles: input.radiusMiles,
    weatherCondition: input.weatherCondition
  });
  const guideImageUrl = selectedAnimal?.imageUrl ?? getAnimalImage(baseOutput.animalName);
  const guideImageAlt = selectedAnimal?.imageAlt ?? `${animalName} field-guide illustration`;
  const speciesPhoto = await resolveSpeciesPhoto({
    commonName: animalName,
    scientificName: selectedAnimal?.scientificName,
    fallbackImageUrl: guideImageUrl,
    fallbackImageAlt: guideImageAlt,
    guideImageUrl,
    guideImageAlt,
    photoLabel: animalName
  });

  const output = animalOutputSchema.parse({
    ...baseOutput,
    animalName,
    scientificName: selectedAnimal?.scientificName,
    imageUrl: speciesPhoto.imageUrl,
    imageAlt: speciesPhoto.imageAlt,
    guideImageUrl: speciesPhoto.guideImageUrl,
    guideImageAlt: speciesPhoto.guideImageAlt,
    quickIdTip: `Quick ID tip: ${baseOutput.tracksAndSign}`,
    photoSource: speciesPhoto.photoSource,
    images: buildSpeciesGallery({
      category: "animal",
      slug: selectedAnimal?.slug ?? animalName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      commonName: animalName,
      heroImageUrl: speciesPhoto.imageUrl,
      heroImageAlt: speciesPhoto.imageAlt
    }),
    printableSummary: `${animalName} fits today because ${buildWhyFitsToday(selectedAnimal?.whyToday ?? "the season, habitat, and family-friendly observation value line up well", signals)} ${baseOutput.printableSummary}`.trim(),
    habitat: selectedAnimal?.habitat ?? baseOutput.habitat,
    kidChallenge: formatBackyardMission(
      buildBackyardMission({
        animalName,
        habitat: selectedAnimal?.habitat ?? baseOutput.habitat,
        diet: baseOutput.diet,
        tracksAndSign: baseOutput.tracksAndSign
      })
    ),
    drawingPrompt: buildChallengeActivity({
      animalName,
      basePrompt: baseOutput.drawingPrompt,
      tracksAndSign: baseOutput.tracksAndSign
    }),
    bestTimeWindow: habitatRecommendation.bestTimeWindow,
    bestNearbyPlaceType: habitatRecommendation.bestNearbyPlaceType,
    likelyHabitatType: habitatRecommendation.likelyHabitatType,
    whyThisPlaceFits: `${habitatRecommendation.whyThisPlaceFits} ${selectedAnimal?.regionalNotes ?? ""}`.trim(),
    whatToBring: habitatRecommendation.whatToBring,
    recommendedNearbySpots: habitatRecommendation.recommendedNearbySpots,
    safetyNote: `${baseOutput.safetyNote} ${habitatRecommendation.safetyNote}`.trim()
  });

  if (!save) {
    return { output, generation: null };
  }

  const generation = (await saveGeneration({
    supabase,
    userId,
    studentId: input.studentId,
    toolType: "animal_of_the_day",
    title: output.animalName,
    inputJson: {
      ...input,
      requestDate,
      audience: input.householdMode ? "household" : "student"
    },
    outputJson: output
  })) as GenerationRecord;

  return { output, generation };
}

function getAnimalImage(animalName: string) {
  const text = animalName.toLowerCase();
  if (/(dragonfly|damselfly)/.test(text)) return "/field-guide/dragonflies.png";
  if (/(frog|toad|salamander)/.test(text)) return "/field-guide/frogs.png";
  if (/(turtle|terrapin)/.test(text)) return "/field-guide/turtles.png";
  if (/(track|fox|deer|squirrel|mammal|otter|raccoon)/.test(text)) return "/field-guide/mammals.png";
  return "/field-guide/mammals.png";
}

function buildBackyardMission(input: {
  animalName: string;
  habitat: string;
  diet: string;
  tracksAndSign: string;
}): BackyardMissionBlueprint {
  const text = `${input.animalName} ${input.habitat} ${input.diet} ${input.tracksAndSign}`.toLowerCase();

  if (/(turtle|terrapin|frog|toad|salamander|amphibian|reptile)/.test(text)) {
    return {
      title: "Build a Cool Critter Hideout",
      objective: "Create a shaded backyard shelter that shows how cool cover helps small animals stay safe.",
      steps: [
        "Pick a quiet shady corner of the yard or garden edge.",
        "Lean sticks into a low arch to make a small hideout.",
        "Layer leaves or grass clippings on top for shade.",
        "Set a shallow dish of water nearby with one rock inside.",
        "Touch the sunny side and shady side to compare which spot stays cooler."
      ],
      materials: ["sticks", "leaves or grass clippings", "shallow container", "water", "small rock"],
      scienceTieIn: "Many reptiles and amphibians need cool, damp cover so they do not overheat. Shade, shelter, and water change the tiny habitat right away."
    };
  }

  if (/(bird|owl|hawk|woodpecker|songbird|robin|sparrow|blue jay|cardinal)/.test(text)) {
    return {
      title: "Build a Backyard Bird Rest Stop",
      objective: "Set up a simple landing and water station that shows what makes a yard useful to birds.",
      steps: [
        "Choose a spot that is easy to see but not right beside a busy door.",
        "Place a shallow dish or plant saucer on level ground.",
        "Add a few stones so the water dish has safe standing spots.",
        "Stick two or three twigs upright nearby as tiny lookout perches.",
        "Step back and notice whether sun, shade, and cover make the spot feel safe."
      ],
      materials: ["shallow dish or plant saucer", "water", "small stones", "twigs"],
      scienceTieIn: "Birds look for water, quick perch spots, and a fast escape route. Small changes in a yard can make a place feel more usable right away."
    };
  }

  if (/(dragonfly|damselfly|bee|butterfly|moth|pollinator|insect)/.test(text)) {
    return {
      title: "Start a Pollinator Landing Zone",
      objective: "Build a sunny backyard station that shows why insects care about water, color, and landing space.",
      steps: [
        "Place a tray, plate, or saucer in a sunny patch of the yard.",
        "Add pebbles and pour in a little water so dry landing spots stay above the surface.",
        "Scatter flower petals, clover, or leafy stems around the edge.",
        "Lay two sticks across the top as landing rails.",
        "Compare the sunny setup with a shady spot and decide which would warm up faster."
      ],
      materials: ["saucer or plate", "pebbles", "water", "flower petals or clover", "sticks"],
      scienceTieIn: "Pollinators use warmth, color, and shallow water to fuel movement. A small landing zone helps kids test how insects read a habitat."
    };
  }

  if (/(squirrel|fox|deer|rabbit|raccoon|mammal)/.test(text)) {
    return {
      title: "Build a Backyard Cover Tunnel",
      objective: "Create a low cover path that shows why small animals move where they feel hidden.",
      steps: [
        "Choose a fence line, bush edge, or corner of the yard.",
        "Lay two short rows of sticks about a hand-width apart.",
        "Bridge the rows with more sticks to make a low tunnel.",
        "Cover part of the top with leaves so one end feels darker than the other.",
        "Roll a pinecone or acorn past both ends and decide which side feels safer for a quick animal dash."
      ],
      materials: ["sticks", "leaves", "pinecone or acorn"],
      scienceTieIn: "Many backyard mammals travel where cover breaks up their outline. Even a tiny tunnel shows how shade and shelter can change movement choices."
    };
  }

  return {
    title: "Build a Mini Habitat Test Patch",
    objective: "Create a tiny backyard habitat and test which materials hold water, shade, and cover best.",
    steps: [
      "Mark two small squares of bare ground or use two trays.",
      "Fill one with leaves and sticks and the other with pebbles and dry soil.",
      "Pour the same splash of water onto both spots.",
      "Check which one stays damp, cool, or covered longer.",
      "Choose the better habitat patch and add one more improvement."
    ],
    materials: ["leaves", "sticks", "pebbles", "soil", "water", "two small trays if needed"],
    scienceTieIn: "Backyard habitats work because materials change temperature, moisture, and shelter. Testing two setups helps kids see habitat engineering in action."
  };
}

function formatBackyardMission(mission: BackyardMissionBlueprint) {
  return [
    `Backyard Mission`,
    `Title: ${mission.title}`,
    `Objective: ${mission.objective}`,
    "Build/Action Steps:",
    ...mission.steps.slice(0, 5).map((step) => `- ${step}`),
    `Materials: ${mission.materials.join(", ")}`,
    `Science Tie-In: ${mission.scienceTieIn}`
  ].join("\n");
}

function buildChallengeActivity(input: {
  animalName: string;
  basePrompt: string;
  tracksAndSign: string;
}) {
  const fallback = `Challenge Activity: Make one quick field-guide sign for ${input.animalName} that shows the best clue to watch for: ${input.tracksAndSign}.`;
  const normalized = input.basePrompt.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  if (/^challenge activity:/i.test(normalized)) return normalized;
  return `Challenge Activity: ${normalized}`;
}
