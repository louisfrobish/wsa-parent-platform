create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  household_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_name text not null,
  emergency_contact text not null,
  medical_notes text,
  signature_name text not null,
  signed_at timestamptz not null default now()
);

create table if not exists public.photo_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  caption text,
  image_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tree_identifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  species_name text not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  notes text,
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.waivers enable row level security;
alter table public.photo_assets enable row level security;
alter table public.tree_identifications enable row level security;

create policy "profiles are readable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are writable by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id);

create policy "waivers owned by user"
on public.waivers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "photo assets owned by user"
on public.photo_assets for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tree ids owned by user"
on public.tree_identifications for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('class-photos', 'class-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('leaf-photos', 'leaf-photos', true)
on conflict (id) do nothing;

create policy "users upload class photos"
on storage.objects for insert
with check (bucket_id = 'class-photos' and auth.uid()::text = split_part(name, '/', 1));

create policy "users read class photos"
on storage.objects for select
using (bucket_id = 'class-photos');

create policy "users upload leaf photos"
on storage.objects for insert
with check (bucket_id = 'leaf-photos' and auth.uid()::text = split_part(name, '/', 1));

create policy "users read leaf photos"
on storage.objects for select
using (bucket_id = 'leaf-photos');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, household_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'household_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
