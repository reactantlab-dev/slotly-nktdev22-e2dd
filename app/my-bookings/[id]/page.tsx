import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { z } from "zod";
import { CancelBookingButton } from "@/components/account/CancelBookingButton";
import { Badge, ButtonLink, PageHeader, Surface } from "@/components/ui";
import { auth } from "@/lib/auth";
import { findCancellationBooking } from "@/lib/cancel-booking";
const day = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export const metadata: Metadata = { title: "Booking" };

const Params = z.object({ id: z.coerce.number().int().positive() });

export default async function CancellationPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const parsed = Params.safeParse(await params);
  if (!parsed.success) notFound();
  const booking = findCancellationBooking(parsed.data.id, session.user.id);
  if (!booking) notFound();

  const isActive = booking.status === "active";
  const title = `${booking.serviceName} with ${booking.specialistName}`;

  return (
    <>
      <PageHeader title="Booking" />
      <Surface>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">{title}</p>
            <p className="mt-1 text-ink-muted tabular-nums">{day.format(new Date(booking.startsAt))} · {booking.startsAt.slice(11, 16)}</p>
          </div>
          <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Cancelled"}</Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {isActive && <CancelBookingButton bookingId={booking.id} />}
          <ButtonLink href="/my-bookings" variant="secondary">
            Back to my bookings
          </ButtonLink>
        </div>
      </Surface>
    </>
  );
}
