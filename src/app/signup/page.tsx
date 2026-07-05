import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "./actions";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Sign up</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to start tracking your games.
          </p>
        </div>
        <AuthForm action={signUpAction} submitLabel="Sign up" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
