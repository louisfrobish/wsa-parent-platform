import { NextResponse } from "next/server";
import { mapForecastToWeatherCondition } from "@/lib/context/weather";
import { getNwsWeatherContext } from "@/lib/context/weather/nws";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 });
  }

  const weather = await getNwsWeatherContext(latitude, longitude);

  if (!weather) {
    return NextResponse.json({ error: "Forecast unavailable." }, { status: 502 });
  }

  return NextResponse.json({
    weatherCondition: mapForecastToWeatherCondition(weather.shortForecast, weather.hazards),
    shortForecast: weather.shortForecast,
    sourceLabel: weather.sourceLabel
  });
}
