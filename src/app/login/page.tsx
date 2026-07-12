import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { signInAction } from "./actions";

export default async function LoginPage() {
  const dict = getDictionary(await getLocale());
  const d = dict.auth.login;

  return (
    <AuthShell
      title={d.title}
      subtitle={d.subtitle}
      footer={
        <>
          {d.noAccount}{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {d.signUp}
          </Link>
        </>
      }
    >
      <AuthForm
        action={signInAction}
        submitLabel={d.submit}
        labels={{
          email: dict.auth.fields.email,
          password: dict.auth.fields.password,
          loading: dict.common.loading,
        }}
      />
      <p className="mt-4 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {d.forgot}
        </Link>
      </p>
    </AuthShell>
  );
}
