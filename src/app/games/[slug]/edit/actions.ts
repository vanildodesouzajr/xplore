"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EditFormState = { error: string | null };

export async function addCategoryAction(
  gameId: string,
  _prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const title = ((formData.get("title") as string) ?? "").trim();
  if (!title) return { error: "Category title is required." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_categories")
    .select("id", { count: "exact", head: true })
    .eq("game_id", gameId);

  const { error } = await supabase.from("checklist_categories").insert({
    game_id: gameId,
    title,
    order_index: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/games/[slug]/edit", "page");
  revalidatePath("/games/[slug]", "page");
  return { error: null };
}

export async function addItemAction(
  categoryId: string,
  _prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const title = ((formData.get("title") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  if (!title) return { error: "Item title is required." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  const { error } = await supabase.from("checklist_items").insert({
    category_id: categoryId,
    title,
    description: description || null,
    order_index: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/games/[slug]/edit", "page");
  revalidatePath("/games/[slug]", "page");
  return { error: null };
}
