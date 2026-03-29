alter table public.profiles
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists is_admin boolean not null default false;

alter table public.classes
  add column if not exists internal_notes text;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'class_bookings'
      and constraint_name = 'class_bookings_booking_status_check'
  ) then
    alter table public.class_bookings
      drop constraint class_bookings_booking_status_check;
  end if;
end $$;

alter table public.class_bookings
  add constraint class_bookings_booking_status_check
  check (booking_status in ('pending', 'confirmed', 'attended', 'waitlisted', 'cancelled', 'no_show'));

create or replace function public.is_admin_user(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = check_user_id
      and profiles.is_admin = true
  );
$$;

drop policy if exists "profiles are readable by owner" on public.profiles;
create policy "profiles readable by owner or admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "profiles are updatable by owner" on public.profiles;
create policy "profiles updatable by owner or admin"
on public.profiles for update
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

create policy "students manageable by admin"
on public.students for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "classes manageable by admin"
on public.classes for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "class bookings manageable by admin"
on public.class_bookings for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "activity completions manageable by admin"
on public.activity_completions for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "student badges manageable by admin"
on public.student_badges for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy "student achievements manageable by admin"
on public.student_achievements for all
using (public.is_admin_user())
with check (public.is_admin_user());
