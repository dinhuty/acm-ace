"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/app/(auth)/login/actions";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-md">
      <FormField label="Username" htmlFor="username">
        <Input
          id="username"
          name="username"
          placeholder="your-username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          disabled={pending}
          required
        />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          disabled={pending}
          required
        />
      </FormField>
      <ErrorMessage>{state?.error}</ErrorMessage>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-caption text-stone">
        No account?{" "}
        <Link href="/register" className="text-ink underline">
          Register
        </Link>
      </p>
    </form>
  );
}
