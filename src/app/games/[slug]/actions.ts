"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleItemCompletionAction(
  itemId: string,
  completed: boolean
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { error } = await supabase.from("user_item_progress").upsert(
    {
      user_id: userId,
      item_id: itemId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,item_id" }
  );

  if (error) throw error;

  revalidatePath("/games/[slug]", "page");
  revalidatePath("/dashboard");
}

// Trophies are a separate system from the checklist — own progress table,
// own upsert — so marking one never touches user_item_progress.
export async function toggleTrophyCompletionAction(
  trophyId: string,
  completed: boolean
) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const { error } = await supabase.from("user_trophy_progress").upsert(
    {
      user_id: userId,
      trophy_id: trophyId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,trophy_id" }
  );

  if (error) throw error;

  revalidatePath("/games/[slug]", "page");
  revalidatePath("/dashboard");
}
