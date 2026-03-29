import { NextResponse } from "next/server";
import { completeActivity } from "@/lib/activity-completions";
import { createClient } from "@/lib/supabase/server";
import { completeAdventureSchema } from "@/lib/students";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = completeAdventureSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid completion request." }, { status: 400 });
    }

    const result = await completeActivity({
      supabase,
      userId: user.id,
      studentId: parsed.data.studentId,
      generationId: parsed.data.generationId
    });

    return NextResponse.json({
      completion: result.completion,
      student: result.updatedStudent,
      newBadges: result.newBadges,
      newAchievements: result.newAchievements,
      recentBadge: result.recentBadge,
      rankJustReached: result.rankJustReached
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
