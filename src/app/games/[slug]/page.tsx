import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChecklistCategorySection } from "@/components/checklist-category-section";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { computeCompletionPercent } from "@/lib/progress";
import { toggleItemCompletionAction } from "./actions";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, slug, title, platform")
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

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const itemIds = (items ?? []).map((item) => item.id);

  const { data: progressRows } = itemIds.length
    ? await supabase
        .from("user_item_progress")
        .select("item_id, completed")
        .eq("user_id", userId ?? "")
        .in("item_id", itemIds)
    : { data: [] };

  const completedIds = new Set(
    (progressRows ?? []).filter((row) => row.completed).map((row) => row.item_id)
  );

  const categoriesWithItems = (categories ?? []).map((category) => ({
    id: category.id,
    title: category.title,
    items: (items ?? [])
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        completed: completedIds.has(item.id),
      })),
  }));

  const overallPercent = computeCompletionPercent(
    itemIds.length,
    completedIds.size
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{game.title}</h1>
          <p className="text-sm text-muted-foreground">{game.platform}</p>
        </div>
        <Button
          render={<Link href={`/games/${slug}/edit`} />}
          variant="outline"
          size="sm"
        >
          Edit checklist
        </Button>
      </div>

      <ProgressBar percent={overallPercent} />

      {categoriesWithItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No checklist yet.{" "}
          <Link href={`/games/${slug}/edit`} className="underline underline-offset-4">
            Add categories and items
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {categoriesWithItems.map((category) => (
            <ChecklistCategorySection
              key={category.id}
              title={category.title}
              items={category.items}
              toggleAction={toggleItemCompletionAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
