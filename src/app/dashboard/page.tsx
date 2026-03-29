import { BadgeProgressWidget } from "@/components/badge-progress-widget";
import { DashboardDailyConditions } from "@/components/dashboard-daily-conditions";
import { DashboardDailyBriefing } from "@/components/dashboard-daily-briefing";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import type { ActivityCompletionRecord } from "@/lib/activity-completions";
import { getEnvironmentalContext } from "@/lib/context/engine";
import { getTideSummary } from "@/lib/context/tides";
import { getHistoryFactForDate } from "@/lib/daily-brief/history-fact";
import { getNatureQuoteForDate } from "@/lib/daily-brief/nature-quote";
import { ensureHouseholdBriefing } from "@/lib/daily-briefing";
import type { GenerationRecord } from "@/lib/generations";
import { getUserLocationPreferences, resolveUserLocationPreference } from "@/lib/location-preferences";
import { rankLevels, type StudentRecord } from "@/lib/students";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedStudentId = typeof resolvedSearchParams.student === "string" ? resolvedSearchParams.student : "";
  const selectedAudience = typeof resolvedSearchParams.audience === "string" ? resolvedSearchParams.audience : "";
  const { supabase, user } = await requireUser();

  const [{ data: generations }, { data: students }, { data: studentBadges }, { data: recentAchievements }, { data: completions }, locationPreferences] =
    await Promise.all([
      supabase
        .from("generations")
        .select("id, user_id, student_id, tool_type, title, input_json, output_json, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(14),
      supabase
        .from("students")
        .select("id, user_id, name, age, interests, current_rank, completed_adventures_count, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("student_badges")
        .select("id, student_id, badge_id, earned_at, source_completion_id, created_at, badges:badges(id, name, description, category, icon, criteria_json, created_at)")
        .order("earned_at", { ascending: false })
        .limit(50),
      supabase
        .from("student_achievements")
        .select("id, user_id, student_id, achievement_id, earned_at, achievements:achievements(id, key, name, description, earning_criteria, created_at)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(6),
      supabase
        .from("activity_completions")
        .select("id, user_id, student_id, generation_id, class_booking_id, activity_type, title, completed_at, notes, parent_rating, created_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(12),
      getUserLocationPreferences(supabase, user.id)
    ]);

  const generationRows = (generations ?? []) as GenerationRecord[];
  const studentRows = (students ?? []) as StudentRecord[];
  const resolvedLocationPreference = resolveUserLocationPreference(locationPreferences);
  const householdBriefing = await ensureHouseholdBriefing(
    supabase,
    user.id,
    generationRows,
    resolvedLocationPreference.location.displayLabel
  );
  const allGenerationRows = [
    householdBriefing.animalGeneration,
    householdBriefing.birdGeneration,
    householdBriefing.plantGeneration,
    householdBriefing.fishGeneration,
    ...generationRows
  ].filter((item, index, items) => items.findIndex((entry) => entry.id === item.id) === index);
  const completionRows = (completions ?? []) as ActivityCompletionRecord[];
  const badgeCounts = (studentBadges ?? []).reduce<Record<string, number>>((acc, item) => {
    const row = item as { student_id?: string };
    if (row.student_id) acc[row.student_id] = (acc[row.student_id] ?? 0) + 1;
    return acc;
  }, {});

  const activeStudent =
    (selectedStudentId ? studentRows.find((student) => student.id === selectedStudentId) : null) ??
    (studentRows.length === 1 ? studentRows[0] : studentRows[0] ?? null);
  const briefingStudent =
    selectedAudience === "household"
      ? null
      : (selectedStudentId ? studentRows.find((student) => student.id === selectedStudentId) : null) ??
        (studentRows.length === 1 ? studentRows[0] : null);

  const today = new Date().toISOString().slice(0, 10);
  const environmental = await getEnvironmentalContext(supabase, {
    requestDate: today,
    locationLabel: resolvedLocationPreference.location.displayLabel,
    latitude: resolvedLocationPreference.location.latitude,
    longitude: resolvedLocationPreference.location.longitude,
    radiusMiles: resolvedLocationPreference.location.radiusMiles,
    weatherCondition: "clear"
  });
  const tideSummary = getTideSummary(today, environmental.location);
  const historyFact = getHistoryFactForDate(today);
  const natureQuote = getNatureQuoteForDate(today);
  const todayAdventure =
    allGenerationRows.find(
      (item) =>
        item.tool_type === "daily_adventure" &&
        item.student_id === (activeStudent?.id ?? item.student_id) &&
        ((item.input_json as Record<string, unknown>)?.requestDate as string | undefined) === today
    ) ??
    allGenerationRows.find(
      (item) =>
        item.tool_type === "daily_adventure" &&
        ((item.input_json as Record<string, unknown>)?.requestDate as string | undefined) === today
    ) ??
    null;

  const totalCompletedAdventures = studentRows.reduce((sum, student) => sum + student.completed_adventures_count, 0);
  const totalBadgeCount = Object.values(badgeCounts).reduce((sum, count) => sum + count, 0);
  const totalSavedLessons = allGenerationRows.filter((item) => item.tool_type === "lesson" || item.tool_type === "week_plan").length;
  const printableItemsCreated = allGenerationRows.length;
  const topStudentRank =
    studentRows
      .map((student) => student.current_rank)
      .sort((a, b) => rankLevels.indexOf(b) - rankLevels.indexOf(a))[0] ?? "Colt";
  const recentBadgeName =
    (studentBadges?.[0] as { badges?: { name?: string } } | undefined)?.badges?.name ??
    "No badges earned yet";

  return (
    <AppShell userLabel={user.email ?? "WSA family"}>
      <DashboardDailyConditions
        weather={environmental.weather}
        fallbackSummary={environmental.fallbackWeatherSummary.summary}
        tide={tideSummary}
      />

      <DashboardDailyBriefing
        briefing={householdBriefing}
        activeStudent={briefingStudent}
        totalCompletedAdventures={totalCompletedAdventures}
        totalSavedLessons={totalSavedLessons}
        printableItemsCreated={printableItemsCreated}
        todayAdventureHref={
          todayAdventure
            ? `/generations/${todayAdventure.id}`
            : `/daily-adventure${briefingStudent ? `?studentId=${briefingStudent.id}` : ""}`
        }
        historyFact={historyFact}
        natureQuote={natureQuote}
      />

      <BadgeProgressWidget
        badgeCount={totalBadgeCount}
        achievementCount={recentAchievements?.length ?? 0}
        recentBadge={recentBadgeName}
      />
    </AppShell>
  );
}
