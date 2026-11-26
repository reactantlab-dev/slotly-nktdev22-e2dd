"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button } from "@/components/ui";

export function CancelBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);

  async function cancel() {
    setIsPending(true);
    setError(false);
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    if (response.ok) {
      router.refresh();
      return;
    }
    setError(true);
    setIsPending(false);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {error && <Alert tone="error">Could not cancel the booking. Try again.</Alert>}
      <Button variant="danger" disabled={isPending} onClick={cancel}>
        {isPending ? "Cancelling…" : "Cancel booking"}
      </Button>
    </div>
  );
}
