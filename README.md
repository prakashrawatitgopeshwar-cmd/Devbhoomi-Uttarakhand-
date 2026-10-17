# DevBhoomi Himalayan Horizons — Admin Portal Starter

Next.js App Router + TypeScript + Tailwind UI scaffold. Not production-ready.

## Included
- Admin dashboard and login UI
- Homepage builder, districts, destinations, hotel applications, stays, packages, bookings, customers, moderation, settings and audit-log scaffolds
- Supabase migration and district seed need review before use

## Run locally
1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add Supabase project URL and publishable/anon key.
4. Run `npm run dev`; open `/admin/login`.

## Security
Authentication and DB authorization are not implemented. Review/test RLS before real data. Never expose service-role keys. No deployment has been performed.