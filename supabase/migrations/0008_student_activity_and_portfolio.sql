alter table public.badges add column if not exists criteria_json jsonb not null default '{}'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'badges' and column_name = 'earning_criteria'
  ) then
    update public.badges
    set criteria_json = jsonb_build_object('legacy_criteria', earning_criteria)
    where criteria_json = '{}'::jsonb;

    alter table public.badges drop column earning_criteria;
  end if;
end $$;

alter table public.student_badges
  drop column if exists user_id,
  add column if not exists source_generation_id uuid references public.generations(id) on delete set null,
  add column if not exists source_booking_id uuid references public.class_bookings(id) on delete set null;

create table if not exists public.activity_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  generation_id uuid references public.generations(id) on delete set null,
  class_booking_id uuid references public.class_bookings(id) on delete set null,
  activity_type text not null,
  completed_at timestamptz not null default now(),
  notes text,
  parent_rating integer check (parent_rating is null or parent_rating between 1 and 5),
  check (generation_id is not null or class_booking_id is not null)
);

create index if not exists activity_completions_student_id_completed_at_idx
  on public.activity_completions (student_id, completed_at desc);

create index if not exists activity_completions_user_id_completed_at_idx
  on public.activity_completions (user_id, completed_at desc);

alter table public.activity_completions enable row level security;

drop policy if exists "activity completions owned by user" on public.activity_completions;
create policy "activity completions owned by user"
on public.activity_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  completion_id uuid references public.activity_completions(id) on delete set null,
  title text not null,
  entry_type text not null,
  summary text,
  parent_note text,
  artifact_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_entries_student_id_created_at_idx
  on public.portfolio_entries (student_id, created_at desc);

alter table public.portfolio_entries enable row level security;

drop policy if exists "portfolio entries owned by student parent" on public.portfolio_entries;
create policy "portfolio entries owned by student parent"
on public.portfolio_entries for all
using (
  exists (
    select 1
    from public.students
    where students.id = portfolio_entries.student_id
      and students.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.students
    where students.id = portfolio_entries.student_id
      and students.user_id = auth.uid()
  )
);
