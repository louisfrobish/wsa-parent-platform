alter table public.discoveries
  add column if not exists request_fingerprint text;

create unique index if not exists discoveries_user_request_fingerprint_unique_idx
  on public.discoveries (user_id, request_fingerprint)
  where request_fingerprint is not null;

alter table public.activity_completions
  add column if not exists source_discovery_id uuid references public.discoveries(id) on delete set null;

create unique index if not exists activity_completions_source_discovery_unique_idx
  on public.activity_completions (source_discovery_id)
  where source_discovery_id is not null;

alter table public.portfolio_entries
  add column if not exists source_discovery_id uuid references public.discoveries(id) on delete set null;

create unique index if not exists portfolio_entries_source_discovery_unique_idx
  on public.portfolio_entries (source_discovery_id)
  where source_discovery_id is not null;
