import type { SupabaseClient } from "@supabase/supabase-js";
import { completeActivity } from "@/lib/activity-completions";
import type { ClassBookingRecord, ClassRecord } from "@/lib/classes";
import { getAppUrl, getStripeClient } from "@/lib/stripe";
import type { StudentRecord } from "@/lib/students";

export async function loadClassForBooking(supabase: SupabaseClient, classId: string) {
  const { data, error } = await supabase
    .from("classes")
    .select("id, title, description, class_type, date, start_time, end_time, location, age_min, age_max, price_cents, max_capacity, spots_remaining, what_to_bring, weather_note, waiver_required, status, created_at, updated_at")
    .eq("id", classId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Class not found.");

  return data as ClassRecord;
}

export async function loadStudentForBooking(supabase: SupabaseClient, userId: string, studentId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("id, user_id, name, age, interests, current_rank, completed_adventures_count, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Student not found.");

  return data as StudentRecord;
}

export async function createClassCheckoutSession(input: {
  supabase: SupabaseClient;
  userId: string;
  userEmail?: string | null;
  classId: string;
  studentId: string;
}) {
  const classRow = await loadClassForBooking(input.supabase, input.classId);
  const student = await loadStudentForBooking(input.supabase, input.userId, input.studentId);

  if (classRow.status !== "published") {
    throw new Error("This class is not currently open for booking.");
  }

  if (classRow.spots_remaining <= 0) {
    throw new Error("This class is full.");
  }

  if ((classRow.age_min && student.age < classRow.age_min) || (classRow.age_max && student.age > classRow.age_max)) {
    throw new Error("This class does not match the selected student's age range.");
  }

  const { data: existingBooking, error: existingError } = await input.supabase
    .from("class_bookings")
    .select("id, class_id, user_id, student_id, booking_status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents, booked_at, notes, created_at, updated_at")
    .eq("user_id", input.userId)
    .eq("class_id", input.classId)
    .eq("student_id", input.studentId)
    .neq("booking_status", "cancelled")
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existingBooking && existingBooking.payment_status === "paid") {
    throw new Error("This student is already booked for the class.");
  }

  let booking = existingBooking as ClassBookingRecord | null;

  if (!booking) {
    const { data: insertedBooking, error: insertError } = await input.supabase
      .from("class_bookings")
      .insert({
        class_id: input.classId,
        user_id: input.userId,
        student_id: input.studentId,
        booking_status: "pending",
        payment_status: "pending",
        amount_paid_cents: classRow.price_cents
      })
      .select("id, class_id, user_id, student_id, booking_status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents, booked_at, notes, created_at, updated_at")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    booking = insertedBooking as ClassBookingRecord;
  }

  if (!booking) {
    throw new Error("Could not create the booking.");
  }

  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.userEmail ?? undefined,
    client_reference_id: booking.id,
    success_url: `${appUrl}/my-classes?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${appUrl}/classes/${input.classId}?canceled=1`,
    metadata: {
      bookingId: booking.id,
      classId: classRow.id,
      studentId: student.id,
      userId: input.userId
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: classRow.price_cents,
          product_data: {
            name: classRow.title,
            description: `${classRow.class_type} • ${student.name}`
          }
        }
      }
    ]
  });

  const { error: updateError } = await input.supabase
    .from("class_bookings")
    .update({
      stripe_checkout_session_id: session.id,
      booking_status: "pending",
      payment_status: "pending",
      updated_at: new Date().toISOString()
    })
    .eq("id", booking.id)
    .eq("user_id", input.userId);

  if (updateError) throw new Error(updateError.message);

  return {
    bookingId: booking.id,
    checkoutUrl: session.url
  };
}

