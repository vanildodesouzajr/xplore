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
- **Curated game content lives in `content/games/<slug>.json`** and is synced with
  `scripts/games/sync.mjs` (npm: `games:export` / `games:import`). This is the official way
  to add or edit a seeded game — never re‑create one by hand. Each category/item carries a
  stable `key`; the importer upserts by `(parent, key)`, so ids (and therefore
  `user_*_progress`) survive re‑imports. `key` is **frozen** once assigned: edit titles
  freely, never edit keys. Always `games:import -- <slug> --dry-run` first; `--prune` deletes
  DB rows absent from the file (destructive — removes their user progress).
- **Editing curated content in place** (don't re‑create a seeded game) preserves users'
  progress — re‑creating changes the row ids and wipes existing `user_*_progress`.
- **Per‑step images**: `checklist_items.image_url` (nullable) holds an optional image for a
  step. Files live in the public Storage bucket `checklist-images` under
  `{uid}/{gameId}/{itemId}/…` (storage RLS restricts writes to the owner's uid folder).
  Upload is **client‑side** via the browser client (`item-image.tsx`) because Server Actions
  cap bodies at ~1MB; the resulting public URL is persisted by `setItemImageAction`. The
  importer only touches `image_url` when a content file explicitly includes the field, so
  UI‑uploaded images survive `games:import`.
