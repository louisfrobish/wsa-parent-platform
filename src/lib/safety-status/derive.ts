import type { DiscoveryCatalogCategory } from "@/lib/discoveries";
import type { FishOutput } from "@/lib/generations";
import type { IdentifyResponse } from "@/lib/identify";
import type { EdibilityStatus, LegalStatus, SafetyLegalitySummary } from "@/lib/safety-status/types";

type DiscoveryStatusInput = {
  category: string;
  commonName: string;
  confidence?: "low" | "medium" | "high" | string | null;
  safetyNote?: string | null;
  regulationStatus?: string | null;
  seasonNote?: string | null;
  bagLimitNote?: string | null;
  sizeLimitNote?: string | null;
  protectedNote?: string | null;
  regulationSource?: string | null;
};

export function deriveDiscoverySafetyStatus(result: IdentifyResponse): SafetyLegalitySummary {
  return deriveSafetyStatusFromInput({
    category: result.category,
    commonName: result.possible_identification,
    confidence: result.confidence_level,
    safetyNote: result.safety_note,
    regulationStatus: result.regulation_status,
    seasonNote: result.season_note,
    bagLimitNote: result.bag_limit_note,
    sizeLimitNote: result.size_limit_note,
    protectedNote: result.protected_note,
    regulationSource: result.regulation_source
  });
}

export function deriveCatalogSafetyStatus(input: {
  category: DiscoveryCatalogCategory;
  commonName: string;
  result: Record<string, unknown>;
  confidence: "low" | "medium" | "high";
}): SafetyLegalitySummary {
  return deriveSafetyStatusFromInput({
    category: input.category,
    commonName: input.commonName,
    confidence: input.confidence,
    safetyNote: typeof input.result.safety_note === "string" ? input.result.safety_note : null,
    regulationStatus: typeof input.result.regulation_status === "string" ? input.result.regulation_status : null,
    seasonNote: typeof input.result.season_note === "string" ? input.result.season_note : null,
    bagLimitNote: typeof input.result.bag_limit_note === "string" ? input.result.bag_limit_note : null,
    sizeLimitNote: typeof input.result.size_limit_note === "string" ? input.result.size_limit_note : null,
    protectedNote: typeof input.result.protected_note === "string" ? input.result.protected_note : null,
    regulationSource: typeof input.result.regulation_source === "string" ? input.result.regulation_source : null
  });
}

export function deriveFishBriefingSafetyStatus(output: FishOutput): SafetyLegalitySummary {
  const legalStatus = mapRegulationStatus(output.regulationStatus);
  const edibleStatus: EdibilityStatus = legalStatus === "protected" || legalStatus === "out_of_season" ? "not_recommended" : "edible";

  return {
    edibility_status: edibleStatus,
    legal_status: legalStatus,
    caution_note:
      legalStatus === "protected" || legalStatus === "out_of_season"
        ? "This fish can still be studied, but harvest guidance needs extra caution today."
        : "Good eating quality does not replace the need to follow current Maryland rules.",
    regulation_note: [output.seasonNote, output.bagLimitNote, output.sizeLimitNote].filter(Boolean).join(" "),
    safety_note:
      legalStatus === "protected" || legalStatus === "out_of_season"
        ? "Check Maryland regulations before keeping fish, and treat this page as educational guidance first."
        : "Verify local waterbody rules, size limits, and advisories before keeping fish.",
    source_note: output.regulationSource,
    status_confidence: output.regulationStatus === "unknown" ? "low" : "medium"
  };
}

