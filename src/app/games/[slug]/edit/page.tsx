import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddCategoryForm } from "@/components/add-category-form";
import { AddItemForm } from "@/components/add-item-form";
import { ItemImage } from "@/components/item-image";
import { PageContainer } from "@/components/page-container";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { pick } from "@/i18n/pick";
import { addCategoryAction, addItemAction, setItemImageAction } from "./actions";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.editChecklist;

  const { data: game } = await supabase
    .from("games")
    .select("id, title, title_i18n, created_by")
    .eq("slug", slug)
    .maybeSingle();

  if (!game) notFound();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (game.created_by !== userId) redirect(`/games/${slug}`);

  const gameTitle = pick(game.title_i18n, locale, game.title);

  const { data: categories } = await supabase
    .from("checklist_categories")
    .select("id, title, title_i18n, order_index")
    .eq("game_id", game.id)
    .order("order_index");

  const categoryIds = (categories ?? []).map((category) => category.id);

  const { data: items } = categoryIds.length
    ? await supabase
        .from("checklist_items")
        .select(
          "id, category_id, title, title_i18n, description, description_i18n, image_url, order_index"
        )
        .in("category_id", categoryIds)
        .order("order_index")
    : { data: [] };

  const itemLabels = {
    titlePlaceholder: d.itemTitlePlaceholder,
    descPlaceholder: d.itemDescPlaceholder,
    add: d.addItem,
    adding: d.adding,
  };

  const imageLabels = {
    add: d.itemImageAdd,
    change: d.itemImageChange,
    remove: d.itemImageRemove,
    uploading: d.itemImageUploading,
    error: d.itemImageError,
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-1">
        <Link
          href={`/games/${slug}`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t(d.backTo, { title: gameTitle })}
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {d.title}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {(categories ?? []).map((category) => {
          const categoryItems = (items ?? []).filter(
            (item) => item.category_id === category.id
          );
          return (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4"
            >
              <h2 className="font-heading text-base font-semibold">
                {pick(category.title_i18n, locale, category.title)}
              </h2>
              {categoryItems.length > 0 ? (
                <ul className="flex flex-col gap-1 text-sm">
                  {categoryItems.map((item) => {
                    const title = pick(item.title_i18n, locale, item.title);
                    const description = item.description
                      ? pick(item.description_i18n, locale, item.description)
                      : null;
                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-1.5 text-muted-foreground"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                          <span>
                            <span className="text-foreground">{title}</span>
                            {description ? ` — ${description}` : ""}
                          </span>
                        </div>
                        <div className="pl-3">
                          <ItemImage
                            itemId={item.id}
                            gameId={game.id}
                            userId={userId!}
                            imageUrl={item.image_url}
                            labels={imageLabels}
                            onPersist={setItemImageAction}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{d.noItems}</p>
              )}
              <AddItemForm
                categoryId={category.id}
                action={addItemAction}
                labels={itemLabels}
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {d.addCategory}
        </h2>
        <AddCategoryForm
          gameId={game.id}
          action={addCategoryAction}
          labels={{
            placeholder: d.categoryPlaceholder,
            add: d.addCategory,
            adding: d.adding,
          }}
        />
      </div>
    </PageContainer>
  );
}
