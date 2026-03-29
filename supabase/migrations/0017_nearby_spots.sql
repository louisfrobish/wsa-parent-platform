create table if not exists public.nearby_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  spot_type text not null,
  location_label text not null,
  latitude double precision,
  longitude double precision,
  habitat_tags text[] not null default '{}'::text[],
  activity_tags text[] not null default '{}'::text[],
  description text,
  family_friendly boolean not null default true,
  fishing_relevant boolean not null default false,
  birding_relevant boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists nearby_spots_spot_type_idx on public.nearby_spots (spot_type);
create index if not exists nearby_spots_location_label_idx on public.nearby_spots (location_label);

alter table public.nearby_spots enable row level security;

drop policy if exists "nearby spots authenticated read" on public.nearby_spots;
create policy "nearby spots authenticated read"
on public.nearby_spots for select
using (auth.role() = 'authenticated');

insert into public.nearby_spots
  (name, spot_type, location_label, latitude, longitude, habitat_tags, activity_tags, description, family_friendly, fishing_relevant, birding_relevant, notes)
values
  (
    'Gilbert Run Park Lake',
    'lake_access',
    'Charlotte Hall, MD',
    38.4705,
    -76.7897,
    array['lake','woodland','park'],
    array['fishing','birding','family_walk'],
    'A calm freshwater lake with family-friendly access and easy shoreline scouting.',
    true,
    true,
    true,
    'Good for easy fishing missions, turtles, and quiet bird observation.'
  ),
  (
    'Myrtle Point Park',
    'shoreline',
    'California, MD',
    38.3066,
    -76.5306,
    array['shoreline','river','marsh'],
    array['fishing','birding','shore_walk'],
    'Patuxent River shoreline access with open views and family walking areas.',
    true,
    true,
    true,
    'Useful for osprey, heron, shoreline scouting, and breezy evening fishing windows.'
  ),
  (
    'St. Mary''s River State Park',
    'lake_access',
    'Lexington Park, MD',
    38.2468,
    -76.4727,
    array['lake','woods','trail'],
    array['fishing','trail','birding'],
    'Reservoir and wooded trail system with family nature-study potential.',
    true,
    true,
    true,
    'Good mixed-use spot for fish observation, forest edges, and bird missions.'
  ),
  (
    'Calvert Cliffs State Park',
    'wooded_trail',
    'Lusby, MD',
    38.3814,
    -76.3951,
    array['woods','shoreline','meadow'],
    array['trail','birding','general_nature'],
    'A longer family field outing with forest trail, meadow edges, and shoreline habitat.',
    true,
    false,
    true,
    'Best for weekend adventure energy, birding, and habitat variety.'
  ),
  (
    'Battle Creek Cypress Swamp',
    'marsh',
    'Prince Frederick, MD',
    38.5643,
    -76.6117,
    array['wetland','marsh','boardwalk'],
    array['birding','amphibians','nature_walk'],
    'Boardwalk wetland habitat with strong frog, marsh bird, and insect-study potential.',
    true,
    false,
    true,
    'Good after damp weather for frogs, dragonflies, and careful wetland observation.'
  ),
  (
    'Jefferson Patterson Park',
    'meadow',
    'St. Leonard, MD',
    38.4402,
    -76.5008,
    array['meadow','shoreline','woods'],
    array['birding','butterflies','family_walk'],
    'Open meadow edges and shoreline habitat with good space for kids to observe and journal.',
    true,
    false,
    true,
    'Strong butterfly, meadow bird, and pollinator spot on fair-weather days.'
  ),
  (
    'Leonardtown Wharf',
    'river_access',
    'Leonardtown, MD',
    38.2918,
    -76.6353,
    array['river','shoreline','town_waterfront'],
    array['fishing','shoreline_observation','birding'],
    'An easy-access waterfront for short evening scouting or simple fishing missions.',
    true,
    true,
    true,
    'Useful for quick missions when families want easy parking and short walking distance.'
  ),
  (
    'Port Tobacco River Park',
    'river_access',
    'Port Tobacco, MD',
    38.5077,
    -77.0395,
    array['river','woods','wetland'],
    array['fishing','birding','tracking'],
    'River and wooded habitat with a mix of shoreline signs and quiet nature-study options.',
    true,
    true,
    true,
    'Good for tracking, river-edge study, and family fishing scouting.'
  ),
  (
    'Solomons Boardwalk',
    'shoreline',
    'Solomons, MD',
    38.3226,
    -76.4527,
    array['shoreline','harbor','river'],
    array['fishing','birding','observation'],
    'Accessible waterfront with easy observation points and short mission potential.',
    true,
    true,
    true,
    'Helpful when the family wants a compact shoreline mission with open views.'
  ),
  (
    'Chapel Point State Park',
    'creek',
    'Bel Alton, MD',
    38.4711,
    -76.9801,
    array['creek','woodland','marsh'],
    array['fishing','birding','trail'],
    'Quiet creek and marsh habitat with strong fishing and bird-study possibilities.',
    true,
    true,
    true,
    'A strong fit for creek-edge fishing and wetland observation.'
  )
on conflict do nothing;