function deriveSafetyStatusFromInput(input: DiscoveryStatusInput): SafetyLegalitySummary {
  const category = normalizeCategory(input.category);
  const commonName = normalize(input.commonName);
  const safetyNote = input.safetyNote?.trim() || "";
  const confidence = input.confidence === "high" || input.confidence === "medium" || input.confidence === "low" ? input.confidence : "low";
  const legalStatus = mapRegulationStatus(input.regulationStatus);

  if (category === "mushroom") {
    const edibleStatus = inferMushroomEdibility(commonName, safetyNote, confidence);
    return {
      edibility_status: edibleStatus,
      legal_status: legalStatus,
      caution_note: "Do not eat mushrooms based on app identification alone.",
      regulation_note: input.protectedNote || "Legal harvest status may vary by location. Verify rules before collecting.",
      safety_note: "Consult a qualified expert before consuming any wild mushroom.",
      source_note: input.regulationSource || "WSA mushroom safety layer",
      status_confidence: confidence === "high" && edibleStatus === "poisonous" ? "medium" : "low"
    };
  }

  if (category === "fish" || isShellfish(commonName)) {
    const edibilityStatus: EdibilityStatus = isShellfish(commonName)
      ? "unknown"
      : legalStatus === "protected" || legalStatus === "out_of_season"
        ? "not_recommended"
        : "edible";

    return {
      edibility_status: edibilityStatus,
      legal_status: legalStatus,
      caution_note: isShellfish(commonName)
        ? "Verify local shellfish harvest rules and health advisories before collecting or eating."
        : "Check size, season, and waterbody rules before harvest.",
      regulation_note: [input.seasonNote, input.bagLimitNote, input.sizeLimitNote, input.protectedNote].filter(Boolean).join(" "),
      safety_note:
        legalStatus === "protected" || legalStatus === "out_of_season"
          ? "Educational identification only until current harvest rules are confirmed."
          : "Fishing regulations and advisories still matter even when a species is commonly edible.",
      source_note: input.regulationSource || "Maryland harvest guidance layer",
      status_confidence: legalStatus === "unknown" ? "low" : "medium"
    };
  }

  if (category === "plant" || category === "tree") {
    return inferPlantStatus(commonName, safetyNote, confidence);
  }

  return {
    edibility_status: "unknown",
    legal_status: legalStatus,
    caution_note: "This app is for field learning first. Verify before handling, harvesting, or eating.",
    regulation_note: input.protectedNote || input.seasonNote || "Legal harvest status may vary by species and location.",
    safety_note: safetyNote || "Use caution and compare with trusted local field guides before making decisions.",
    source_note: input.regulationSource || "WSA safety layer",
    status_confidence: "low"
  };
}

function inferMushroomEdibility(commonName: string, safetyNote: string, confidence: "low" | "medium" | "high"): EdibilityStatus {
  if (containsAny(commonName, ["death cap", "destroying angel", "jack-o'-lantern", "false morel"])) return "poisonous";
  if (containsAny(safetyNote, ["poison", "toxic"])) return containsAny(safetyNote, ["poison"]) ? "poisonous" : "toxic";
  if (confidence !== "high") return "unknown";
  if (containsAny(commonName, ["chicken of the woods", "morel", "hen of the woods"])) return "not_recommended";
  return "unknown";
}

function inferPlantStatus(commonName: string, safetyNote: string, confidence: "low" | "medium" | "high"): SafetyLegalitySummary {
  let edibilityStatus: EdibilityStatus = "unknown";

  if (containsAny(commonName, ["holly", "pokeweed", "poison ivy", "nightshade"])) {
    edibilityStatus = "toxic";
  } else if (containsAny(commonName, ["milkweed", "wild onion", "serviceberry"]) && confidence === "high") {
    edibilityStatus = "not_recommended";
  } else if (containsAny(safetyNote, ["toxic", "poison"])) {
    edibilityStatus = containsAny(safetyNote, ["poison"]) ? "poisonous" : "toxic";
  }

  return {
    edibility_status: edibilityStatus,
    legal_status: "unknown",
    caution_note: "Do not consume wild plants based on app identification alone.",
    regulation_note: "If the plant is on protected land or part of a protected species, harvesting may still be restricted.",
    safety_note: safetyNote || "Wild plants can have toxic look-alikes, irritating sap, or unsafe preparation needs.",
    source_note: "WSA plant safety layer",
    status_confidence: edibilityStatus === "unknown" ? "low" : confidence === "high" ? "medium" : "low"
  };
}

function mapRegulationStatus(status?: string | null): LegalStatus {
  switch (status) {
    case "in_season":
      return "legal_to_harvest";
    case "limited":
      return "regulated";
    case "protected":
      return "protected";
    case "out_of_season":
      return "out_of_season";
    default:
      return "unknown";
  }
}

function normalizeCategory(category: string) {
  const value = normalize(category);
  if (value === "mushrooms") return "mushroom";
  if (value === "plants") return "plant";
  if (value === "trees") return "tree";
  if (value === "fish") return "fish";
  return value;
}

function isShellfish(name: string) {
  return containsAny(name, ["oyster", "clam", "mussel", "scallop", "crab", "shrimp"]);
}

function containsAny(value: string, needles: string[]) {
  const normalizedValue = normalize(value);
  return needles.some((needle) => normalizedValue.includes(normalize(needle)));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
