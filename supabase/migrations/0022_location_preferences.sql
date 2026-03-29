alter table public.profiles
  add column if not exists location_mode text not null default 'zipcode',
  add column if not exists home_zipcode text,
  add column if not exists home_lat double precision,
  add column if not exists home_lng double precision,
  add column if not exists current_lat double precision,
  add column if not exists current_lng double precision,
  add column if not exists location_label text,
  add column if not exists search_radius_miles integer not null default 25;

update public.profiles
set
  location_mode = coalesce(location_mode, 'zipcode'),
  search_radius_miles = coalesce(search_radius_miles, 25)
where location_mode is null or search_radius_miles is null;

alter table public.profiles
  alter column location_mode set default 'zipcode',
  alter column search_radius_miles set default 25,
  alter column location_mode set not null,
  alter column search_radius_miles set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_location_mode_check'
  ) then
    alter table public.profiles
      drop constraint profiles_location_mode_check;
  end if;
end $$;

alter table public.profiles
  add constraint profiles_location_mode_check
  check (location_mode in ('zipcode', 'current'));

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_search_radius_miles_check'
  ) then
    alter table public.profiles
      drop constraint profiles_search_radius_miles_check;
  end if;
end $$;

alter table public.profiles
  add constraint profiles_search_radius_miles_check
  check (search_radius_miles in (10, 25, 50));
