import {
  getEdibilityStatusLabel,
  getLegalStatusLabel,
  type EdibilityStatus,
  type LegalStatus,
  type StatusConfidence
} from "@/lib/safety-status/types";

type SafetyStatusCardProps = {
  edibilityStatus: EdibilityStatus;
  legalStatus: LegalStatus;
  cautionNote: string;
  regulationNote?: string | null;
  safetyNote: string;
  sourceNote?: string | null;
  statusConfidence?: StatusConfidence | null;
  compact?: boolean;
  emphasizeMushroom?: boolean;
};

export function SafetyStatusCard({
  edibilityStatus,
  legalStatus,
  cautionNote,
  regulationNote,
  safetyNote,
  sourceNote,
  statusConfidence,
  compact = false,
  emphasizeMushroom = false
}: SafetyStatusCardProps) {
  return (
    <section className={`mission-panel safety-status-card ${compact ? "safety-status-card-compact" : ""} ${emphasizeMushroom ? "safety-status-card-mushroom" : ""}`}>
      <div className="safety-status-header">
        <div>
          <p className="eyebrow">Safety + use status</p>
          <h4>{emphasizeMushroom ? "Mushroom caution" : "Field status"}</h4>
        </div>
        {statusConfidence ? <span className="muted">Confidence: {statusConfidence}</span> : null}
      </div>

      <div className="safety-pill-row">
        <span className={`pill safety-pill safety-pill-${edibilityStatus.replace(/_/g, "-")}`}>{getEdibilityStatusLabel(edibilityStatus)}</span>
        <span className={`pill safety-pill safety-pill-${legalStatus.replace(/_/g, "-")}`}>{getLegalStatusLabel(legalStatus)}</span>
      </div>

      <div className="safety-status-copy">
        <p><strong>Use note:</strong> {cautionNote}</p>
        <p><strong>Safety:</strong> {safetyNote}</p>
        {regulationNote ? <p><strong>Legal status:</strong> {regulationNote}</p> : null}
        {sourceNote ? <p className="muted">Source note: {sourceNote}</p> : null}
      </div>
    </section>
  );
}
