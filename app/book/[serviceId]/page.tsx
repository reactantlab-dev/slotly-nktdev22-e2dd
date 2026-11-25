import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookingForm } from "@/components/booking/BookingForm";
import { PageHeader } from "@/components/ui";
import { findActiveService, listSpecialistsForService } from "@/lib/catalog";
import { now } from "@/lib/clock";
import { formatDuration, formatPrice } from "@/lib/format";
import { toDateString } from "@/lib/time";

export const metadata: Metadata = { title: "Book" };

type Props = { params: Promise<{ serviceId: string }> };

export default async function BookPage({ params }: Props) {
  await connection();
  const serviceId = Number((await params).serviceId);
  const service = Number.isInteger(serviceId) && serviceId > 0 ? findActiveService(serviceId) : undefined;
  if (!service) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Book a visit"
        title={service.name}
        description={`${formatDuration(service.durationMin)} · ${formatPrice(service.priceCents)}`}
      />
      <BookingForm serviceId={service.id} specialists={listSpecialistsForService(service.id)} today={toDateString(now())} />
    </>
  );
}
