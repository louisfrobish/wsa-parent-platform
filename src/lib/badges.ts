export type BadgeRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  criteria_json: Record<string, unknown>;
  created_at: string;
};

export type AchievementRecord = {
  id: string;
  key: string;
  name: string;
  description: string;
  earning_criteria: string;
  created_at: string;
};

export type StudentBadgeRecord = {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
  source_completion_id: string | null;
  created_at: string;
  badges?: BadgeRecord;
};

export type StudentAchievementRecord = {
  id: string;
  user_id: string;
  student_id: string;
  achievement_id: string;
  earned_at: string;
  created_at?: string;
  achievements?: AchievementRecord;
};

export function normalizeStudentBadgeRows(rows: unknown[]) {
  return rows.map((row) => {
    const item = row as StudentBadgeRecord & { badges?: BadgeRecord | BadgeRecord[] };
    const badge = Array.isArray(item.badges) ? item.badges[0] : item.badges;

    return {
      ...item,
      badges: badge
    } satisfies StudentBadgeRecord;
  });
}

export function normalizeStudentAchievementRows(rows: unknown[]) {
  return rows.map((row) => {
    const item = row as StudentAchievementRecord & { achievements?: AchievementRecord | AchievementRecord[] };
    const achievement = Array.isArray(item.achievements) ? item.achievements[0] : item.achievements;

    return {
      ...item,
      achievements: achievement
    } satisfies StudentAchievementRecord;
  });
}
