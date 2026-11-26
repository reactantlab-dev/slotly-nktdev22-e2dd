import type { Metadata } from "next";
import { AuthForm } from "@/components/account/AuthForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <PageHeader eyebrow="Your account" title="Create account" description="See and manage your bookings in one place." />
      <AuthForm mode="sign-up" />
    </>
  );
}
