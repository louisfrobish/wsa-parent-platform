import type { WaterType } from "@/lib/fish-of-day/water-type";
import type { RegulationSummary } from "@/lib/regulations/types";

type MarylandFishRegulationInput = {
  fishName: string;
  requestDate: string;
  waterType?: WaterType | string | null;
  locationLabel?: string | null;
};

const MARYLAND_FISHING_GUIDE_URL = "https://www.eregulations.com/maryland/fishing";
const MARYLAND_STRIPED_BASS_NOTICE_URL =
  "https://dnr.maryland.gov/fisheries/pages/sb_Reg_changes.aspx";
const MARYLAND_REGS_LAST_CHECKED = "2026-03-17";

export function getMarylandFishRegulation(input: MarylandFishRegulationInput): RegulationSummary {
  const normalizedName = normalize(input.fishName);
  const waterType = normalizeWaterType(input.waterType, input.locationLabel);
  const month = new Date(`${input.requestDate}T12:00:00`).getMonth() + 1;

  if (normalizedName.includes("striped bass")) {
    return getStripedBassRegulation(waterType);
  }

  if (normalizedName.includes("largemouth bass")) {
    return waterType === "pond" || waterType === "lake"
      ? bassNontidalRegulation(month)
      : bassTidalRegulation();
  }

  if (normalizedName.includes("chain pickerel")) {
    return waterType === "shoreline" || waterType === "tidal"
      ? tidalPickerelRegulation(month)
      : {
          regulation_status: "limited",
          season_note: "Open year-round in nontidal waters.",
          bag_limit_note: "Daily limit: 5 fish.",
          size_limit_note: "Minimum size: 14 inches.",
          regulation_source: "Maryland fishing guide",
          regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
          regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
        };
  }

  if (
    normalizedName.includes("bluegill") ||
    normalizedName.includes("pumpkinseed") ||
    normalizedName.includes("redbreast sunfish")
  ) {
    return {
      regulation_status: "limited",
      season_note: "Open year-round in Maryland freshwater.",
      bag_limit_note: "Daily aggregate limit: 15 sunfish.",
      size_limit_note: "No minimum size listed in the statewide freshwater summary.",
      regulation_source: "Maryland fishing guide",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("black crappie") || normalizedName.includes("white crappie")) {
    return {
      regulation_status: "limited",
      season_note: "Open year-round in Maryland freshwater.",
      bag_limit_note: "Daily aggregate limit: 15 crappie.",
      size_limit_note: "No minimum size listed in the statewide freshwater summary.",
      regulation_source: "Maryland fishing guide",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("channel catfish")) {
    return waterType === "shoreline" || waterType === "tidal" || waterType === "river"
      ? {
          regulation_status: "in_season",
          season_note: "Open year-round in Maryland tidal waters.",
          bag_limit_note: "No statewide Chesapeake catfish creel limit is listed in the summary table.",
          size_limit_note: "No statewide minimum size is listed in the summary table.",
          regulation_source: "Maryland Chesapeake Bay regulations summary",
          regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
          regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
        }
      : {
          regulation_status: "limited",
          season_note: "Open year-round in Maryland freshwater.",
          bag_limit_note: "Daily limit: 5 catfish.",
          size_limit_note: "No minimum size listed in the statewide freshwater summary.",
          regulation_source: "Maryland fishing guide",
          regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
          regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
        };
  }

  if (normalizedName.includes("blue catfish") || normalizedName.includes("flathead catfish")) {
    return {
      regulation_status: "in_season",
      season_note: "Open year-round in Maryland tidal waters.",
      bag_limit_note: "No statewide Chesapeake catfish creel limit is listed in the summary table.",
      size_limit_note: "No statewide minimum size is listed in the summary table.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("white perch")) {
    return {
      regulation_status: "in_season",
      season_note: "Hook-and-line harvest is summarized as open year-round.",
      bag_limit_note: "No creel limit is listed in the statewide Chesapeake summary for hook and line.",
      size_limit_note: "Any size for hook and line in the summary table.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("yellow perch")) {
    return {
      regulation_status: "limited",
      season_note: "Open year-round in the Chesapeake Bay summary.",
      bag_limit_note: "Daily limit: 5 fish.",
      size_limit_note: "Minimum size: 9 inches in the Chesapeake Bay summary.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("atlantic croaker")) {
    return {
      regulation_status: "limited",
      season_note: "Open year-round in the Chesapeake Bay summary.",
      bag_limit_note: "Daily limit: 25 fish.",
      size_limit_note: "Minimum size: 9 inches.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName === "spot" || normalizedName.includes(" spot")) {
    return {
      regulation_status: "limited",
      season_note: "Open year-round in the Chesapeake Bay summary.",
      bag_limit_note: "Daily limit: 50 fish.",
      size_limit_note: "No minimum size listed in the summary table.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  if (normalizedName.includes("american eel")) {
    return {
      regulation_status: month >= 1 && month <= 8 ? "limited" : "out_of_season",
      season_note:
        month >= 1 && month <= 8
          ? "Hook-and-line harvest is open January 1 through August 31 in the Chesapeake Bay summary."
          : "Hook-and-line harvest is outside the January 1 through August 31 Chesapeake Bay summary season.",
      bag_limit_note: "Daily limit: 25 fish in the Chesapeake Bay summary.",
      size_limit_note: "No statewide minimum size listed in the summary table.",
      gear_rule_note: "Check waterbody rules if using gear other than hook and line.",
      regulation_source: "Maryland Chesapeake Bay regulations summary",
      regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  return {
    regulation_status: "unknown",
    season_note: "Regulation status unavailable in this quick guide.",
    protected_note: "Verify current Maryland DNR rules before harvest.",
    regulation_source: "Maryland fishing guide",
    regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
    regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
  };
}

function bassNontidalRegulation(month: number): RegulationSummary {
  const closedHarvest = month >= 3 && month <= 6;
  return {
    regulation_status: closedHarvest ? "out_of_season" : "limited",
    season_note: closedHarvest
      ? "Nontidal bass harvest is closed March 1 through June 15, although catch-and-release is still allowed."
      : "Nontidal bass harvest is open June 16 through the end of February.",
    bag_limit_note: "Daily aggregate limit: 5 black bass.",
    size_limit_note: "Minimum size: 12 inches in nontidal waters.",
    regulation_source: "Maryland freshwater fishing guide",
    regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
    regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
  };
}

function bassTidalRegulation(): RegulationSummary {
  return {
    regulation_status: "limited",
    season_note: "Chesapeake tidal black bass harvest is summarized as open year-round.",
    bag_limit_note: "Daily aggregate limit: 5 black bass.",
    size_limit_note: "Minimum size: 15 inches from March 1 through June 15, then 12 inches the rest of the year.",
    gear_rule_note: "Natural bait is not permitted for black bass in the Chesapeake Bay summary.",
    regulation_source: "Maryland Chesapeake Bay regulations summary",
    regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
    regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
  };
}

function tidalPickerelRegulation(month: number): RegulationSummary {
  const open = month >= 5 || month <= 3;
  return {
    regulation_status: open ? "limited" : "out_of_season",
    season_note: open
      ? "Tidal pickerel harvest is open May 1 through March 14 in the Chesapeake Bay summary."
      : "Tidal pickerel harvest is closed March 15 through April 30 in the Chesapeake Bay summary.",
    bag_limit_note: "Daily limit: 10 fish in the Chesapeake Bay summary.",
    size_limit_note: "Minimum size: 14 inches.",
    regulation_source: "Maryland Chesapeake Bay regulations summary",
    regulation_source_url: MARYLAND_FISHING_GUIDE_URL,
    regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
  };
}

function getStripedBassRegulation(waterType: WaterType | "tidal" | "unknown"): RegulationSummary {
  if (waterType === "shoreline" || waterType === "tidal" || waterType === "river") {
    return {
      regulation_status: "unknown",
      season_note: "Maryland striped bass seasons are notice-driven and can change during the year.",
      bag_limit_note: "Check the current Maryland DNR striped bass notice before harvest.",
      size_limit_note: "Slot and possession rules can change by fishery and season.",
      gear_rule_note: "If using bait in striped bass fisheries, check current circle-hook and fishery-specific rules.",
      regulation_source: "Maryland DNR striped bass notices",
      regulation_source_url: MARYLAND_STRIPED_BASS_NOTICE_URL,
      regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
    };
  }

  return {
    regulation_status: "unknown",
    season_note: "Verify current Maryland and Atlantic striped bass rules before harvest.",
    bag_limit_note: "Check the current Maryland DNR notice for possession rules.",
    size_limit_note: "Slot limits can change by fishery and season.",
    regulation_source: "Maryland DNR striped bass notices",
    regulation_source_url: MARYLAND_STRIPED_BASS_NOTICE_URL,
    regulation_last_checked: MARYLAND_REGS_LAST_CHECKED
  };
}

function normalizeWaterType(waterType?: WaterType | string | null, locationLabel?: string | null) {
  const normalizedType = normalize(waterType ?? "");
  if (normalizedType === "pond" || normalizedType === "lake" || normalizedType === "creek" || normalizedType === "river" || normalizedType === "shoreline" || normalizedType === "tidal") {
    return normalizedType as WaterType | "tidal";
  }

  const normalizedLocation = normalize(locationLabel ?? "");
  if (normalizedLocation.includes("tidal") || normalizedLocation.includes("bay") || normalizedLocation.includes("shoreline") || normalizedLocation.includes("creek mouth")) {
    return "tidal";
  }
  if (normalizedLocation.includes("pond")) return "pond";
  if (normalizedLocation.includes("lake")) return "lake";
  if (normalizedLocation.includes("creek")) return "creek";
  if (normalizedLocation.includes("river")) return "river";
  return "unknown";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
