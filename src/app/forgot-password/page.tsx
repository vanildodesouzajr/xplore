import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { requestPasswordResetAction } from "./actions";

export default async function ForgotPasswordPage() {
  const dict = getDictionary(await getLocale());
  const d = dict.auth.forgot;

  return (
    <AuthShell
      title={d.title}
      subtitle={d.subtitle}
      footer={
        <>
          {d.remembered}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {d.logIn}
          </Link>
        </>
      }
    >
      <ForgotPasswordForm
        action={requestPasswordResetAction}
        labels={{
          email: dict.auth.fields.email,
          submit: d.submit,
          loading: dict.common.loading,
        }}
      />
    </AuthShell>
  );
}
