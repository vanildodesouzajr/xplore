import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewGameForm } from "@/components/new-game-form";
import { PageContainer } from "@/components/page-container";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NewGamePage() {
  const dict = getDictionary(await getLocale());
  const d = dict.newGame;

  return (
    <PageContainer className="gap-4">
      <Link
        href="/games"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {d.backToCatalog}
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {d.title}
        </h1>
        <p className="text-sm text-muted-foreground">{d.subtitle}</p>
      </div>
      <NewGameForm
        labels={{
          title: d.fields.title,
          platform: d.fields.platform,
          platformPlaceholder: d.fields.platformPlaceholder,
          coverUrl: d.fields.coverUrl,
          submit: d.submit,
          submitting: d.submitting,
        }}
      />
    </PageContainer>
  );
}
