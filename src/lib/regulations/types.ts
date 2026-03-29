export type RegulationStatus = "in_season" | "out_of_season" | "protected" | "limited" | "unknown";

export type RegulationSummary = {
  regulation_status: RegulationStatus;
  season_note?: string;
  bag_limit_note?: string;
  size_limit_note?: string;
  protected_note?: string;
  gear_rule_note?: string;
  regulation_source: string;
  regulation_source_url?: string;
  regulation_last_checked: string;
};

export function getRegulationStatusLabel(status: RegulationStatus) {
  switch (status) {
    case "in_season":
      return "In season";
    case "out_of_season":
      return "Out of season";
    case "protected":
      return "Protected / no harvest";
    case "limited":
      return "Bag or size limits apply";
    case "unknown":
      return "Verify current rules";
  }
}

export function harvestAllowedForStatus(status: RegulationStatus) {
  return status === "in_season" || status === "limited";
}
