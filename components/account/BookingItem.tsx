import { Badge, Surface } from "@/components/ui";
import type { BookingDto } from "@/lib/bookings";
import { formatDateTime } from "@/lib/format";

export function BookingItem({ booking }: { booking: BookingDto }) {
  const title = `${booking.serviceName} with ${booking.specialistName}`;
  const isActive = booking.status === "active";
  return (
    <Surface as="li" aria-label={title} className={isActive ? undefined : "opacity-70"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">{title}</p>
          <p className="mt-1 text-ink-muted tabular-nums">{formatDateTime(booking.startsAt)}</p>
        </div>
        <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Cancelled"}</Badge>
      </div>
    </Surface>
  );
}
