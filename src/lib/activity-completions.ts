import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardStudentRewards } from "@/lib/badge-awards";
import { getRankForCompletedAdventures, type StudentRecord } from "@/lib/students";
import type { AchievementRecord, BadgeRecord } from "@/lib/badges";
import type { GenerationKind, GenerationRecord } from "@/lib/generations";
import type { ClassBookingRecord } from "@/lib/classes";

export const completionActivityTypes = [
  "daily_adventure",
  "animal_of_the_day",
  "week_planner",
  "lesson_generator",
  "nature_discovery",
  "in_person_class"
] as const;

export type CompletionActivityType = (typeof completionActivityTypes)[number];

export type ActivityCompletionRecord = {
  id: string;
  user_id: string;
  student_id: string;
  generation_id: string | null;
  class_booking_id: string | null;
  activity_type: CompletionActivityType;
  title: string;
  completed_at: string;
  notes: string | null;
  parent_rating: number | null;
  created_at: string;
};

export const markActivityCompleteSchema = z
  .object({
    studentId: z.string().uuid(),
    generationId: z.string().uuid().optional(),
    classBookingId: z.string().uuid().optional(),
    notes: z.string().trim().max(600).optional().or(z.literal("")),
    parentRating: z.coerce.number().int().min(1).max(5).optional()
  })
  .refine((value) => value.generationId || value.classBookingId, {
    message: "A generation or class booking is required."
  });

export function mapGenerationKindToActivityType(kind: GenerationKind): CompletionActivityType {
  switch (kind) {
    case "week_plan":
      return "week_planner";
    case "lesson":
      return "lesson_generator";
    case "fish_of_the_day":
    case "bird_of_the_day":
    case "plant_of_the_day":
      return "animal_of_the_day";
    default:
      return kind;
  }
}

export function completionCountsTowardAdventures(activityType: CompletionActivityType) {
  return activityType !== "in_person_class";
}

type CompleteActivityInput = {
  supabase: SupabaseClient;
  userId: string;
  studentId: string;
  generationId?: string;
  classBookingId?: string;
  notes?: string;
  parentRating?: number;
};

type CompletionResult = {
  completion: ActivityCompletionRecord;
  updatedStudent: StudentRecord;
  newBadges: BadgeRecord[];
  newAchievements: AchievementRecord[];
  recentBadge: BadgeRecord | null;
  rankJustReached: string | null;
};

type CompleteDiscoveryInput = {
  supabase: SupabaseClient;
  userId: string;
  studentId: string;
  title: string;
  notes?: string;
};

