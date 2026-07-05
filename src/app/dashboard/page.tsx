import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GameCard } from "@/components/game-card";
import { computeCompletionPercent } from "@/lib/progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? "";

  const { data: tracked } = await supabase
    .from("user_game_progress")
    .select("game_id")
    .eq("user_id", userId);

  const gameIds = (tracked ?? []).map((row) => row.game_id);

  if (gameIds.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Your games</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re not tracking any games yet.
        </p>
        <Link
          href="/games"
          className="text-primary underline-offset-4 hover:underline"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  const { data: games } = await supabase
    .from("games")
    .select("id, slug, title, platform")
    .in("id", gameIds);

  const { data: categories } = await supabase
    .from("checklist_categories")
    .select("id, game_id")
    .in("game_id", gameIds);

  const categoryToGame = new Map(
    (categories ?? []).map((category) => [category.id, category.game_id])
  );
  const categoryIds = (categories ?? []).map((category) => category.id);

  const { data: items } = categoryIds.length
    ? await supabase
        .from("checklist_items")
        .select("id, category_id")
        .in("category_id", categoryIds)
    : { data: [] };

  const itemToGame = new Map(
    (items ?? []).map((item) => [item.id, categoryToGame.get(item.category_id)])
  );
  const itemIds = (items ?? []).map((item) => item.id);

  const { data: progressRows } = itemIds.length
    ? await supabase
        .from("user_item_progress")
        .select("item_id")
        .eq("user_id", userId)
        .eq("completed", true)
        .in("item_id", itemIds)
    : { data: [] };

  const totalByGame = new Map<string, number>();
  for (const item of items ?? []) {
    const gameId = categoryToGame.get(item.category_id);
    if (!gameId) continue;
    totalByGame.set(gameId, (totalByGame.get(gameId) ?? 0) + 1);
  }

  const completedByGame = new Map<string, number>();
  for (const row of progressRows ?? []) {
    const gameId = itemToGame.get(row.item_id);
    if (!gameId) continue;
    completedByGame.set(gameId, (completedByGame.get(gameId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your games</h1>
        <Link
          href="/games"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Browse catalog
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(games ?? []).map((game) => {
          const total = totalByGame.get(game.id) ?? 0;
          const completed = completedByGame.get(game.id) ?? 0;
          return (
            <GameCard
              key={game.id}
              title={game.title}
              platform={game.platform}
              href={`/games/${game.slug}`}
              percent={computeCompletionPercent(total, completed)}
            />
          );
        })}
      </div>
    </div>
  );
}
