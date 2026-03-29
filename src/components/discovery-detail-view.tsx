import { RegulationStatusCard } from "@/components/regulation-status-card";
import { SafetyStatusCard } from "@/components/safety-status-card";
import { harvestAllowedForStatus, type RegulationStatus } from "@/lib/regulations/types";
import { deriveCatalogSafetyStatus } from "@/lib/safety-status/derive";
import { getDiscoveryCategoryLabel, type DiscoveryRecord } from "@/lib/discoveries";

type DiscoveryDetailViewProps = {
  discovery: DiscoveryRecord;
  studentName?: string | null;
};

export function DiscoveryDetailView({ discovery, studentName }: DiscoveryDetailViewProps) {
  const result = (discovery.result_json ?? {}) as Record<string, unknown>;
  const keyFeatures = Array.isArray(result.key_features) ? (result.key_features as string[]) : [];
  const lookAlikes = Array.isArray(result.look_alikes) ? (result.look_alikes as string[]) : [];
  const localLookAlikes = Array.isArray(result.local_look_alikes) ? (result.local_look_alikes as string[]) : [];
  const safetyNote = typeof result.safety_note === "string" ? result.safety_note : "";
  const regionalPlausibilityNote =
    typeof result.regional_plausibility_note === "string" ? result.regional_plausibility_note : "";
  const observedNear = typeof result.observed_near === "string" ? result.observed_near : discovery.location_label;
  const rangeSummary = typeof result.range_summary === "string" ? result.range_summary : "";
  const taxonomy = typeof result.taxonomy_hierarchy === "object" && result.taxonomy_hierarchy !== null ? (result.taxonomy_hierarchy as Record<string, string>) : null;
  const isMushroom = discovery.category === "mushrooms";
  const isFish = discovery.category === "fish";
  const regulationStatus = typeof result.regulation_status === "string" ? result.regulation_status : null;
  const derivedSafetyStatus = deriveCatalogSafetyStatus({
    category: discovery.category,
    commonName: discovery.common_name,
    result,
    confidence: discovery.confidence_level
  });

  return (
    <section className="panel stack print-sheet">
      <div className="header-row">
        <div>
          <p className="eyebrow">{getDiscoveryCategoryLabel(discovery.category)}</p>
          <h2>{discovery.common_name}</h2>
          {discovery.scientific_name ? <p className="muted">{discovery.scientific_name}</p> : null}
        </div>
        <span className="pill">{new Date(discovery.observed_at).toLocaleDateString()}</span>
      </div>

      <div className="identify-preview-frame">
        <img src={discovery.image_url} alt={discovery.image_alt ?? discovery.common_name} className="identify-preview-image" />
      </div>

      <div className="result-sections">
        <section>
          <h3>Field details</h3>
          <p>
            Confidence: {discovery.confidence_level}
            {studentName ? ` | Student: ${studentName}` : " | Family catalog entry"}
            {discovery.location_label ? ` | ${discovery.location_label}` : ""}
          </p>
        </section>
        {observedNear || regionalPlausibilityNote ? (
          <section>
            <h3>Local field check</h3>
            {observedNear ? <p>Observed near: {observedNear}</p> : null}
            {regionalPlausibilityNote ? <p>{regionalPlausibilityNote}</p> : null}
            {rangeSummary ? <p>{rangeSummary}</p> : null}
            {localLookAlikes.length ? <p>Likely local look-alikes: {localLookAlikes.join(", ")}.</p> : null}
          </section>
        ) : null}
        {taxonomy ? (
          <section>
            <h3>Classification</h3>
            <p>{[taxonomy.kingdom, taxonomy.className, taxonomy.order, taxonomy.family].filter(Boolean).join(" | ")}</p>
          </section>
        ) : null}
        <SafetyStatusCard
          edibilityStatus={derivedSafetyStatus.edibility_status}
          legalStatus={derivedSafetyStatus.legal_status}
          cautionNote={derivedSafetyStatus.caution_note}
          regulationNote={derivedSafetyStatus.regulation_note}
          safetyNote={derivedSafetyStatus.safety_note}
          sourceNote={derivedSafetyStatus.source_note}
          statusConfidence={derivedSafetyStatus.status_confidence}
          compact
          emphasizeMushroom={isMushroom}
        />
        {isFish && regulationStatus ? (
          <RegulationStatusCard
            status={regulationStatus as RegulationStatus}
            seasonNote={typeof result.season_note === "string" ? result.season_note : ""}
            bagLimitNote={typeof result.bag_limit_note === "string" ? result.bag_limit_note : ""}
            sizeLimitNote={typeof result.size_limit_note === "string" ? result.size_limit_note : ""}
            protectedNote={typeof result.protected_note === "string" ? result.protected_note : ""}
            gearRuleNote={typeof result.gear_rule_note === "string" ? result.gear_rule_note : ""}
            source={typeof result.regulation_source === "string" ? result.regulation_source : ""}
            sourceUrl={typeof result.regulation_source_url === "string" ? result.regulation_source_url : ""}
            lastChecked={typeof result.regulation_last_checked === "string" ? result.regulation_last_checked : ""}
            compact
          />
        ) : null}
        {isFish ? (
          <section>
            <h3>Angler notes</h3>
            {typeof result.water_type === "string" ? <p>Water type: {result.water_type}</p> : null}
            {typeof result.best_bait === "string" ? <p>Best bait: {result.best_bait}</p> : null}
            {Array.isArray(result.best_lures) ? <p>Best lures: {(result.best_lures as string[]).join(", ")}.</p> : null}
            {typeof result.wsa_angler_tip === "string" ? <p>WSA angler tip: {result.wsa_angler_tip}</p> : null}
            {regulationStatus && !harvestAllowedForStatus(regulationStatus as RegulationStatus) ? (
              <p>Identification and learning only. Check current Maryland rules before using cooking or harvest guidance.</p>
            ) : (
              <>
                {typeof result.flavor_profile === "string" ? <p>Flavor profile: {result.flavor_profile}</p> : null}
                {Array.isArray(result.best_cooking_methods) ? <p>Best cooking methods: {(result.best_cooking_methods as string[]).join(", ")}.</p> : null}
                {typeof result.preparation_tips === "string" ? <p>Preparation tips: {result.preparation_tips}</p> : null}
              </>
            )}
            {typeof result.best_season === "string" ? <p>Best season: {result.best_season}</p> : null}
          </section>
        ) : null}
        {keyFeatures.length ? (
          <section>
            <h3>Key features</h3>
            <ul className="result-list">
              {keyFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {lookAlikes.length ? (
          <section>
            <h3>Look-alikes</h3>
            <ul className="result-list">
              {lookAlikes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <section>
          <h3>Safety note</h3>
          <p>{safetyNote || "No special safety note was saved for this discovery."}</p>
          {isMushroom ? (
            <p className="error" style={{ marginBottom: 0 }}>
              Mushroom identifications here are never safe-to-eat guidance.
            </p>
          ) : null}
        </section>
        {typeof result.wsa_observation_challenge === "string" ? (
          <section>
            <h3>WSA observation challenge</h3>
            <p>{result.wsa_observation_challenge}</p>
          </section>
        ) : null}
        {typeof result.journal_prompt === "string" ? (
          <section>
            <h3>Journal prompt</h3>
            <p>{result.journal_prompt}</p>
          </section>
        ) : null}
        {discovery.notes ? (
          <section>
            <h3>Family notes</h3>
            <p>{discovery.notes}</p>
          </section>
        ) : null}
      </div>
    </section>
  );
}
