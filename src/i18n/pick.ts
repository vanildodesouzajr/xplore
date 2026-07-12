import type { Json } from "@/types/supabase";
import type { Locale } from "./config";

/**
 * Resolve a localized content value. `i18n` is a JSONB map like
 * `{ en: "...", pt: "..." }`. Falls back to the requested locale, then any
 * available translation, then the legacy single-language `fallback` column.
 */
export function pick(
  i18n: Json | null | undefined,
  locale: Locale,
  fallback: string
): string {
  if (i18n && typeof i18n === "object" && !Array.isArray(i18n)) {
    const map = i18n as Record<string, unknown>;
    const exact = map[locale];
    if (typeof exact === "string" && exact.length > 0) return exact;
    for (const value of Object.values(map)) {
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return fallback;
}
