import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { signUpAction } from "./actions";

export default async function SignupPage() {
  const dict = getDictionary(await getLocale());
  const d = dict.auth.signup;

  return (
    <AuthShell
      title={d.title}
      subtitle={d.subtitle}
      footer={
        <>
          {d.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {d.logIn}
          </Link>
        </>
      }
    >
      <AuthForm
        action={signUpAction}
        submitLabel={d.submit}
        labels={{
          email: dict.auth.fields.email,
          password: dict.auth.fields.password,
          loading: dict.common.loading,
        }}
      />
    </AuthShell>
  );
}
