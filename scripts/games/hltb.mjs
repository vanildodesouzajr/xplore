// Thin wrapper around the (unofficial, undocumented) HowLongToBeat search API
// via the `hltb-client` package. Isolated from sync.mjs's DB-upsert logic
// because it talks to a third-party service that can fail or change shape
// independently of anything in our own database.

import { HLTBClient } from "hltb-client";

export function hltbClient() {
  return new HLTBClient();
}

// Looks up completion times for a game by title. Returns null (never throws)
// on a miss or a network/API failure — HLTB enrichment is optional and must
// never block importing the actual checklist content.
export async function lookupHltb(client, title) {
  try {
    const game = await client.searchOne(title);
    if (!game) return null;
    return {
      hltb_id: game.id,
      hltb_main_hours: game.completionTimes?.main ?? null,
      hltb_main_extra_hours: game.completionTimes?.mainExtra ?? null,
      hltb_completionist_hours: game.completionTimes?.completionist ?? null,
      matchedName: game.name,
    };
  } catch (err) {
    console.warn(`  ⚠ HLTB lookup for "${title}" failed: ${err.message}`);
    return null;
  }
}
