"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export type ForgotPasswordState = { error: string | null; message?: string | null };

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = ((formData.get("email") as string) ?? "").trim();
  const dict = getDictionary(await getLocale());
  if (!email) {
    return { error: dict.auth.errors.emailRequired };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    error: null,
    message: dict.auth.forgot.sent,
  };
}
