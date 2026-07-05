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
