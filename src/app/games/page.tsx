import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { addGameToLibraryAction } from "./actions";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const [{ data: games }, { data: tracked }] = await Promise.all([
    supabase.from("games").select("id, slug, title, platform").order("title"),
    supabase.from("user_game_progress").select("game_id").eq("user_id", userId ?? ""),
  ]);

  const trackedIds = new Set((tracked ?? []).map((row) => row.game_id));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Games</h1>
        <Button render={<Link href="/games/new" />}>New game</Button>
      </div>

      {!games || games.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No games in the catalog yet. Create the first one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {games.map((game) => {
            const isTracked = trackedIds.has(game.id);
            return (
              <GameCard
                key={game.id}
                title={game.title}
                platform={game.platform}
                href={`/games/${game.slug}`}
                footer={
                  isTracked ? (
                    <span className="text-sm text-muted-foreground">
                      In your library
                    </span>
                  ) : (
                    <form action={addGameToLibraryAction.bind(null, game.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Add to my library
                      </Button>
                    </form>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
