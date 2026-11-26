import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SessionUser = { id: string; name: string; email: string };

/** The signed-in client for the current request, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}
