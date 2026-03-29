alter table public.activity_completions
  add column if not exists title text,
  add column if not exists created_at timestamptz not null default now();

update public.activity_completions
set title = coalesce(
  title,
  (
    select generations.title
    from public.generations
    where generations.id = activity_completions.generation_id
  ),
  (
    select classes.title
    from public.class_bookings
    join public.classes on classes.id = class_bookings.class_id
    where class_bookings.id = activity_completions.class_booking_id
  ),
  'Completed activity'
)
where title is null;

alter table public.activity_completions
  alter column title set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'activity_completions'
      and constraint_name = 'activity_completions_activity_type_check'
  ) then
    alter table public.activity_completions
      drop constraint activity_completions_activity_type_check;
  end if;
end $$;

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

create unique index if not exists activity_completions_student_generation_unique_idx
  on public.activity_completions (student_id, generation_id)
  where generation_id is not null;
