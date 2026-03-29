import { getRegulationStatusLabel, harvestAllowedForStatus, type RegulationStatus } from "@/lib/regulations/types";

type RegulationStatusCardProps = {
  status: RegulationStatus;
  seasonNote?: string | null;
  bagLimitNote?: string | null;
  sizeLimitNote?: string | null;
  protectedNote?: string | null;
  gearRuleNote?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  lastChecked?: string | null;
  compact?: boolean;
};

export function RegulationStatusCard({
  status,
  seasonNote,
  bagLimitNote,
  sizeLimitNote,
  protectedNote,
  gearRuleNote,
  source,
  sourceUrl,
  lastChecked,
  compact = false
}: RegulationStatusCardProps) {
  const showHarvestGuardrail = !harvestAllowedForStatus(status);

  return (
    <section className={`mission-panel regulation-card ${compact ? "regulation-card-compact" : ""}`}>
      <div className="regulation-card-header">
        <div>
          <p className="eyebrow">Maryland regulation status</p>
          <h4>{getRegulationStatusLabel(status)}</h4>
        </div>
        <span className={`pill regulation-pill regulation-pill-${status.replace(/_/g, "-")}`}>
          {getRegulationStatusLabel(status)}
        </span>
      </div>
      {seasonNote ? <p>{seasonNote}</p> : null}
      <div className="regulation-note-stack">
        {bagLimitNote ? <p><strong>Bag/creel:</strong> {bagLimitNote}</p> : null}
        {sizeLimitNote ? <p><strong>Size/slot:</strong> {sizeLimitNote}</p> : null}
        {protectedNote ? <p><strong>Protection:</strong> {protectedNote}</p> : null}
        {gearRuleNote ? <p><strong>Gear note:</strong> {gearRuleNote}</p> : null}
      </div>
      {showHarvestGuardrail ? (
        <p className="regulation-guardrail">Identification and learning only for now. Verify Maryland DNR rules before harvest or cooking guidance.</p>
      ) : null}
      {source ? (
        <p className="muted regulation-source-line">
          Source:{" "}
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noreferrer">
              {source}
            </a>
          ) : (
            source
          )}
          {lastChecked ? ` | Checked ${lastChecked}` : ""}
        </p>
      ) : null}
    </section>
  );
}
