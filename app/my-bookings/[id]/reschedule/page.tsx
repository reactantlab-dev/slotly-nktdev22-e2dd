import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RescheduleForm } from "@/components/account/RescheduleForm";
import { PageHeader } from "@/components/ui";
import { findOwnedBooking } from "@/lib/bookings";
import { now } from "@/lib/clock";
import { formatDateTime } from "@/lib/format";
import { getSessionUser } from "@/lib/session";
import { toDateString } from "@/lib/time";

export const metadata: Metadata = { title: "Reschedule" };

type Props = { params: Promise<{ id: string }> };

export default async function ReschedulePage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const id = Number((await params).id);
  const booking = Number.isInteger(id) && id > 0 ? findOwnedBooking(id, user.id) : undefined;
  if (!booking || booking.status !== "active") notFound();

  return (
    <>
      <PageHeader
        eyebrow={`${booking.serviceName} with ${booking.specialistName}`}
        title="Reschedule"
        description={`Now: ${formatDateTime(booking.startsAt)}`}
      />
      <RescheduleForm
        bookingId={booking.id}
        serviceId={booking.serviceId}
        specialistId={booking.specialistId}
        initialDate={booking.startsAt.slice(0, 10)}
        today={toDateString(now())}
      />
    </>
  );
}
