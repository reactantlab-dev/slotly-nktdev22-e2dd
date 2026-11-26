import Link from "next/link";
import { SignOutButton } from "@/components/account/SignOutButton";
import { getSessionUser } from "@/lib/session";

const linkClass = "text-ink-muted transition-colors hover:text-ink";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/services" className="font-display text-2xl font-semibold tracking-tight text-ink">
          Slotly<span className="text-accent">.</span>
        </Link>
        <ul className="flex items-center gap-5 text-sm font-medium">
          <li>
            <Link href="/services" className={linkClass}>
              Services
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/my-bookings" className={linkClass}>
                  My bookings
                </Link>
              </li>
              <li>
                <SignOutButton />
              </li>
            </>
          ) : (
            <li>
              <Link href="/sign-in" className={linkClass}>
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
