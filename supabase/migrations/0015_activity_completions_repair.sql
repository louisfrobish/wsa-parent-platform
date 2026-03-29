create table if not exists public.activity_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  generation_id uuid null references public.generations(id) on delete set null,
  class_booking_id uuid null references public.class_bookings(id) on delete set null,
  activity_type text not null,
  title text not null,
  completed_at timestamptz not null default now(),
  notes text null,
  parent_rating integer null,
  created_at timestamptz not null default now()
);

alter table public.activity_completions
  add column if not exists title text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'activity_completions_parent_rating_check'
  ) then
    alter table public.activity_completions
      add constraint activity_completions_parent_rating_check
      check (parent_rating is null or parent_rating between 1 and 5);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'activity_completions_activity_type_check'
  ) then
    alter table public.activity_completions
      add constraint activity_completions_activity_type_check
      check (
        activity_type in (
          'daily_adventure',
          'animal_of_the_day',
          'week_planner',
          'lesson_generator',
          'in_person_class'
        )
      );
  end if;
end $$;

create index if not exists activity_completions_user_id_completed_at_idx
  on public.activity_completions (user_id, completed_at desc);

create index if not exists activity_completions_student_id_completed_at_idx
  on public.activity_completions (student_id, completed_at desc);

create unique index if not exists activity_completions_student_generation_unique_idx
  on public.activity_completions (student_id, generation_id)
  where generation_id is not null;

create unique index if not exists activity_completions_student_booking_unique_idx
  on public.activity_completions (student_id, class_booking_id)
  where class_booking_id is not null;

alter table public.activity_completions enable row level security;

drop policy if exists "activity completions owned by user" on public.activity_completions;
create policy "activity completions owned by user"
on public.activity_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
