alter table public.generations
  add column if not exists kind text;

update public.generations
set kind = coalesce(kind, tool_type)
where kind is null;

alter table public.generations
  alter column kind set not null;

alter table public.generations
  drop constraint if exists generations_kind_check;

alter table public.generations
  add constraint generations_kind_check
  check (
    kind in (
      'animal_of_the_day',
      'fish_of_the_day',
      'plant_of_the_day',
      'bird_of_the_day',
      'week_plan',
      'daily_adventure',
      'lesson',
      'unknown'
    )
  );

alter table public.generations
  drop constraint if exists generations_tool_type_check;

alter table public.generations
  add constraint generations_tool_type_check
  check (
    tool_type in (
      'animal_of_the_day',
      'fish_of_the_day',
      'plant_of_the_day',
      'bird_of_the_day',
      'week_plan',
      'daily_adventure',
      'lesson',
      'unknown'
    )
  );
