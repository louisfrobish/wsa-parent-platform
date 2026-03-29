import { NextResponse } from "next/server";
import { completeActivity, markActivityCompleteSchema } from "@/lib/activity-completions";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = markActivityCompleteSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid completion request." }, { status: 400 });
    }

    const result = await completeActivity({
      supabase,
      userId: user.id,
      studentId: parsed.data.studentId,
      generationId: parsed.data.generationId,
      classBookingId: parsed.data.classBookingId,
      notes: parsed.data.notes,
      parentRating: parsed.data.parentRating
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const schemaMissing = message.includes("schema cache") || message.includes("activity_completions");
    const status =
      schemaMissing
        ? 500
        : message.includes("already marked complete")
        ? 409
        : message.includes("not found") || message.includes("not linked")
          ? 404
          : message.includes("Select a student")
            ? 400
            : 500;

    return NextResponse.json(
      {
        error: schemaMissing
          ? "Activity completion storage is not ready yet. Run the latest Supabase migration and try again."
          : message
      },
      { status }
    );
  }
}
