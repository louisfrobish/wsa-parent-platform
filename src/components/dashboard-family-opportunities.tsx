import type { FamilyOpportunity } from "@/lib/nearby/family-opportunities";

type DashboardFamilyOpportunitiesProps = {
  items: FamilyOpportunity[];
  showHeader?: boolean;
};

const typeLabels: Record<FamilyOpportunity["type"], string> = {
  museum: "Museum",
  landmark: "Historic Landmark",
  library_event: "Library Event",
  nature_center: "Nature Center"
};

export function DashboardFamilyOpportunities({ items, showHeader = true }: DashboardFamilyOpportunitiesProps) {
  return (
    <section className="panel stack">
      {showHeader ? (
        <div className="field-section-header">
          <div>
            <p className="eyebrow">Nearby Family Opportunities</p>
            <h3>Museums, landmarks, and family enrichment stops</h3>
            <p className="panel-copy" style={{ marginBottom: 0 }}>
              Use these as light planning anchors for Family Week, rainy-day pivots, or a quick local enrichment outing.
            </p>
          </div>
        </div>
      ) : null}

      <div className="dashboard-opportunity-list">
        {items.map((item) => (
          <article className="dashboard-opportunity-row" key={item.id}>
            <div className="dashboard-opportunity-row-top">
              <div className="field-guide-meta-row">
                <span className="badge">{typeLabels[item.type]}</span>
                <span className="muted">{item.distanceMiles !== null ? `${item.distanceMiles} miles` : "Nearby"}</span>
              </div>
            </div>
            <h4 className="dashboard-opportunity-title">{item.title}</h4>
            <p className="dashboard-opportunity-description">{item.reason}</p>
            <div className="dashboard-opportunity-row-bottom">
              <p className="muted dashboard-opportunity-location">
                {item.locationLabel}
              </p>
              <a className="button button-ghost dashboard-opportunity-map" href={item.mapUrl} target="_blank" rel="noreferrer">
                Map
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
