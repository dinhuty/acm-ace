"use client";

import { signOut } from "@/app/(app)/actions";
import { Button } from "@/components/atoms/Button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" type="submit">
        Sign out
      </Button>
    </form>
  );
}
