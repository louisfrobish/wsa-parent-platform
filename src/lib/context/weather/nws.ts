import { fetchJsonWithTimeout } from "@/lib/context/http";

export type WeatherContext = {
  temperature: number | null;
  lowTemperature: number | null;
  windSpeed: string | null;
  windDirection: string | null;
  precipitationChance: number | null;
  shortForecast: string;
  hazards: string[];
  sunrise: string | null;
  sunset: string | null;
  sourceLabel: string;
};

type NwsPointsResponse = {
  properties?: {
    forecast?: string;
  };
};

type NwsForecastResponse = {
  properties?: {
    periods?: Array<{
      temperature?: number;
      windSpeed?: string;
      windDirection?: string;
      shortForecast?: string;
      probabilityOfPrecipitation?: { value?: number | null };
      isDaytime?: boolean;
      startTime?: string;
    }>;
  };
};

type NwsAlertsResponse = {
  features?: Array<{
    properties?: {
      headline?: string;
    };
  }>;
};

export async function getNwsWeatherContext(latitude: number, longitude: number) {
  const userAgent = process.env.WSA_ENV_DATA_USER_AGENT || "WildStallionAcademyAI/1.0 (support@example.com)";

  try {
    const points = await fetchJsonWithTimeout<NwsPointsResponse>(
      `https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`,
      {
        headers: { "User-Agent": userAgent }
      }
    );

    const forecastUrl = points.properties?.forecast;
    if (!forecastUrl) throw new Error("No forecast URL returned from NWS.");

    const [forecast, alerts] = await Promise.all([
      fetchJsonWithTimeout<NwsForecastResponse>(forecastUrl, {
        headers: { "User-Agent": userAgent }
      }),
      fetchJsonWithTimeout<NwsAlertsResponse>(
        `https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`,
        {
          headers: { "User-Agent": userAgent }
        }
      ).catch(() => ({ features: [] }))
    ]);

    const period = forecast.properties?.periods?.[0];

    return {
      temperature: period?.temperature ?? null,
      lowTemperature:
        forecast.properties?.periods?.find((item) => item?.isDaytime === false)?.temperature ??
        forecast.properties?.periods?.[1]?.temperature ??
        null,
      windSpeed: period?.windSpeed ?? null,
      windDirection: period?.windDirection ?? null,
      precipitationChance: period?.probabilityOfPrecipitation?.value ?? null,
      shortForecast: period?.shortForecast ?? "Forecast data available.",
      hazards: (alerts.features ?? [])
        .map((item) => item.properties?.headline)
        .filter((value): value is string => Boolean(value))
        .slice(0, 3),
      sunrise: null,
      sunset: null,
      sourceLabel: "NWS / NOAA"
    } satisfies WeatherContext;
  } catch {
    return null;
  }
}
