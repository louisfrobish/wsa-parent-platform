import { NextResponse } from "next/server";
import { z } from "zod";
import { markClassAttended } from "@/lib/class-bookings";
import { createClient } from "@/lib/supabase/server";

const markAttendanceSchema = z.object({
  bookingId: z.string().uuid(),
  notes: z.string().trim().max(600).optional().or(z.literal("")),
  parentRating: z.coerce.number().int().min(1).max(5).optional()
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = markAttendanceSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid attendance request." }, { status: 400 });
    }

    const result = await markClassAttended({
      supabase,
      actingUserId: user.id,
      ownerUserId: user.id,
      bookingId: parsed.data.bookingId,
      notes: parsed.data.notes,
      parentRating: parsed.data.parentRating
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
