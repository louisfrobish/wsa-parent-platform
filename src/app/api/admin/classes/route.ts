import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminClassFormSchema } from "@/lib/admin-classes";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const parsed = adminClassFormSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid class details." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("classes")
      .insert(parsed.data)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
