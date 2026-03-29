alter table public.waivers
  add column if not exists student_id uuid references public.students(id) on delete set null,
  add column if not exists waiver_type text not null default 'general',
  add column if not exists accepted_at timestamptz not null default now(),
  add column if not exists signature_data text,
  add column if not exists version text not null default '1.0';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'waivers' and column_name = 'signed_at'
  ) then
    update public.waivers
    set accepted_at = signed_at
    where accepted_at is null;

    alter table public.waivers drop column signed_at;
  end if;
end $$;

create index if not exists waivers_user_id_accepted_at_idx
  on public.waivers (user_id, accepted_at desc);

create index if not exists waivers_student_id_accepted_at_idx
  on public.waivers (student_id, accepted_at desc);
