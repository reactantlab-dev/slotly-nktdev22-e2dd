import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ButtonLink, PageHeader, Surface } from "@/components/ui";
import { findBooking } from "@/lib/bookings";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Booking confirmed" };

type Props = { params: Promise<{ id: string }> };

/** Public confirmation: no client name or email, the URL may be shared. */
export default async function BookingConfirmedPage({ params }: Props) {
  await connection();
  const id = Number((await params).id);
  const booking = Number.isInteger(id) && id > 0 ? findBooking(id) : undefined;
  if (!booking) notFound();

  return (
    <>
      <PageHeader eyebrow="All set" title="You're booked" />
      <Surface className="flex flex-col gap-2">
        <p className="font-display text-2xl font-semibold">
          {booking.serviceName} with {booking.specialistName}
        </p>
        <p className="text-lg text-ink-muted tabular-nums">{formatDateTime(booking.startsAt)}</p>
      </Surface>
      <ButtonLink href="/services" variant="secondary" className="mt-8">
        Book another visit
      </ButtonLink>
    </>
  );
}
