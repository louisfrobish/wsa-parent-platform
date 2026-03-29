import { FishGenerator } from "@/components/fish-generator";
import { PageShell } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";
import type { GenerationRecord } from "@/lib/generations";
import type { StudentRecord } from "@/lib/students";

export default async function FishOfTheDayPage({
  searchParams
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data }, { data: students }] = await Promise.all([
    supabase
      .from("generations")
      .select("id, user_id, student_id, tool_type, title, input_json, output_json, created_at")
      .eq("user_id", user.id)
      .eq("tool_type", "fish_of_the_day")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("students")
      .select("id, user_id, name, age, interests, current_rank, completed_adventures_count, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <PageShell
      userLabel={user.email ?? "WSA family"}
      eyebrow="WSA Explorer Mode"
      title="Fish of the Day field briefing"
      description="Generate a local fishing briefing with water-aware habitat clues, nearby access, beginner-friendly bait guidance, and a calm family-ready outlook."
    >
      <FishGenerator
        initialHistory={(data ?? []) as GenerationRecord[]}
        students={(students ?? []) as StudentRecord[]}
        preselectedStudentId={studentId}
      />
    </PageShell>
  );
}
