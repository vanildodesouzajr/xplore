import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChecklistNavigator } from "@/components/checklist-navigator";
import { HltbStats } from "@/components/hltb-stats";
import { ProgressBar } from "@/components/progress-bar";
import { TrophyList } from "@/components/trophy-list";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { computeCompletionPercent } from "@/lib/progress";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { pick } from "@/i18n/pick";
import { toggleItemCompletionAction, toggleTrophyCompletionAction } from "./actions";

export default async function GameDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.gameDetail;
  const td = dict.trophies;

  const { data: game } = await supabase
    .from("games")
    .select(
      "id, slug, title, title_i18n, platform, cover_url, created_by, hltb_main_hours, hltb_main_extra_hours, hltb_completionist_hours"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!game) notFound();

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
    title: pick(category.title_i18n, locale, category.title),
    items: (items ?? [])
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        title: pick(item.title_i18n, locale, item.title),
        description: item.description
          ? pick(item.description_i18n, locale, item.description)
          : null,
        imageUrl: item.image_url,
        completed: completedIds.has(item.id),
      })),
  }));

  const overallPercent = computeCompletionPercent(
    itemIds.length,
    completedIds.size
  );

  const isOwner = game.created_by === userId;

  // Restore the section from the URL (?c=id) on refresh; default to the first.
  const initialSectionId =
    categoriesWithItems.find((section) => section.id === c)?.id ??
    categoriesWithItems[0]?.id ??
    "";

  // Trophies are a separate system from the checklist above — their own
  // table and their own progress, fetched independently and never mixed in.
  const { data: trophies } = await supabase
    .from("trophies")
    .select("id, title, title_i18n, description, description_i18n, tier, order_index")
    .eq("game_id", game.id)
    .order("order_index");

  const trophyIds = (trophies ?? []).map((trophy) => trophy.id);

  const { data: trophyProgressRows } = trophyIds.length
    ? await supabase
        .from("user_trophy_progress")
        .select("trophy_id, completed")
        .eq("user_id", userId ?? "")
        .in("trophy_id", trophyIds)
    : { data: [] };

  const completedTrophyIds = new Set(
    (trophyProgressRows ?? [])
      .filter((row) => row.completed)
      .map((row) => row.trophy_id)
  );

  const trophiesWithProgress = (trophies ?? []).map((trophy) => ({
    id: trophy.id,
    title: pick(trophy.title_i18n, locale, trophy.title),
    description: trophy.description
      ? pick(trophy.description_i18n, locale, trophy.description)
      : null,
    tier: trophy.tier,
    completed: completedTrophyIds.has(trophy.id),
  }));

  const showTrophiesTab = trophiesWithProgress.length > 0 || isOwner;

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {game.cover_url && (
            <Image
              src={game.cover_url}
              alt={pick(game.title_i18n, locale, game.title)}
              width={96}
              height={96}
              className="size-20 shrink-0 rounded-lg object-cover shadow-md ring-1 ring-border sm:size-24"
            />
          )}
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {game.platform}
            </span>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {pick(game.title_i18n, locale, game.title)}
            </h1>
          </div>
        </div>
        {isOwner && (
          <Button
            render={<Link href={`/games/${slug}/edit`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            {d.editChecklist}
          </Button>
        )}
      </div>

      <HltbStats
        title={d.hltb.title}
        mainStoryLabel={d.hltb.mainStory}
        mainExtraLabel={d.hltb.mainExtra}
        completionistLabel={d.hltb.completionist}
        mainHours={game.hltb_main_hours}
        mainExtraHours={game.hltb_main_extra_hours}
        completionistHours={game.hltb_completionist_hours}
      />

      <Tabs defaultValue="detonado">
        <TabsList>
          <TabsTrigger value="detonado">{td.detonadoTabLabel}</TabsTrigger>
          {showTrophiesTab && (
            <TabsTrigger value="trophies">{td.tabLabel}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="detonado" className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {d.overallProgress}
              </span>
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {overallPercent}
                <span className="text-base text-muted-foreground">%</span>
              </span>
            </div>
            <ProgressBar percent={overallPercent} />
            {itemIds.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t(d.itemsComplete, {
                  done: completedIds.size,
                  total: itemIds.length,
                })}
              </p>
            )}
          </div>

          {categoriesWithItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {d.noChecklistOwner}{" "}
              {isOwner ? (
                <>
                  <Link
                    href={`/games/${slug}/edit`}
                    className="underline underline-offset-4"
                  >
                    {d.addCategoriesItems}
                  </Link>{" "}
                  {d.toGetStarted}
                </>
              ) : (
                d.noChecklistOther
              )}
            </p>
          ) : (
            <ChecklistNavigator
              sections={categoriesWithItems}
              initialSectionId={initialSectionId}
              chaptersLabel={d.chapters}
              toggleAction={toggleItemCompletionAction}
            />
          )}
        </TabsContent>

        {showTrophiesTab && (
          <TabsContent value="trophies">
            {trophiesWithProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {td.empty}{" "}
                <Link
                  href={`/games/${slug}/edit`}
                  className="underline underline-offset-4"
                >
                  {td.addTrophies}
                </Link>{" "}
                {d.toGetStarted}
              </p>
            ) : (
              <TrophyList
                trophies={trophiesWithProgress}
                toggleAction={toggleTrophyCompletionAction}
                progressLabel={td.progress}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}
