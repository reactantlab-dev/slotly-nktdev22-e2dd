import { Badge, ButtonLink, Surface } from "@/components/ui";
import { canReschedule, type BookingDto } from "@/lib/bookings";

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
      {isActive && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {canReschedule(booking) && (
            <ButtonLink href={`/my-bookings/${booking.id}/reschedule`} variant="secondary" size="sm">
              Reschedule
            </ButtonLink>
          )}
          <ButtonLink href={`/my-bookings/${booking.id}`} variant="secondary" size="sm">Cancel booking</ButtonLink>
        </div>

      )}
    </Surface>
  );
}
