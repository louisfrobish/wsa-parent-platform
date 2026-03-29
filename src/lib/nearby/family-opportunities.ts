import { getSpotMapUrl, milesBetweenPoints, type ResolvedLocationContext } from "@/lib/context/nearby-spots";

export type FamilyOpportunity = {
  id: string;
  title: string;
  type: "museum" | "landmark" | "library_event" | "nature_center";
  locationLabel: string;
  reason: string;
  distanceMiles: number | null;
  mapUrl: string;
};

const OPPORTUNITIES = [
  {
    id: "calvert-marine-museum",
    title: "Calvert Marine Museum",
    type: "museum",
    locationLabel: "Solomons, MD",
    latitude: 38.3215,
    longitude: -76.4519,
    reason: "A strong fit for families blending local history, Chesapeake Bay ecology, and marine life."
  },
  {
    id: "patuxent-river-naval-air-museum",
    title: "Patuxent River Naval Air Museum",
    type: "museum",
    locationLabel: "Lexington Park, MD",
    latitude: 38.2537,
    longitude: -76.4522,
    reason: "Useful for family week plans that connect Maryland history, engineering, and place-based learning."
  },
  {
    id: "st-clements-island-museum",
    title: "St. Clements Island Museum",
    type: "museum",
    locationLabel: "Coltons Point, MD",
    latitude: 38.2402,
    longitude: -76.744,
    reason: "A good local history stop when the family wants a shoreline-and-settlement connection."
  },
  {
    id: "point-lookout-state-park",
    title: "Point Lookout Historic Area",
    type: "landmark",
    locationLabel: "Scotland, MD",
    latitude: 38.0417,
    longitude: -76.3274,
    reason: "Strong for families wanting Civil War history, shoreline habitat, and bird-rich outdoor time in one outing."
  },
  {
    id: "jefferson-patterson-park",
    title: "Jefferson Patterson Park and Museum",
    type: "landmark",
    locationLabel: "St. Leonard, MD",
    latitude: 38.4045,
    longitude: -76.5122,
    reason: "Blends archaeology, trails, and local history in a way that works well for mixed-age family days."
  },
  {
    id: "greenwell-state-park",
    title: "Greenwell Foundation Nature Center",
    type: "nature_center",
    locationLabel: "Hollywood, MD",
    latitude: 38.345,
    longitude: -76.5445,
    reason: "A calm family-friendly nature stop with trails, shoreline access, and room for simple outdoor learning."
  },
  {
    id: "county-library-calendar",
    title: "County Library Family Calendar",
    type: "library_event",
    locationLabel: "Southern Maryland libraries",
    latitude: null,
    longitude: null,
    reason: "A practical backup for Family Week planning when you want a low-friction educational outing or storytime."
  }
] as const;

export function getNearbyFamilyOpportunities(location: ResolvedLocationContext) {
  return OPPORTUNITIES.map((item) => {
    const distanceMiles =
      location.latitude !== null && item.latitude !== null && location.longitude !== null && item.longitude !== null
        ? Math.round(milesBetweenPoints(location.latitude, location.longitude, item.latitude, item.longitude)! * 10) / 10
        : null;

    return {
      id: item.id,
      title: item.title,
      type: item.type,
      locationLabel: item.locationLabel,
      reason: item.reason,
      distanceMiles,
      mapUrl:
        item.latitude !== null && item.longitude !== null
          ? getSpotMapUrl({
              name: item.title,
              latitude: item.latitude,
              longitude: item.longitude,
              location_label: item.locationLabel
            })
          : "https://www.google.com/maps/search/?api=1&query=Southern+Maryland+Library+Events"
    } satisfies FamilyOpportunity;
  })
    .sort((left, right) => {
      if (left.distanceMiles === null) return 1;
      if (right.distanceMiles === null) return -1;
      return left.distanceMiles - right.distanceMiles;
    })
    .slice(0, 4);
}
