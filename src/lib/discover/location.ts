import { resolveLocationContext } from "@/lib/context/nearby-spots";

type DiscoveryLocationInput = {
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
};

export type DiscoveryLocationMeta = {
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  regionLabel: string;
  observedNear: string;
};

export function getDiscoveryLocationMeta(input: DiscoveryLocationInput): DiscoveryLocationMeta {
  const resolved = resolveLocationContext({
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    locationLabel: input.locationLabel?.trim() || null,
    radiusMiles: 10
  });

  const regionLabel =
    resolved.source === "coordinates"
      ? deriveRegionLabelFromCoordinates(input.latitude ?? null, input.longitude ?? null)
      : resolved.displayLabel || "Southern Maryland";

  const locationLabel =
    input.locationLabel?.trim() ||
    (resolved.source === "coordinates" ? `Near ${regionLabel}` : resolved.displayLabel || regionLabel);

  return {
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    locationLabel,
    regionLabel,
    observedNear: locationLabel
  };
}

const regionalAnchors = [
  { label: "Leonardtown, MD", latitude: 38.2912, longitude: -76.6355 },
  { label: "Solomons, MD", latitude: 38.3228, longitude: -76.4522 },
  { label: "Lexington Park, MD", latitude: 38.2668, longitude: -76.4513 },
  { label: "Prince Frederick, MD", latitude: 38.5404, longitude: -76.5844 },
  { label: "Charlotte Hall, MD", latitude: 38.4846, longitude: -76.7844 },
  { label: "California, MD", latitude: 38.3004, longitude: -76.5075 }
] as const;

function deriveRegionLabelFromCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return "Southern Maryland";
  }

  const closest = regionalAnchors
    .map((anchor) => ({
      ...anchor,
      distance: distanceMiles(latitude, longitude, anchor.latitude, anchor.longitude)
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!closest || closest.distance > 35) {
    return "Southern Maryland";
  }

  return closest.label;
}

function distanceMiles(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}
