export type MarylandDnrFishingContext = {
  reportSummary: string;
  stockingContext: string;
  accessNotes: string;
  sourceLabel: string;
  accessUrl: string;
  reportUrl: string;
};

export function getMarylandDnrFishingContext(requestDate: string) {
  const month = new Date(`${requestDate}T12:00:00`).getMonth() + 1;
  const coolSeason = month <= 4 || month >= 10;

  return {
    reportSummary: coolSeason
      ? "Maryland DNR seasonal patterns suggest cooler-water timing can improve moving-water and lower-light fishing windows."
      : "Maryland DNR seasonal patterns suggest early and late windows often feel better than exposed midday heat.",
    stockingContext: month >= 2 && month <= 5
      ? "Spring timing may overlap with trout-stocking activity in some Maryland waters, so official DNR access and stocking resources are worth checking."
      : "No specific stocking assumption is being made today, so local access and seasonal fish behavior matter more.",
    accessNotes: "Use official Maryland DNR access information to confirm access rules, closures, and local fishing guidance before heading out.",
    sourceLabel: "Maryland DNR resources",
    accessUrl: "https://dnr.maryland.gov/fisheries/Pages/recreational/angler-access.aspx",
    reportUrl: "https://dnr.maryland.gov/fisheries/pages/fishingreport/index.aspx"
  } satisfies MarylandDnrFishingContext;
}
