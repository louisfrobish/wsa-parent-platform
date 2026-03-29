type BadgeProgressWidgetProps = {
  badgeCount: number;
  achievementCount: number;
  recentBadge: string;
};

export function BadgeProgressWidget({ badgeCount, achievementCount, recentBadge }: BadgeProgressWidgetProps) {
  return (
    <article className="panel stack">
      <div>
        <p className="eyebrow">Badge progress</p>
        <h3>Reward momentum</h3>
      </div>
      <div className="stats-grid">
        <article className="stat">
          <span>Badges earned</span>
          <strong>{badgeCount}</strong>
        </article>
        <article className="stat">
          <span>Achievements</span>
          <strong>{achievementCount}</strong>
        </article>
        <article className="stat" style={{ gridColumn: "span 2" }}>
          <span>Recent badge</span>
          <strong>{recentBadge}</strong>
        </article>
      </div>
    </article>
  );
}
