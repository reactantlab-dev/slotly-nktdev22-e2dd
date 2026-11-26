"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/services");
        router.refresh();
      }}
      className="text-ink-muted transition-colors hover:text-ink"
    >
      Sign out
    </button>
  );
}