export async function loadStudentForCompletion(supabase: SupabaseClient, userId: string, studentId: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("id, user_id, name, age, interests, current_rank, completed_adventures_count, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!student) throw new Error("Student not found.");

  return student as StudentRecord;
}

async function loadGenerationForCompletion(supabase: SupabaseClient, userId: string, generationId: string) {
  const { data: generation, error } = await supabase
    .from("generations")
    .select("id, user_id, student_id, tool_type, title, input_json, output_json, created_at")
    .eq("user_id", userId)
    .eq("id", generationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!generation) throw new Error("Generation not found.");

  return generation as GenerationRecord;
}

async function loadClassBookingForCompletion(supabase: SupabaseClient, userId: string, classBookingId: string) {
  const { data: booking, error } = await supabase
    .from("class_bookings")
    .select("id, class_id, user_id, student_id, booking_status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents, booked_at, notes")
    .eq("user_id", userId)
    .eq("id", classBookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) throw new Error("Class booking not found.");

  return booking as ClassBookingRecord;
}

export async function completeActivity({
  supabase,
  userId,
  studentId,
  generationId,
  classBookingId,
  notes,
  parentRating
}: CompleteActivityInput): Promise<CompletionResult> {
  const student = await loadStudentForCompletion(supabase, userId, studentId);
  const previousRank = student.current_rank;

  let activityType: CompletionActivityType;
  let title: string;

  if (generationId) {
    const { data: existingCompletion, error: existingCompletionError } = await supabase
      .from("activity_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("student_id", studentId)
      .eq("generation_id", generationId)
      .maybeSingle();

    if (existingCompletionError) throw new Error(existingCompletionError.message);
    if (existingCompletion) throw new Error("This activity was already marked complete.");
  }

  if (classBookingId) {
    const { data: existingCompletion, error: existingCompletionError } = await supabase
      .from("activity_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("student_id", studentId)
      .eq("class_booking_id", classBookingId)
      .maybeSingle();

    if (existingCompletionError) throw new Error(existingCompletionError.message);
    if (existingCompletion) throw new Error("This activity was already marked complete.");
  }

  if (generationId) {
    const generation = await loadGenerationForCompletion(supabase, userId, generationId);

    if (!generation.student_id || generation.student_id !== studentId) {
      throw new Error("Select a student for this generation before marking it complete.");
    }

    activityType = mapGenerationKindToActivityType(generation.tool_type);
    title = generation.title;
  } else if (classBookingId) {
    const booking = await loadClassBookingForCompletion(supabase, userId, classBookingId);

    if (!booking.student_id || booking.student_id !== studentId) {
      throw new Error("This class booking is not linked to the selected student.");
    }

    activityType = "in_person_class";

    const { data: classRow, error: classError } = await supabase
      .from("classes")
      .select("title")
      .eq("id", booking.class_id)
      .maybeSingle();

    if (classError) throw new Error(classError.message);
    title = classRow?.title ?? "In-person class";
  } else {
    throw new Error("A generation or class booking is required.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("activity_completions")
    .insert({
      user_id: userId,
      student_id: studentId,
      generation_id: generationId ?? null,
      class_booking_id: classBookingId ?? null,
      activity_type: activityType,
      title,
      notes: notes?.trim() ? notes.trim() : null,
      parent_rating: parentRating ?? null
    })
    .select("id, user_id, student_id, generation_id, class_booking_id, activity_type, title, completed_at, notes, parent_rating, created_at")
    .single();

  if (insertError) {
    const lower = insertError.message.toLowerCase();
    if (lower.includes("duplicate") || lower.includes("unique")) {
      throw new Error("This activity was already marked complete.");
    }

    throw new Error(insertError.message);
  }

  let rewardSummary = {
    updatedStudent: student,
    newBadges: [] as BadgeRecord[],
    newAchievements: [] as AchievementRecord[],
    recentBadge: null as BadgeRecord | null
  };

  if (completionCountsTowardAdventures(activityType)) {
    rewardSummary = await awardStudentRewards({
      supabase,
      userId,
      student,
      sourceCompletionId: (inserted as ActivityCompletionRecord).id
    });
  } else {
    const { data: completionRows, error: completionError } = await supabase
      .from("activity_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("student_id", studentId)
      .in("activity_type", ["daily_adventure", "animal_of_the_day", "week_planner", "lesson_generator"]);

    if (completionError) throw new Error(completionError.message);

    const nextCount = completionRows?.length ?? 0;
    const nextRank = getRankForCompletedAdventures(nextCount);
    const updatedStudent = {
      ...student,
      completed_adventures_count: nextCount,
      current_rank: nextRank
    } satisfies StudentRecord;

    const { error: updateError } = await supabase
      .from("students")
      .update({
        completed_adventures_count: nextCount,
        current_rank: nextRank
      })
      .eq("user_id", userId)
      .eq("id", studentId);

    if (updateError) throw new Error(updateError.message);

    rewardSummary.updatedStudent = updatedStudent;
  }

  return {
    completion: inserted as ActivityCompletionRecord,
    updatedStudent: rewardSummary.updatedStudent,
    newBadges: rewardSummary.newBadges,
    newAchievements: rewardSummary.newAchievements,
    recentBadge: rewardSummary.recentBadge,
    rankJustReached: previousRank !== rewardSummary.updatedStudent.current_rank ? rewardSummary.updatedStudent.current_rank : null
  };
}

export async function completeDiscovery({
  supabase,
  userId,
  studentId,
  title,
  notes
}: CompleteDiscoveryInput): Promise<CompletionResult> {
  const student = await loadStudentForCompletion(supabase, userId, studentId);
  const previousRank = student.current_rank;

  const { data: inserted, error: insertError } = await supabase
    .from("activity_completions")
    .insert({
      user_id: userId,
      student_id: studentId,
      generation_id: null,
      class_booking_id: null,
      activity_type: "nature_discovery",
      title,
      notes: notes?.trim() ? notes.trim() : null,
      parent_rating: null
    })
    .select("id, user_id, student_id, generation_id, class_booking_id, activity_type, title, completed_at, notes, parent_rating, created_at")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  const rewardSummary = await awardStudentRewards({
    supabase,
    userId,
    student,
    sourceCompletionId: (inserted as ActivityCompletionRecord).id
  });

  return {
    completion: inserted as ActivityCompletionRecord,
    updatedStudent: rewardSummary.updatedStudent,
    newBadges: rewardSummary.newBadges,
    newAchievements: rewardSummary.newAchievements,
    recentBadge: rewardSummary.recentBadge,
    rankJustReached: previousRank !== rewardSummary.updatedStudent.current_rank ? rewardSummary.updatedStudent.current_rank : null
  };
}
