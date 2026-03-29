import { DiscoveryCatalogView } from "@/components/discovery-catalog-view";
import { PageShell } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";
import { discoveryCatalogCategorySchema, type DiscoveryRecord } from "@/lib/discoveries";
import type { StudentRecord } from "@/lib/students";

export default async function DiscoverCatalogPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = discoveryCatalogCategorySchema.safeParse(params.category).success
    ? (params.category as ReturnType<typeof discoveryCatalogCategorySchema.parse>)
    : "all";
  const { supabase, user } = await requireUser();

  const [{ data: discoveries }, { data: students }] = await Promise.all([
    supabase
      .from("discoveries")
      .select("id, user_id, student_id, category, common_name, scientific_name, confidence_level, image_url, image_alt, notes, result_json, location_label, latitude, longitude, observed_at, created_at")
      .eq("user_id", user.id)
      .order("observed_at", { ascending: false }),
    supabase
      .from("students")
      .select("id, user_id, name, age, interests, current_rank, completed_adventures_count, created_at, updated_at")
      .eq("user_id", user.id)
  ]);

  const studentNames = new Map(((students ?? []) as StudentRecord[]).map((student) => [student.id, student.name]));

  return (
    <PageShell
      userLabel={user.email ?? "WSA family"}
      eyebrow="Discovery Catalog"
      title="Family nature catalog"
      description="A growing field notebook of saved discoveries across animals, bugs, trees, birds, fish, plants, and mushrooms."
    >
      <DiscoveryCatalogView
        items={(discoveries ?? []) as DiscoveryRecord[]}
        selectedCategory={selectedCategory}
        studentNames={studentNames}
      />
    </PageShell>
  );
}
