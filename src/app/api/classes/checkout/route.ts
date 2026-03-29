import { NextResponse } from "next/server";
import { z } from "zod";
import { createClassCheckoutSession } from "@/lib/class-bookings";
import { createClient } from "@/lib/supabase/server";

const createCheckoutSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid()
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

    const parsed = createCheckoutSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
    }

    const result = await createClassCheckoutSession({
      supabase,
      userId: user.id,
      userEmail: user.email,
      classId: parsed.data.classId,
      studentId: parsed.data.studentId
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status =
      message.includes("already booked") || message.includes("full") || message.includes("age range")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
