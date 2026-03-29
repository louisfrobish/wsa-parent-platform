import { PageShell } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";

export default async function LessonsPage() {
  const { user } = await requireUser();

  return (
    <PageShell
      userLabel={user.email ?? "WSA family"}
      eyebrow="Lesson generator"
      title="Lesson workspace"
      description="This placeholder keeps the command center complete while the structured lesson generator is being expanded."
    >
      <section className="panel stack">
        <h3>Next module in line</h3>
        <p className="panel-copy">The lesson generator will plug into the same saved history, detail view, and printable flow as the rest of the parent workspace.</p>
      </section>
    </PageShell>
  );
}
