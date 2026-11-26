import type { Metadata } from "next";
import { AuthForm } from "@/components/account/AuthForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <PageHeader eyebrow="Your account" title="Sign in" />
      <AuthForm mode="sign-in" />
    </>
  );
}
