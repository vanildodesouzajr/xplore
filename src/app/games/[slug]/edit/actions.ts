"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export type EditFormState = { error: string | null };

export async function addCategoryAction(
  gameId: string,
  _prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const title = ((formData.get("title") as string) ?? "").trim();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  if (!title) return { error: dict.editChecklist.categoryTitleRequired };

  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_categories")
    .select("id", { count: "exact", head: true })
    .eq("game_id", gameId);

  const { error } = await supabase.from("checklist_categories").insert({
    game_id: gameId,
    title,
    title_i18n: { [locale]: title },
    order_index: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/games/[slug]/edit", "page");
  revalidatePath("/games/[slug]", "page");
  return { error: null };
}

// Persist (or clear) a checklist item's image URL. The file itself is uploaded
// client-side straight to Storage; this only saves the resulting public URL.
// RLS (checklist_items_update_own_game) ensures only the game owner can write.
export async function setItemImageAction(
  itemId: string,
  imageUrl: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ image_url: imageUrl })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/games/[slug]/edit", "page");
  revalidatePath("/games/[slug]", "page");
}

export async function addItemAction(
  categoryId: string,
  _prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const title = ((formData.get("title") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  if (!title) return { error: dict.editChecklist.itemTitleRequired };

  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  const { error } = await supabase.from("checklist_items").insert({
    category_id: categoryId,
    title,
    title_i18n: { [locale]: title },
    description: description || null,
    description_i18n: description ? { [locale]: description } : {},
    order_index: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/games/[slug]/edit", "page");
  revalidatePath("/games/[slug]", "page");
  return { error: null };
}
