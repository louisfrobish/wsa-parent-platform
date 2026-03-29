export type BirdContext = {
  migrationLevel: "low" | "moderate" | "high";
  migrationSummary: string;
  birdingRelevance: string;
  likelyHotspotType: string;
  sourceLabel: string;
  referenceUrl: string;
};

export function getBirdMigrationContext(requestDate: string, locationLabel: string) {
  const month = new Date(`${requestDate}T12:00:00`).getMonth() + 1;

  if ([4, 5, 9, 10].includes(month)) {
    return {
      migrationLevel: "high",
      migrationSummary: "Seasonal migration is likely more active right now, especially around shoreline, marsh, and wooded stopover habitat.",
      birdingRelevance: "Bird-focused recommendations deserve extra weight today.",
      likelyHotspotType: "shoreline, marsh edge, or wooded stopover habitat",
      sourceLabel: "BirdCast seasonal context",
      referenceUrl: `https://birdcast.info/migration-tools/migration-dashboard/`
    } satisfies BirdContext;
  }

  if ([3, 6, 8, 11].includes(month)) {
    return {
      migrationLevel: "moderate",
      migrationSummary: "Migration-style movement may still be relevant, but local habitat quality matters more than peak movement.",
      birdingRelevance: "Birding can still be productive with good habitat and timing.",
      likelyHotspotType: "wooded edge, pond, or shoreline habitat",
      sourceLabel: "BirdCast seasonal context",
      referenceUrl: `https://birdcast.info/migration-tools/migration-dashboard/`
    } satisfies BirdContext;
  }

  return {
    migrationLevel: "low",
    migrationSummary: `Migration pressure is likely lower right now around ${locationLabel}, so local food, cover, and water matter more than movement peaks.`,
    birdingRelevance: "Habitat and time of day matter more than migration context today.",
    likelyHotspotType: "reliable local habitat like ponds, mature trees, and sheltered edges",
    sourceLabel: "BirdCast seasonal context",
    referenceUrl: `https://birdcast.info/migration-tools/migration-dashboard/`
  } satisfies BirdContext;
}
