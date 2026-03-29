create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text,
  category text not null,
  earning_criteria text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (student_id, badge_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  earning_criteria text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (student_id, achievement_id)
);

create index if not exists student_badges_student_id_idx on public.student_badges (student_id, earned_at desc);
create index if not exists student_achievements_student_id_idx on public.student_achievements (student_id, earned_at desc);

alter table public.badges enable row level security;
alter table public.student_badges enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;

drop policy if exists "badges readable by authenticated users" on public.badges;
create policy "badges readable by authenticated users"
on public.badges for select
using (auth.uid() is not null);

drop policy if exists "achievements readable by authenticated users" on public.achievements;
create policy "achievements readable by authenticated users"
on public.achievements for select
using (auth.uid() is not null);

drop policy if exists "student badges owned by user" on public.student_badges;
create policy "student badges owned by user"
on public.student_badges for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "student achievements owned by user" on public.student_achievements;
create policy "student achievements owned by user"
on public.student_achievements for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.badges (name, description, icon, category, earning_criteria)
values
  ('Bird Tracker', 'Earned by returning to birds again and again with careful observation.', 'Bird', 'Wildlife', 'Complete 3 bird-related adventures.'),
  ('River Explorer', 'Earned by noticing moving water, river life, and streamside patterns.', 'River', 'Water', 'Complete 3 river or water-related adventures.'),
  ('Forest Scout', 'Earned by exploring tree cover, woodland habitats, and forest signs.', 'Forest', 'Habitats', 'Complete 3 forest-related adventures.'),
  ('Night Naturalist', 'Earned by noticing nature after sunset or learning about nocturnal life.', 'Moon', 'Time of Day', 'Complete a night or nocturnal-themed adventure.'),
  ('Pond Observer', 'Earned by studying pond life, amphibians, and calm-water habitats.', 'Pond', 'Water', 'Complete 3 pond or amphibian-related adventures.'),
  ('Weather Watcher', 'Earned by tracking sky patterns, seasons, and changing conditions.', 'Cloud', 'Weather', 'Complete 3 weather or observation-themed adventures.'),
  ('Trail Explorer', 'Earned by building a steady habit of outdoor homeschool adventures.', 'Boot', 'Progress', 'Complete 5 total adventures.'),
  ('Knot Apprentice', 'Earned by completing a knot or outdoor-skills themed activity.', 'Rope', 'Skills', 'Complete a knot or outdoor-skills activity.')
on conflict (name) do update
set description = excluded.description,
    icon = excluded.icon,
    category = excluded.category,
    earning_criteria = excluded.earning_criteria;

insert into public.achievements (key, name, description, earning_criteria)
values
  ('first_adventure', 'First Adventure', 'Completed the first marked adventure.', 'Complete 1 adventure.'),
  ('five_adventures', 'Five Adventures', 'Built steady momentum with five completed adventures.', 'Complete 5 adventures.'),
  ('ten_adventures', 'Ten Adventures', 'Reached a strong adventure streak with ten completions.', 'Complete 10 adventures.'),
  ('first_bird_study', 'First Bird Study', 'Completed the first bird-related learning activity.', 'Complete 1 bird-related adventure.'),
  ('first_journal_page', 'First Journal Page', 'Completed a learning activity that included a journal reflection.', 'Complete the first adventure with a journal prompt.'),
  ('first_printable_lesson', 'First Printable Lesson', 'Created the first printable lesson-style item.', 'Save a week plan or lesson generator output.'),
  ('completed_week_plan', 'Week Planner Ready', 'Created the first homeschool week plan.', 'Generate a week planner.'),
  ('earned_first_badge', 'First Badge Earned', 'Earned the first student badge.', 'Earn 1 badge.')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    earning_criteria = excluded.earning_criteria;
