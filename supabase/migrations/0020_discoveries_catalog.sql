create table if not exists public.discoveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid null references public.students(id) on delete set null,
  category text not null check (category in ('animals', 'bugs', 'trees', 'birds', 'fish', 'plants', 'mushrooms')),
  common_name text not null,
  scientific_name text null,
  confidence_level text not null check (confidence_level in ('low', 'medium', 'high')),
  image_url text not null,
  image_alt text null,
  notes text null,
  result_json jsonb not null default '{}'::jsonb,
  location_label text null,
  latitude double precision null,
  longitude double precision null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists discoveries_user_created_idx on public.discoveries (user_id, created_at desc);
create index if not exists discoveries_user_category_idx on public.discoveries (user_id, category);
create index if not exists discoveries_student_idx on public.discoveries (student_id);

alter table public.discoveries enable row level security;

drop policy if exists "discoveries_select_own" on public.discoveries;
create policy "discoveries_select_own"
on public.discoveries
for select
using (auth.uid() = user_id);

drop policy if exists "discoveries_insert_own" on public.discoveries;
create policy "discoveries_insert_own"
on public.discoveries
for insert
with check (auth.uid() = user_id);

drop policy if exists "discoveries_update_own" on public.discoveries;
create policy "discoveries_update_own"
on public.discoveries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "discoveries_delete_own" on public.discoveries;
create policy "discoveries_delete_own"
on public.discoveries
for delete
using (auth.uid() = user_id);
