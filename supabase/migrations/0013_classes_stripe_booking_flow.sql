alter table public.class_bookings
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists class_bookings_student_class_unique_idx
  on public.class_bookings (class_id, student_id)
  where student_id is not null and booking_status <> 'cancelled';

create unique index if not exists class_bookings_checkout_session_unique_idx
  on public.class_bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;
