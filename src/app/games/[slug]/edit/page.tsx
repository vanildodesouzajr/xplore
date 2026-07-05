import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddCategoryForm } from "@/components/add-category-form";
import { AddItemForm } from "@/components/add-item-form";
import { addCategoryAction, addItemAction } from "./actions";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();

  if (!game) notFound();

  const { data: categories } = await supabase
    .from("checklist_categories")
    .select("id, title, order_index")
    .eq("game_id", game.id)
    .order("order_index");

  const categoryIds = (categories ?? []).map((category) => category.id);

  const { data: items } = categoryIds.length
    ? await supabase
        .from("checklist_items")
        .select("id, category_id, title, description, order_index")
        .in("category_id", categoryIds)
        .order("order_index")
    : { data: [] };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit checklist</h1>
        <p className="text-sm text-muted-foreground">{game.title}</p>
      </div>

      <div className="flex flex-col gap-6">
        {(categories ?? []).map((category) => (
          <div
            key={category.id}
            className="flex flex-col gap-3 rounded-lg border p-4"
          >
            <h2 className="text-base font-semibold">{category.title}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {(items ?? [])
                .filter((item) => item.category_id === category.id)
                .map((item) => (
                  <li key={item.id} className="text-muted-foreground">
                    {item.title}
                    {item.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
            </ul>
            <AddItemForm categoryId={category.id} action={addItemAction} />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Add category
        </h2>
        <AddCategoryForm gameId={game.id} action={addCategoryAction} />
      </div>
    </div>
  );
}
