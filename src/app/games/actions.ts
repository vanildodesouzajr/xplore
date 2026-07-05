"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function addGameToLibraryAction(gameId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  await supabase
    .from("user_game_progress")
    .insert({ user_id: userId, game_id: gameId });

  revalidatePath("/games");
  revalidatePath("/dashboard");
}

export type CreateGameState = { error: string | null };

export async function createGameAction(
  _prevState: CreateGameState,
  formData: FormData
): Promise<CreateGameState> {
  const title = ((formData.get("title") as string) ?? "").trim();
  const platform = ((formData.get("platform") as string) ?? "").trim();
  const coverUrl = ((formData.get("cover_url") as string) ?? "").trim();

  if (!title || !platform) {
    return { error: "Title and platform are required." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const slug = slugify(title);

  const { error } = await supabase.from("games").insert({
    title,
    platform,
    slug,
    cover_url: coverUrl || null,
    created_by: userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/games");
  redirect(`/games/${slug}/edit`);
}
