import { AdminClassForm } from "@/components/admin-class-form";
import { PageShell } from "@/components/page-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewClassPage() {
  const { user } = await requireAdmin();

  return (
    <PageShell
      userLabel={user.email ?? "WSA admin"}
      eyebrow="Admin"
      title="New class"
      description="Create a new in-person class with the parent-facing details and the internal operational notes in one place."
    >
      <AdminClassForm mode="create" />
    </PageShell>
  );
}
