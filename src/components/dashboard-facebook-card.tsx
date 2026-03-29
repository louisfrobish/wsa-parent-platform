import { WSA_FACEBOOK_URL } from "@/lib/social";

export function DashboardFacebookCard() {
  return (
    <section className="panel stack">
      <div className="field-section-header">
        <div>
          <p className="eyebrow">WSA on Facebook</p>
          <h3>Follow class updates and outdoor inspiration</h3>
        </div>
      </div>
      <div className="field-empty-state">
        <div className="copy">
          <h4>Stay connected to the official WSA page</h4>
          <p className="panel-copy" style={{ marginBottom: 0 }}>
            Follow Wild Stallion Academy on Facebook for daily outdoor posts, class updates, announcements, and fresh ideas families can use right away.
          </p>
        </div>
      </div>
      <div className="cta-row">
        <a className="button button-primary" href={WSA_FACEBOOK_URL} target="_blank" rel="noreferrer">
          Open Facebook Page
        </a>
      </div>
    </section>
  );
}
