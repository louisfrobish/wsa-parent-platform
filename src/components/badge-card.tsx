import type { BadgeRecord } from "@/lib/badges";

type BadgeCardProps = {
  badge: BadgeRecord;
  earnedAt?: string;
};

export function BadgeCard({ badge, earnedAt }: BadgeCardProps) {
  return (
    <article className="note-card badge-specimen">
      <div className="copy">
        <div className="header-row">
          <div>
            <h4>{badge.name}</h4>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              {badge.category}
            </p>
          </div>
          <span className="pill">{badge.icon || "Badge"}</span>
        </div>
        <p className="panel-copy" style={{ margin: 0 }}>
          {badge.description}
        </p>
        <p className="muted" style={{ margin: "10px 0 0" }}>
          {earnedAt
            ? `Earned ${new Date(earnedAt).toLocaleDateString()}`
            : String(badge.criteria_json.rule || badge.criteria_json.legacy_criteria || "Badge criteria")}
        </p>
      </div>
    </article>
  );
}
