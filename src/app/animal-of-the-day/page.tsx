import { AnimalGenerator } from "@/components/animal-generator";
import { PageShell } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";
import type { GenerationRecord } from "@/lib/generations";
import type { StudentRecord } from "@/lib/students";

export default async function AnimalOfTheDayPage({
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
      .eq("tool_type", "animal_of_the_day")
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
      title="Animal of the Day field briefing"
      description="Build a clear daily wildlife briefing with nearby habitat guidance, family-friendly observation prompts, and practical field notes you can use right away."
    >
      <AnimalGenerator
        initialHistory={(data ?? []) as GenerationRecord[]}
        students={(students ?? []) as StudentRecord[]}
        preselectedStudentId={studentId}
      />
    </PageShell>
  );
}
