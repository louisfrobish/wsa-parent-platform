import Link from "next/link";
import type { AnimalOutput } from "@/lib/generations";
import { getGenerationOutput, type GenerationRecord } from "@/lib/generations";

type DashboardDailyFocusProps = {
  todayAdventure: GenerationRecord | null;
  animalOutput: AnimalOutput;
  historyFact?: string;
  startHref: string;
  startLabel?: string;
};

function CompassIcon() {
  return (
    <svg aria-hidden="true" className="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M9 15l2.2-6.2L17 7l-2 5.8L9 15Z" />
    </svg>
  );
}

export function DashboardDailyFocus({
  todayAdventure,
  animalOutput,
  historyFact,
  startHref,
  startLabel = "Start Adventure"
}: DashboardDailyFocusProps) {
  const output = todayAdventure ? ((getGenerationOutput(todayAdventure) ?? {}) as Record<string, unknown>) : {};
  const targetAnimal = String(output.animalOfTheDay || animalOutput.animalName || todayAdventure?.title || "today's animal");
  const where = animalOutput.bestNearbyPlaceType || animalOutput.likelyHabitatType || "Near water edges, woods, or yard habitat";
  const learn = animalOutput.funFacts?.[0] || historyFact || `Watch for how ${targetAnimal} uses cover, weather, and habitat today.`;
  const cluePool = [animalOutput.tracksAndSign, animalOutput.quickIdTip, animalOutput.habitat]
    .flatMap((value) => String(value || "").split(/[.;]/))
    .map((item) => item.replace(/^Quick ID tip:\s*/i, "").trim())
    .filter((item) => item.length > 0);
  const clues = Array.from(new Set(cluePool)).slice(0, 2);

  return (
    <section className="panel stack dashboard-focus-card">
      <div className="header-row field-section-header">
        <div className="field-section-heading">
          <span className="field-guide-icon-disc">
            <CompassIcon />
          </span>
          <div>
            <p className="eyebrow">Today&apos;s Adventure</p>
            <h3>Find and identify {targetAnimal}</h3>
          </div>
        </div>
        <div>{todayAdventure ? <span className="badge">Ready</span> : <span className="pill">Waiting</span>}</div>
      </div>

      <div className="dashboard-adventure-brief">
        <div className="dashboard-adventure-brief-row">
          <span className="dashboard-adventure-label">Mission</span>
          <p className="dashboard-adventure-copy">Find and identify {targetAnimal}.</p>
        </div>
        <div className="dashboard-adventure-brief-row">
          <span className="dashboard-adventure-label">Where</span>
          <p className="dashboard-adventure-copy">{where}</p>
        </div>
        <div className="dashboard-adventure-brief-row">
          <span className="dashboard-adventure-label">What to look for</span>
          <ul className="dashboard-adventure-list">
            {(clues.length ? clues : ["Look for movement, shape, and signs that match the habitat.", "Listen for nearby calls or watch for fresh tracks and cover."]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="dashboard-adventure-brief-row">
          <span className="dashboard-adventure-label">Learn</span>
          <p className="dashboard-adventure-copy">{learn}</p>
        </div>
      </div>

      <div className="cta-row">
        <Link className="button button-primary" href={startHref}>
          {startLabel}
        </Link>
      </div>
    </section>
  );
}
