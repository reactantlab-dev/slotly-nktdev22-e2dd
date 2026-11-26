"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlotList } from "@/components/booking/SlotList";
import { useSlots } from "@/components/booking/useSlots";
import { Alert, Button, Field, Surface } from "@/components/ui";

type Props = { bookingId: number; serviceId: number; specialistId: number; initialDate: string; today: string };

const MESSAGES: Record<number, string> = {
  409: "This time was just taken. Please pick another one.",
  422: "Bookings can't be changed less than 2 hours before the visit.",
};

export function RescheduleForm({ bookingId, serviceId, specialistId, initialDate, today }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const slots = useSlots(serviceId, specialistId, date);

  async function confirm() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startsAt: selected }),
    }).catch(() => null);
    setSubmitting(false);
    if (response?.ok) {
      router.push("/my-bookings");
      router.refresh();
      return;
    }
    setError((response && MESSAGES[response.status]) ?? "Could not change the booking. Please try again.");
    if (response?.status === 409) {
      setSelected(null);
      slots.reload();
    }
  }

  return (
    <Surface className="flex flex-col gap-6">
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
      {error && <Alert tone="error">{error}</Alert>}
      <Button onClick={confirm} disabled={!selected || submitting} className="self-start">
        Confirm new time
      </Button>
    </Surface>
  );
}
