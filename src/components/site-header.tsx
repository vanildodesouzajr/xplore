import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/dashboard" className="font-heading text-lg font-semibold">
        Detonado
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/games"
          className="text-muted-foreground hover:text-foreground"
        >
          Games
        </Link>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </nav>
    </header>
  );
}
