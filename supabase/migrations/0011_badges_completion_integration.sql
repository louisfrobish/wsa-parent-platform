alter table public.student_badges
  add column if not exists source_completion_id uuid references public.activity_completions(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

alter table public.student_achievements
  add column if not exists created_at timestamptz not null default now();

drop policy if exists "student badges owned by user" on public.student_badges;
create policy "student badges owned by student parent"
on public.student_badges for all
using (
  exists (
    select 1
    from public.students
    where students.id = student_badges.student_id
      and students.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.students
    where students.id = student_badges.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "student achievements owned by user" on public.student_achievements;
create policy "student achievements owned by student parent"
on public.student_achievements for all
using (
  exists (
    select 1
    from public.students
    where students.id = student_achievements.student_id
      and students.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.students
    where students.id = student_achievements.student_id
      and students.user_id = auth.uid()
  )
);

insert into public.badges (name, description, category, icon, criteria_json)
values
  ('Bird Tracker', 'Complete 3 bird-related adventures.', 'wildlife', 'Feather', '{"keywords":["bird","owl","hawk","eagle","sparrow","robin","feather"],"count":3}'::jsonb),
  ('River Explorer', 'Complete 3 water-related adventures.', 'habitat', 'River', '{"keywords":["river","stream","creek","water","shore","wetland"],"count":3}'::jsonb),
  ('Forest Scout', 'Complete 3 forest-related adventures.', 'habitat', 'Pine', '{"keywords":["forest","tree","woodland","pine","oak","trail"],"count":3}'::jsonb),
  ('Pond Observer', 'Complete 3 pond, amphibian, or wetland-related adventures.', 'wildlife', 'Frog', '{"keywords":["pond","frog","toad","amphibian","wetland","tadpole"],"count":3}'::jsonb),
  ('Trail Explorer', 'Complete 5 total adventures.', 'progress', 'Boot', '{"totalCompletions":5}'::jsonb),
  ('Weather Watcher', 'Complete 3 weather or observation-themed activities.', 'observation', 'Cloud', '{"keywords":["weather","cloud","rain","wind","storm","sunny","forecast","season","observe","observation"],"count":3}'::jsonb),
  ('First Adventure', 'Complete your first Wild Stallion Academy adventure.', 'milestone', 'Compass', '{"totalCompletions":1}'::jsonb)
on conflict (name) do update
set description = excluded.description,
    category = excluded.category,
    icon = excluded.icon,
    criteria_json = excluded.criteria_json;

insert into public.achievements (key, name, description, earning_criteria)
values
  ('first_adventure', 'First Adventure', 'Completed the first marked activity for this student.', 'Complete 1 student-linked activity.'),
  ('five_adventures', '5 Adventures Completed', 'Built strong momentum with five completed adventures.', 'Complete 5 student-linked adventures.'),
  ('ten_adventures', '10 Adventures Completed', 'Reached a steady trail of ten completed adventures.', 'Complete 10 student-linked adventures.'),
  ('first_bird_study', 'First Bird Study', 'Completed the first bird-related activity.', 'Complete the first bird-related activity.'),
  ('first_journal_reflection', 'First Journal Reflection', 'Completed an activity with a journal reflection prompt.', 'Complete an activity that includes a journal prompt.'),
  ('first_in_person_class', 'First In-Person Class', 'Completed the first Wild Stallion Academy class.', 'Complete 1 in-person class booking.'),
  ('earned_first_badge', 'First Badge Earned', 'Earned the first badge.', 'Earn 1 badge.')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    earning_criteria = excluded.earning_criteria;
