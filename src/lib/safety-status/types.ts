export type EdibilityStatus = "edible" | "not_recommended" | "poisonous" | "toxic" | "unknown";
export type LegalStatus = "legal_to_harvest" | "regulated" | "protected" | "out_of_season" | "unknown";
export type StatusConfidence = "high" | "medium" | "low";

export type SafetyLegalitySummary = {
  edibility_status: EdibilityStatus;
  legal_status: LegalStatus;
  caution_note: string;
  regulation_note: string;
  safety_note: string;
  source_note: string;
  status_confidence: StatusConfidence;
};

export function getEdibilityStatusLabel(status: EdibilityStatus) {
  switch (status) {
    case "edible":
      return "Edible";
    case "not_recommended":
      return "Not recommended for eating";
    case "poisonous":
      return "Poisonous";
    case "toxic":
      return "Toxic";
    case "unknown":
      return "Unknown / verify before use";
  }
}

export function getLegalStatusLabel(status: LegalStatus) {
  switch (status) {
    case "legal_to_harvest":
      return "Legal to harvest";
    case "regulated":
      return "Harvest regulated";
    case "protected":
      return "Protected";
    case "out_of_season":
      return "Out of season";
    case "unknown":
      return "Legal status unknown";
  }
}
