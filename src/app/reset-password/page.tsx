import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { updatePasswordAction } from "./actions";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const dict = getDictionary(await getLocale());
  const d = dict.auth.reset;

  return (
    <AuthShell title={d.title}>
      {data?.claims ? (
        <ResetPasswordForm
          action={updatePasswordAction}
          labels={{
            newPassword: dict.auth.fields.newPassword,
            submit: d.submit,
            loading: dict.common.loading,
          }}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {d.invalid}{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {d.requestNew}
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
