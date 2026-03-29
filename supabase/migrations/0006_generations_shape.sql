alter table public.generations add column if not exists student_id uuid references public.students(id) on delete set null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'generations' and column_name = 'kind'
  ) then
    alter table public.generations rename column kind to tool_type;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'generations' and column_name = 'input'
  ) then
    alter table public.generations rename column input to input_json;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'generations' and column_name = 'output'
  ) then
    alter table public.generations rename column output to output_json;
  end if;
end $$;

alter table public.generations alter column tool_type set not null;
alter table public.generations alter column input_json set not null;
alter table public.generations alter column output_json set not null;

drop index if exists generations_user_id_created_at_idx;
create index if not exists generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);

create index if not exists generations_student_id_created_at_idx
  on public.generations (student_id, created_at desc);
