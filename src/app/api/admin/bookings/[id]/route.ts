import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminBookingActionSchema } from "@/lib/admin-classes";
import { adminUpdateBookingStatus, markClassAttended } from "@/lib/class-bookings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAdmin();
    const parsed = adminBookingActionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid booking action." }, { status: 400 });
    }

    if (parsed.data.action === "mark_attended") {
      const result = await markClassAttended({
        supabase,
        actingUserId: user.id,
        ownerUserId: user.id,
        bookingId: id,
        notes: parsed.data.notes,
        parentRating: parsed.data.parentRating
      });

      return NextResponse.json({ ok: true, result });
    }

    await adminUpdateBookingStatus({
      supabase,
      bookingId: id,
      action: parsed.data.action,
      notes: parsed.data.notes
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
