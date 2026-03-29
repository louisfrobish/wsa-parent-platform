# WSA Parent Platform

Production-ready scaffold for a Wild Stallion Academy family portal.

## What is included

- `Next.js` app router project for the web UI
- `Supabase Auth` for secure account creation and session management
- `Supabase Postgres` tables for profiles, waivers, photos, and tree identifications
- `Supabase Storage` buckets for class photos and leaf photos
- `OpenAI Responses API` route for AI-assisted leaf identification from photos and field notes
- `NWS / NOAA`, `USGS Water Data`, and local spot adapters for more practical outdoor recommendations

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase and OpenAI keys.
4. Create a Supabase project and run the SQL migrations in order, including the newer nearby spots seed at [0017_nearby_spots.sql](C:\Users\louis\OneDrive\Desktop\WSA\wsa-parent-platform\supabase\migrations\0017_nearby_spots.sql).
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Environmental context setup

- `WSA_ENV_DATA_USER_AGENT` should be set to a real app/user-agent string with a contact email for NWS requests.
- `WSA_DEFAULT_REGION` can stay `Southern Maryland` unless you want a different local fallback.
- Animal of the Day and Fishing adventures now use:
  - live `NWS / NOAA` forecast and alert context when coordinates are available
  - live `USGS Water Data` gage context when a nearby stream gage is available
  - seeded local `nearby_spots` data for family-friendly place recommendations
  - official `Maryland DNR` resource links and seasonal fishing-access context
  - a `BirdCast`-style migration adapter that is currently seasonal/contextual rather than a hard real-time API dependency

If one source is unavailable, the app falls back to saved local spots and internal guidance instead of failing the whole recommendation flow.

## Production notes

- Waivers are persisted in Postgres instead of browser storage.
- Auth is handled by Supabase, so passwords are not stored in app code.
- Photos and leaf uploads are stored in object storage with path-based policies.
- The leaf ID endpoint uses the OpenAI API server-side so the API key stays private.

## Recommended next steps

- Add admin roles for instructors to review waivers and moderate galleries.
- Add signed URL delivery if you want private family galleries.
- Add consent toggles for photo sharing and marketing reuse.
- Add webhook-based audit logging for waiver changes.
- Add automated tests and CI once dependencies are installed.
