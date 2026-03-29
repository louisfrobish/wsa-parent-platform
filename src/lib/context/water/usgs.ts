import { fetchJsonWithTimeout, fetchTextWithTimeout } from "@/lib/context/http";

export type WaterContext = {
  streamflow: string | null;
  gageHeight: string | null;
  waterTrend: string;
  locationLabel: string;
  sourceLabel: string;
};

type UsgsIvResponse = {
  value?: {
    timeSeries?: Array<{
      variable?: {
        variableCode?: Array<{ value?: string }>;
      };
      values?: Array<{
        value?: Array<{ value?: string }>;
      }>;
    }>;
  };
};

export async function getNearbyUsgsWaterContext(latitude: number, longitude: number, locationLabel: string) {
  try {
    const halfBox = 0.18;
    const west = longitude - halfBox;
    const south = latitude - halfBox;
    const east = longitude + halfBox;
    const north = latitude + halfBox;

    const siteText = await fetchTextWithTimeout(
      `https://waterservices.usgs.gov/nwis/site/?format=rdb&bBox=${west},${south},${east},${north}&siteType=ST&siteStatus=active`,
      { timeoutMs: 7000 }
    );

    const siteId = siteText
      .split(/\r?\n/)
      .find((line) => /^\d+\tUSGS\t\d+/.test(line))
      ?.split("\t")[1];

    if (!siteId) return null;

    const iv = await fetchJsonWithTimeout<UsgsIvResponse>(
      `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteId}&parameterCd=00060,00065`,
      { timeoutMs: 7000 }
    );

    const series = iv.value?.timeSeries ?? [];
    const streamflow = readLatestParameter(series, "00060");
    const gageHeight = readLatestParameter(series, "00065");

    return {
      streamflow: streamflow ? `${streamflow} cfs` : null,
      gageHeight: gageHeight ? `${gageHeight} ft` : null,
      waterTrend: streamflow || gageHeight ? "Recent USGS readings are available for a nearby stream gage." : "No nearby live gage reading was available.",
      locationLabel,
      sourceLabel: "USGS Water Data"
    } satisfies WaterContext;
  } catch {
    return null;
  }
}

function readLatestParameter(
  series: NonNullable<NonNullable<UsgsIvResponse["value"]>["timeSeries"]>,
  parameterCode: string
) {
  return (
    series.find((item) => item.variable?.variableCode?.some((code) => code.value === parameterCode))?.values?.[0]?.value?.[0]?.value ??
    null
  );
}
