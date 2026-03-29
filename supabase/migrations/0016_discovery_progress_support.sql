do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'activity_completions'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%generation_id is not null or class_booking_id is not null%'
  loop
    execute format('alter table public.activity_completions drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.activity_completions
  drop constraint if exists activity_completions_activity_type_check;

alter table public.activity_completions
  add constraint activity_completions_activity_type_check
  check (
    activity_type in (
      'daily_adventure',
      'animal_of_the_day',
      'week_planner',
      'lesson_generator',
      'nature_discovery',
      'in_person_class'
    )
  );

insert into public.badges (name, description, category, icon, criteria_json)
values
  ('First Discovery', 'Save the first Wild Stallion Academy discovery for this student.', 'milestone', 'Compass', '{"discoveryCount":1}'::jsonb),
  ('Bird Spotter', 'Save 3 bird-related discoveries.', 'wildlife', 'Bird', '{"discoveryCategory":"bird","count":3}'::jsonb),
  ('Butterfly Finder', 'Save 3 butterfly or insect discoveries.', 'wildlife', 'Butterfly', '{"discoveryCategory":"insect","count":3}'::jsonb),
  ('Track Detective', 'Save 3 discoveries related to tracks, prints, or other animal signs.', 'tracking', 'Tracks', '{"discoveryCategory":"track","count":3}'::jsonb),
  ('Leaf Explorer', 'Save 3 leaf or plant discoveries.', 'plants', 'Leaf', '{"discoveryCategory":"leaf","count":3}'::jsonb),
  ('Pond Watcher', 'Save 3 pond, amphibian, or wetland discoveries.', 'habitat', 'Pond', '{"discoveryCategory":"pond","count":3}'::jsonb),
  ('Backyard Naturalist', 'Save 5 discoveries total for this student.', 'progress', 'Journal', '{"discoveryCount":5}'::jsonb)
on conflict (name) do update
set description = excluded.description,
    category = excluded.category,
    icon = excluded.icon,
    criteria_json = excluded.criteria_json;

insert into public.achievements (key, name, description, earning_criteria)
values
  ('first_discovery', 'First Discovery', 'Saved the first discovery entry for this student.', 'Save 1 nature discovery.')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    earning_criteria = excluded.earning_criteria;
