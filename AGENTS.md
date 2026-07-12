<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions (Xplore)

Xplore is a bilingual game‑completion checklist tracker (Next.js 16 + Supabase). See
`README.md` for the full overview. When working in this repo:

- **Middleware is `proxy.ts`** at the repo root (Next 16 rename). Auth gating lives in
  `src/lib/supabase/proxy.ts`. Keep `/api`, `sw.js`, and `manifest.webmanifest` out of the
  login‑redirect path.
- **Supabase clients**: `src/lib/supabase/server.ts` (Server Components/actions, RLS),
  `client.ts` (browser), and `admin.ts` (`SUPABASE_SECRET_KEY`, **server‑only**, bypasses
  RLS — never import into a client component).
- **i18n is mandatory for user‑facing text.** UI strings go in `src/i18n/dictionaries/{en,pt}.ts`
  (`en.ts` is the type source of truth). Server pages call `getLocale()` + `getDictionary()`
  and pass strings to client components as props. Localizable **content** is stored in JSONB
  `*_i18n` columns and read with `pick(row.field_i18n, locale, row.field)`. New content writes
  should set both the plain fallback column and `{ [locale]: value }`.
- **Migrations**: add SQL to `supabase/migrations/` and apply with
  `supabase db push --linked`. Keep `src/types/supabase.ts` in sync by hand.
- **Verify before shipping**: `npx tsc --noEmit`, `npm run lint`, `npm run build` must pass.
- **Editing curated content in place** (don't re‑create a seeded game) preserves users'
  progress — re‑creating changes the row ids and wipes existing `user_*_progress`.
