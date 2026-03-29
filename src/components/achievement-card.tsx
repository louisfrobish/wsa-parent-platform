import type { AchievementRecord } from "@/lib/badges";

type AchievementCardProps = {
  achievement: AchievementRecord;
  earnedAt?: string;
};

export function AchievementCard({ achievement, earnedAt }: AchievementCardProps) {
  return (
    <article className="note-card">
      <div className="copy">
        <h4>{achievement.name}</h4>
        <p className="panel-copy" style={{ margin: "8px 0 0" }}>
          {achievement.description}
        </p>
        <p className="muted" style={{ margin: "10px 0 0" }}>
          {earnedAt ? `Earned ${new Date(earnedAt).toLocaleDateString()}` : achievement.earning_criteria}
        </p>
      </div>
    </article>
  );
}
