create table if not exists public.portfolio_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  related_completion_id uuid references public.activity_completions(id) on delete set null,
  related_generation_id uuid references public.generations(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_notes_student_id_created_at_idx
  on public.portfolio_notes (student_id, created_at desc);

alter table public.portfolio_notes enable row level security;

drop policy if exists "portfolio notes owned by user" on public.portfolio_notes;
create policy "portfolio notes owned by user"
on public.portfolio_notes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
