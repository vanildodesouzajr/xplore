"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function switchTo() {
    const next: Locale = locale === "en" ? "pt" : "en";
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={switchTo}
      aria-label="Language"
      title="Language"
      className="gap-1.5"
    >
      <Languages className="size-4" />
      <span className="text-xs font-semibold tabular-nums">
        {locale.toUpperCase()}
      </span>
    </Button>
  );
}
