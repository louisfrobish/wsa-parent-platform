alter table public.generations drop constraint if exists generations_kind_check;

alter table public.generations
  add constraint generations_kind_check
  check (tool_type in ('lesson', 'animal_of_the_day', 'week_plan', 'daily_adventure', 'fish_of_the_day'));
