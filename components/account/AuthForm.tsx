"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, Field, Surface } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 8;

type Mode = "sign-in" | "sign-up";
type Errors = { name?: string; email?: string; password?: string };

function validate(mode: Mode, name: string, email: string, password: string): Errors {
  const errors: Errors = {};
  if (mode === "sign-up" && !name.trim()) errors.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email";
  if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) errors.password = "Use at least 8 characters";
  if (mode === "sign-in" && !password) errors.password = "Enter your password";
  return errors;
}

function messageFor(mode: Mode, code: string | undefined): string {
  if (mode === "sign-in") return "Wrong email or password";
  if (code?.startsWith("USER_ALREADY_EXISTS")) return "An account with this email already exists";
  if (code === "PASSWORD_TOO_SHORT") return "Use at least 8 characters";
  return "Something went wrong. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(mode, name, email, password);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
    setSubmitting(false);
    if (error) {
      setFormError(messageFor(mode, error.code));
      return;
    }
    router.push("/my-bookings");
    router.refresh();
  }

  const isSignUp = mode === "sign-up";
  return (
    <Surface className="max-w-md">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isSignUp && (
          <Field label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        )}
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field
          label="Password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={isSignUp ? "At least 8 characters" : undefined}
        />
        {formError && <Alert tone="error">{formError}</Alert>}
        <Button type="submit" disabled={submitting} className="self-start">
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
        <p className="text-sm text-ink-muted">
          {isSignUp ? (
            <>
              Have an account? <Link href="/sign-in" className="font-medium text-accent-strong underline-offset-4 hover:underline">Sign in</Link>
            </>
          ) : (
            <>
              No account? <Link href="/sign-up" className="font-medium text-accent-strong underline-offset-4 hover:underline">Create one</Link>
            </>
          )}
        </p>
      </form>
    </Surface>
  );
}
