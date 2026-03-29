import type { TideSummary } from "@/lib/context/tides";
import type { WeatherContext } from "@/lib/context/weather/nws";

type DashboardDailyConditionsProps = {
  weather: WeatherContext | null;
  fallbackSummary: string;
  tide: TideSummary;
};

export function DashboardDailyConditions({ weather, fallbackSummary, tide }: DashboardDailyConditionsProps) {
  const weatherLabel = weather?.shortForecast ?? "Mixed conditions";
  const high = weather?.temperature ?? "--";
  const low = weather?.lowTemperature ?? "--";
  const nextHigh = tide.highTides[0] ?? "--";
  const nextLow = tide.lowTides[0] ?? "--";

  return (
    <section className="daily-conditions-strip">
      <article className="specimen-card daily-condition-chip">
        <div className="daily-condition-symbol">Sun</div>
        <div className="daily-condition-copy">
          <span className="eyebrow">Weather</span>
          <strong>{weatherLabel}</strong>
          <span className="muted">H {high} deg / L {low} deg</span>
        </div>
      </article>

      <article className="specimen-card daily-condition-chip">
        <div className="daily-condition-symbol">Tide</div>
        <div className="daily-condition-copy">
          <span className="eyebrow">Tides</span>
          <strong>{tide.hasTideData ? `High ${nextHigh}` : "No tide pressure"}</strong>
          <span className="muted">{tide.hasTideData ? `Low ${nextLow}` : tide.summary}</span>
        </div>
      </article>

      <article className="specimen-card daily-condition-chip daily-condition-chip-wide">
        <div className="daily-condition-copy">
          <span className="eyebrow">Field Read</span>
          <strong className="daily-condition-field-read">{fallbackSummary}</strong>
        </div>
      </article>
    </section>
  );
}
