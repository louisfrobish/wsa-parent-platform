create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_type text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  age_min integer check (age_min is null or age_min >= 0),
  age_max integer check (age_max is null or age_max >= age_min),
  price_cents integer not null default 0 check (price_cents >= 0),
  max_capacity integer not null check (max_capacity >= 0),
  spots_remaining integer not null check (spots_remaining >= 0 and spots_remaining <= max_capacity),
  what_to_bring text,
  weather_note text,
  waiver_required boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'full', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'waitlisted', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_paid_cents integer not null default 0 check (amount_paid_cents >= 0),
  booked_at timestamptz not null default now(),
  notes text
);

create index if not exists classes_date_status_idx
  on public.classes (date, status);

create index if not exists class_bookings_user_id_booked_at_idx
  on public.class_bookings (user_id, booked_at desc);

create index if not exists class_bookings_class_id_idx
  on public.class_bookings (class_id, booking_status);

alter table public.classes enable row level security;
alter table public.class_bookings enable row level security;

drop policy if exists "classes readable by authenticated users" on public.classes;
create policy "classes readable by authenticated users"
on public.classes for select
using (auth.uid() is not null);

drop policy if exists "class bookings owned by user" on public.class_bookings;
create policy "class bookings owned by user"
on public.class_bookings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
