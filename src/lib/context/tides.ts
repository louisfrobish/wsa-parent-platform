import type { ResolvedLocationContext } from "@/lib/context/nearby-spots";

export type TideSummary = {
  locationLabel: string;
  hasTideData: boolean;
  summary: string;
  highTides: string[];
  lowTides: string[];
  sourceLabel: string;
};

export function getTideSummary(requestDate: string, location: ResolvedLocationContext): TideSummary {
  const coastal = /(southern maryland|solomons|lexington park|california|leonardtown)/i.test(location.displayLabel);

  if (!coastal) {
    return {
      locationLabel: location.displayLabel,
      hasTideData: false,
      summary: "Tide timing is not a major planning factor for this inland briefing.",
      highTides: [],
      lowTides: [],
      sourceLabel: "WSA regional tide estimate"
    };
  }

  const date = new Date(`${requestDate}T12:00:00`);
  const day = date.getDate();
  const offset = day % 4;
  const highTides = [formatHour(6 + offset), formatHour(18 + offset)];
  const lowTides = [formatHour(0 + offset), formatHour(12 + offset)];

  return {
    locationLabel: location.displayLabel,
    hasTideData: true,
    summary: "Tides matter most for shoreline walks, fishing access, marsh edges, and bird-rich tidal stops.",
    highTides,
    lowTides,
    sourceLabel: "WSA regional tide estimate"
  };
}

function formatHour(hour24: number) {
  const normalized = ((hour24 % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12}:00 ${suffix}`;
}
