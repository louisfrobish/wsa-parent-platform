create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age >= 3 and age <= 18),
  interests text[] not null default '{}'::text[],
  current_rank text not null default 'Colt' check (current_rank in ('Colt', 'Bronco', 'Mustang', 'Stallion')),
  completed_adventures_count integer not null default 0 check (completed_adventures_count >= 0),
  earned_badges text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists students_user_id_created_at_idx
  on public.students (user_id, created_at desc);

create table if not exists public.student_adventure_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, generation_id)
);

create index if not exists student_adventure_completions_student_id_idx
  on public.student_adventure_completions (student_id, completed_at desc);

alter table public.students enable row level security;
alter table public.student_adventure_completions enable row level security;

drop policy if exists "students owned by user" on public.students;
create policy "students owned by user"
on public.students for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "student adventure completions owned by user" on public.student_adventure_completions;
create policy "student adventure completions owned by user"
on public.student_adventure_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
