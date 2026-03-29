import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminClassFormSchema } from "@/lib/admin-classes";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin();
    const parsed = adminClassFormSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid class details." }, { status: 400 });
    }

    const { error } = await supabase
      .from("classes")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
