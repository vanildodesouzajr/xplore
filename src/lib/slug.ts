export function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Titles made entirely of symbols/CJK collapse to "" — fall back to a
  // stable-ish token so the slug is never empty and never routes to "/games//…".
  return base || `game-${Date.now().toString(36)}`;
}
