// Games content sync — the official pipeline for curated checklists.
//
//   node --env-file=.env.local scripts/games/sync.mjs export <slug>
//   node --env-file=.env.local scripts/games/sync.mjs import [<slug>] [--dry-run] [--prune]
//
// or via package.json:
//
//   npm run games:export -- <slug>
//   npm run games:import -- [<slug>] [--dry-run] [--prune]
//
// A game lives in content/games/<slug>.json as { slug, title, title_i18n,
// platform, cover_url, categories: [{ key, title, title_i18n, items: [...] }] }.
// Order is implicit from array position. Each category/item carries a stable
// `key`: the importer matches DB rows by (parent, key), so re-importing updates
// rows in place — ids stay put and user_*_progress is preserved. `key` is
// FROZEN once assigned; edit titles freely, never edit keys.
//
// Uses SUPABASE_SECRET_KEY (service role, bypasses RLS) — server-side only.

import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../../content/games");

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    fail(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
        "Run through npm (which passes --env-file=.env.local) or set them yourself."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

// Slug for keys: strip diacritics, lowercase, collapse to hyphens, cap length.
function toKey(text) {
  const base = String(text ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return base || "item";
}

// Assign unique keys within a parent, remembering ones already taken.
function uniqueKey(base, taken) {
  let key = base;
  let n = 2;
  while (taken.has(key)) key = `${base}-${n++}`;
  taken.add(key);
  return key;
}

const eng = (i18n, fallback) =>
  (i18n && typeof i18n === "object" && i18n.en) || fallback || "";

// ---------------------------------------------------------------------------
// export: DB -> content/games/<slug>.json (read-only)
// ---------------------------------------------------------------------------
async function exportGame(slug) {
  if (!slug) fail("Usage: games:export -- <slug>");
  const db = client();

  const { data: game, error: gErr } = await db
    .from("games")
    .select("id, slug, title, title_i18n, platform, cover_url, created_by")
    .eq("slug", slug)
    .maybeSingle();
  if (gErr) fail(gErr.message);
  if (!game) fail(`No game with slug "${slug}".`);

  // export is a bootstrap/recovery tool: it regenerates stable keys from English
  // titles (deterministic) rather than reading the `key` column, so it works
  // even before the stable-keys migration is applied. After bootstrap the
  // content file is authoritative — edit it, don't re-export.
  const { data: cats, error: cErr } = await db
    .from("checklist_categories")
    .select("id, title, title_i18n, order_index")
    .eq("game_id", game.id)
    .order("order_index");
  if (cErr) fail(cErr.message);

  const catIds = cats.map((c) => c.id);
  const { data: items, error: iErr } = catIds.length
    ? await db
        .from("checklist_items")
        .select(
          "id, category_id, title, title_i18n, description, description_i18n, image_url, order_index"
        )
        .in("category_id", catIds)
        .order("order_index")
    : { data: [], error: null };
  if (iErr) fail(iErr.message);

  const catKeys = new Set();
  const categories = cats.map((c) => {
    const itemKeys = new Set();
    const catItems = items
      .filter((it) => it.category_id === c.id)
      .map((it) => ({
        key: uniqueKey(toKey(eng(it.title_i18n, it.title)), itemKeys),
        title: it.title,
        title_i18n: it.title_i18n ?? {},
        description: it.description ?? null,
        description_i18n: it.description_i18n ?? {},
        // Only emit when set, so image-less games stay clean in the file.
        ...(it.image_url ? { image_url: it.image_url } : {}),
      }));
    return {
      key: uniqueKey(toKey(eng(c.title_i18n, c.title)), catKeys),
      title: c.title,
      title_i18n: c.title_i18n ?? {},
      items: catItems,
    };
  });

  const doc = {
    slug: game.slug,
    title: game.title,
    title_i18n: game.title_i18n ?? {},
    platform: game.platform,
    cover_url: game.cover_url ?? null,
    created_by: game.created_by ?? null,
    categories,
  };

  await mkdir(CONTENT_DIR, { recursive: true });
  const out = path.join(CONTENT_DIR, `${game.slug}.json`);
  await writeFile(out, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const itemCount = categories.reduce((n, c) => n + c.items.length, 0);
  console.log(
    `✓ Exported "${game.slug}" — ${categories.length} categories, ${itemCount} items`
  );
  console.log(`  → ${path.relative(process.cwd(), out)}`);
}

// ---------------------------------------------------------------------------
// import: content/games/*.json -> DB (idempotent upsert by key)
// ---------------------------------------------------------------------------
async function importGames(slug, { dryRun, prune }) {
  const db = client();
  const files = slug
    ? [path.join(CONTENT_DIR, `${slug}.json`)]
    : (await readdir(CONTENT_DIR).catch(() => []))
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.join(CONTENT_DIR, f));

  if (!files.length) fail(`No content files found in ${CONTENT_DIR}.`);

  const tally = { games: 0, catIns: 0, catUpd: 0, itemIns: 0, itemUpd: 0, orphans: 0 };
  const mark = dryRun ? "(dry-run) would" : "";

  for (const file of files) {
    if (!existsSync(file)) fail(`Content file not found: ${file}`);
    const doc = JSON.parse(await readFile(file, "utf8"));
    console.log(`\n▸ ${doc.slug}`);

    // --- game ---
    const { data: existingGame, error: gSelErr } = await db
      .from("games")
      .select("id, created_by")
      .eq("slug", doc.slug)
      .maybeSingle();
    if (gSelErr) fail(gSelErr.message);

    const gameFields = {
      title: doc.title,
      title_i18n: doc.title_i18n ?? {},
      platform: doc.platform,
      cover_url: doc.cover_url ?? null,
    };

    let gameId;
    if (existingGame) {
      gameId = existingGame.id;
      // Never overwrite created_by on an existing game — preserve ownership.
      if (!dryRun) {
        const { error } = await db.from("games").update(gameFields).eq("id", gameId);
        if (error) fail(error.message);
      }
      console.log(`  ${mark} update game`);
    } else {
      if (dryRun) {
        gameId = null;
        console.log(`  (dry-run) would insert game (and its categories/items)`);
      } else {
        const { data, error } = await db
          .from("games")
          .insert({ slug: doc.slug, created_by: doc.created_by ?? null, ...gameFields })
          .select("id")
          .single();
        if (error) fail(error.message);
        gameId = data.id;
        console.log(`  inserted game`);
      }
    }
    tally.games++;

    // In dry-run with a not-yet-existing game there are no rows to diff against.
    if (!gameId) continue;

    // --- categories ---
    const { data: dbCats, error: cErr } = await db
      .from("checklist_categories")
      .select("id, key, title")
      .eq("game_id", gameId)
      .order("order_index");
    if (cErr) fail(cErr.message);
    const usedCat = new Set();

    for (let ci = 0; ci < doc.categories.length; ci++) {
      const cat = doc.categories[ci];
      if (!cat.key) fail(`Category #${ci} in ${doc.slug} is missing "key".`);
      const match = matchRow(dbCats, cat, usedCat);
      const fields = {
        key: cat.key,
        title: cat.title,
        title_i18n: cat.title_i18n ?? {},
        order_index: ci,
      };

      let catId;
      if (match) {
        catId = match.id;
        usedCat.add(match.id);
        if (!dryRun) {
          const { error } = await db
            .from("checklist_categories")
            .update(fields)
            .eq("id", catId);
          if (error) fail(error.message);
        }
        tally.catUpd++;
        const adopted = !match.key ? " [adopt]" : "";
        console.log(`    ${mark} update category "${cat.key}"${adopted}`);
      } else {
        tally.catIns++;
        console.log(`    ${mark} insert category "${cat.key}"`);
        if (!dryRun) {
          const { data, error } = await db
            .from("checklist_categories")
            .insert({ game_id: gameId, ...fields })
            .select("id")
            .single();
          if (error) fail(error.message);
          catId = data.id;
        }
      }

      if (!catId) continue; // dry-run insert: no id to attach items to

      // --- items ---
      const { data: dbItems, error: iErr } = await db
        .from("checklist_items")
        .select("id, key, title")
        .eq("category_id", catId)
        .order("order_index");
      if (iErr) fail(iErr.message);
      const usedItem = new Set();

      for (let ii = 0; ii < (cat.items ?? []).length; ii++) {
        const item = cat.items[ii];
        if (!item.key) fail(`Item #${ii} in category "${cat.key}" is missing "key".`);
        const im = matchRow(dbItems, item, usedItem);
        const ifields = {
          key: item.key,
          title: item.title,
          title_i18n: item.title_i18n ?? {},
          description: item.description ?? null,
          description_i18n: item.description_i18n ?? {},
          order_index: ii,
        };
        // Only manage image_url when the file mentions it — a file that omits the
        // field leaves UI-uploaded images untouched; setting null clears them.
        if (Object.prototype.hasOwnProperty.call(item, "image_url")) {
          ifields.image_url = item.image_url ?? null;
        }
        if (im) {
          usedItem.add(im.id);
          if (!dryRun) {
            const { error } = await db
              .from("checklist_items")
              .update(ifields)
              .eq("id", im.id);
            if (error) fail(error.message);
          }
          tally.itemUpd++;
        } else {
          tally.itemIns++;
          if (!dryRun) {
            const { error } = await db
              .from("checklist_items")
              .insert({ category_id: catId, ...ifields });
            if (error) fail(error.message);
          }
        }
      }

      const orphanItems = dbItems.filter((r) => !usedItem.has(r.id));
      await handleOrphans("item", orphanItems, "checklist_items", db, { dryRun, prune, tally });
    }

    const orphanCats = dbCats.filter((r) => !usedCat.has(r.id));
    await handleOrphans("category", orphanCats, "checklist_categories", db, { dryRun, prune, tally });
  }

  console.log(
    `\n${dryRun ? "(dry-run) " : ""}Done — games:${tally.games} ` +
      `categories:+${tally.catIns}/~${tally.catUpd} items:+${tally.itemIns}/~${tally.itemUpd} ` +
      `orphans:${tally.orphans}`
  );
  if (tally.orphans && !prune) {
    console.log(
      "  Orphans are DB rows with no matching entry in the content file. " +
        "Re-run with --prune to delete them (this removes their user progress)."
    );
  }
}

// Match a content entry to a DB row: by key first, then adopt a keyless legacy
// row by English title. Never matches across two different non-null keys.
function matchRow(rows, entry, used) {
  const byKey = rows.find((r) => r.key === entry.key && !used.has(r.id));
  if (byKey) return byKey;
  const wantTitle = toKey(entry.title);
  return rows.find((r) => !r.key && !used.has(r.id) && toKey(r.title) === wantTitle);
}

async function handleOrphans(label, orphans, table, db, { dryRun, prune, tally }) {
  for (const o of orphans) {
    tally.orphans++;
    if (prune) {
      console.log(`    ${dryRun ? "(dry-run) would " : ""}DELETE orphan ${label} "${o.key ?? o.title}"`);
      if (!dryRun) {
        const { error } = await db.from(table).delete().eq("id", o.id);
        if (error) fail(error.message);
      }
    } else {
      console.log(`    orphan ${label} "${o.key ?? o.title}" (kept; use --prune to delete)`);
    }
  }
}

// ---------------------------------------------------------------------------
const [, , mode, ...rest] = process.argv;
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const positional = rest.filter((a) => !a.startsWith("--"));
const opts = { dryRun: flags.has("--dry-run"), prune: flags.has("--prune") };

if (mode === "export") {
  await exportGame(positional[0]);
} else if (mode === "import") {
  await importGames(positional[0], opts);
} else {
  fail(
    "Usage:\n" +
      "  games:export -- <slug>\n" +
      "  games:import -- [<slug>] [--dry-run] [--prune]"
  );
}