export async function confirmClassBookingFromSession(input: {
  supabase: SupabaseClient;
  userId: string;
  sessionId: string;
  bookingId: string;
}) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
    expand: ["payment_intent"]
  });

  if (session.client_reference_id !== input.bookingId) {
    throw new Error("Checkout session does not match the booking.");
  }

  const { data: booking, error: bookingError } = await input.supabase
    .from("class_bookings")
    .select("id, class_id, user_id, student_id, booking_status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents, booked_at, notes, created_at, updated_at")
    .eq("user_id", input.userId)
    .eq("id", input.bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking) throw new Error("Booking not found.");

  if (booking.payment_status !== "paid" && session.payment_status === "paid") {
    const { data: classRow, error: classError } = await input.supabase
      .from("classes")
      .select("id, spots_remaining, status")
      .eq("id", booking.class_id)
      .maybeSingle();

    if (classError) throw new Error(classError.message);

    if (classRow) {
      const nextSpots = Math.max((classRow.spots_remaining ?? 1) - 1, 0);
      await input.supabase
        .from("classes")
        .update({
          spots_remaining: nextSpots,
          status: nextSpots === 0 ? "full" : classRow.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.class_id);
    }

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

    const { error: updateError } = await input.supabase
      .from("class_bookings")
      .update({
        booking_status: "confirmed",
        payment_status: "paid",
        stripe_payment_intent_id: paymentIntentId,
        amount_paid_cents: session.amount_total ?? booking.amount_paid_cents,
        updated_at: new Date().toISOString()
      })
      .eq("id", booking.id)
      .eq("user_id", input.userId);

    if (updateError) throw new Error(updateError.message);
  }

  return session;
}

export async function markClassAttended(input: {
  supabase: SupabaseClient;
  actingUserId: string;
  ownerUserId: string;
  bookingId: string;
  notes?: string;
  parentRating?: number;
}) {
  const { data: booking, error: bookingError } = await input.supabase
    .from("class_bookings")
    .select("id, class_id, user_id, student_id, booking_status, payment_status, stripe_checkout_session_id, stripe_payment_intent_id, amount_paid_cents, booked_at, notes, created_at, updated_at")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking || !booking.student_id) throw new Error("Booking not found.");

  if (booking.payment_status !== "paid") {
    throw new Error("Only paid bookings can be marked attended.");
  }

  const { data: existingCompletion, error: existingCompletionError } = await input.supabase
    .from("activity_completions")
    .select("id")
    .eq("user_id", booking.user_id)
    .eq("student_id", booking.student_id)
    .eq("class_booking_id", booking.id)
    .maybeSingle();

  if (existingCompletionError) throw new Error(existingCompletionError.message);

  if (existingCompletion) {
    const { error: bookingUpdateError } = await input.supabase
      .from("class_bookings")
      .update({
        booking_status: "attended",
        notes: input.notes?.trim() ? input.notes.trim() : booking.notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", booking.id);

    if (bookingUpdateError) throw new Error(bookingUpdateError.message);

    return { alreadyCompleted: true };
  }

  const { error: bookingUpdateError } = await input.supabase
    .from("class_bookings")
    .update({
      booking_status: "attended",
      notes: input.notes?.trim() ? input.notes.trim() : booking.notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", booking.id);

  if (bookingUpdateError) throw new Error(bookingUpdateError.message);

  return completeActivity({
    supabase: input.supabase,
    userId: booking.user_id,
    studentId: booking.student_id,
    classBookingId: booking.id,
    notes: input.notes,
    parentRating: input.parentRating
  });
}

export async function adminUpdateBookingStatus(input: {
  supabase: SupabaseClient;
  bookingId: string;
  action: "mark_no_show" | "cancel_booking" | "mark_refunded";
  notes?: string;
}) {
  const { data: booking, error: bookingError } = await input.supabase
    .from("class_bookings")
    .select("id, class_id, user_id, student_id, booking_status, payment_status, notes")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (bookingError) throw new Error(bookingError.message);
  if (!booking) throw new Error("Booking not found.");

  const { data: existingCompletion, error: completionError } = await input.supabase
    .from("activity_completions")
    .select("id")
    .eq("class_booking_id", booking.id)
    .maybeSingle();

  if (completionError) throw new Error(completionError.message);

  if (existingCompletion && input.action !== "mark_refunded") {
    throw new Error("This booking is already marked attended. Leave it attended so student progress stays accurate.");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    notes: input.notes?.trim() ? input.notes.trim() : booking.notes
  };

  if (input.action === "mark_no_show") {
    updates.booking_status = "no_show";
  }

  if (input.action === "cancel_booking") {
    updates.booking_status = "cancelled";
  }

  if (input.action === "mark_refunded") {
    updates.payment_status = "refunded";
    updates.booking_status = booking.booking_status === "attended" ? "attended" : "cancelled";
  }

  const { error: updateError } = await input.supabase
    .from("class_bookings")
    .update(updates)
    .eq("id", booking.id);

  if (updateError) throw new Error(updateError.message);

  return booking;
}
