"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, Field, Surface } from "@/components/ui";
import type { SpecialistDto } from "@/lib/catalog";
import { SlotList } from "./SlotList";
import { useSlots } from "./useSlots";

type Props = {
  serviceId: number;
  specialists: SpecialistDto[];
  today: string;
  /** Prefill for a signed-in client (SLOT-201). */
  defaultName?: string;
  defaultEmail?: string;
};
type FieldErrors = { clientName?: string; clientEmail?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLOT_TAKEN_MESSAGE = "This time was just taken. Please pick another one.";

function validate(clientName: string, clientEmail: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!clientName.trim()) errors.clientName = "Enter your name";
  else if (clientName.trim().length > 80) errors.clientName = "Use at most 80 characters";
  if (!EMAIL_PATTERN.test(clientEmail.trim())) errors.clientEmail = "Enter a valid email";
  return errors;
}

export function BookingForm({ serviceId, specialists, today, defaultName = "", defaultEmail = "" }: Props) {
  const router = useRouter();
  const [specialistId, setSpecialistId] = useState<number | null>(specialists.length === 1 ? (specialists[0]?.id ?? null) : null);
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<string | null>(null);
  const slots = useSlots(serviceId, specialistId, date);
  const [clientName, setClientName] = useState(defaultName);
  const [clientEmail, setClientEmail] = useState(defaultEmail);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || specialistId === null) return;
    const errors = validate(clientName, clientEmail);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceId, specialistId, startsAt: selected, clientName, clientEmail }),
      });
      if (response.status === 201) {
        const { booking } = (await response.json()) as { booking: { id: number } };
        router.push(`/bookings/${booking.id}`);
        return;
      }
      if (response.status === 409) {
        setFormError(SLOT_TAKEN_MESSAGE);
        setSelected(null);
        slots.reload();
      } else {
        const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
        setFormError(body?.error?.message ?? "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Surface as="section" aria-label="Book a time">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-ink">Specialist</legend>
        {specialists.map((specialist) => (
          <label
            key={specialist.id}
            className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-line px-4 py-3 transition-colors has-[:checked]:border-ink has-[:checked]:bg-accent-soft"
          >
            <input
              type="radio"
              name="specialist"
              value={specialist.id}
              checked={specialistId === specialist.id}
              onChange={() => {
                setSpecialistId(specialist.id);
                setSelected(null);
              }}
              className="accent-[var(--color-ink)]"
            />
            <span className="font-medium">{specialist.name}</span>
            <span className="text-sm text-ink-muted">{specialist.title}</span>
          </label>
        ))}
      </fieldset>

      <Field
        label="Date"
        type="date"
        value={date}
        min={today}
        onChange={(event) => {
          setDate(event.target.value);
          setSelected(null);
        }}
        className="max-w-xs"
      />

      <SlotList state={slots} selected={selected} onSelect={setSelected} />

      <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <Field
          label="Your name"
          autoComplete="name"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          error={fieldErrors.clientName}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={clientEmail}
          onChange={(event) => setClientEmail(event.target.value)}
          error={fieldErrors.clientEmail}
        />
      </div>

      {formError && <Alert tone="error">{formError}</Alert>}

      <Button type="submit" disabled={!selected || submitting} className="self-start">
        Confirm booking
      </Button>
      </form>
    </Surface>
  );
}
