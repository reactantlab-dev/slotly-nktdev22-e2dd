import { and, eq, sql } from "drizzle-orm";
import { now } from "@/lib/clock";
import { db } from "@/lib/db";
import { bookings, services, specialists, type BookingStatus } from "@/lib/db/schema";

export type CancellationBooking = {
  id: number;
  serviceId: number;
  serviceName: string;
  specialistId: number;
  specialistName: string;
  clientName: string;
  clientEmail: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
};

const cancellationColumns = {
  id: bookings.id,
  serviceId: bookings.serviceId,
  serviceName: services.name,
  specialistId: bookings.specialistId,
  specialistName: specialists.name,
  clientName: bookings.clientName,
  clientEmail: bookings.clientEmail,
  startsAt: bookings.startsAt,
  endsAt: bookings.endsAt,
  status: bookings.status,
  cancelledAt: bookings.cancelledAt,
};

function ownedBookingRow(id: number, userId: string) {
  return db
    .select(cancellationColumns)
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(specialists, eq(bookings.specialistId, specialists.id))
    .where(and(eq(bookings.id, id), sql`"bookings"."user_id" = ${userId}`))
    .get();
}

function toCancellationBooking(row: NonNullable<ReturnType<typeof ownedBookingRow>>): CancellationBooking {
  const { cancelledAt, ...booking } = row;
  return {
    ...booking,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: cancelledAt ? "cancelled" : row.status,
  };
}

export function findCancellationBooking(id: number, userId: string): CancellationBooking | undefined {
  const row = ownedBookingRow(id, userId);
  return row ? toCancellationBooking(row) : undefined;
}

export function cancelBooking(id: number, userId: string): CancellationBooking | undefined {
  const row = ownedBookingRow(id, userId);
  if (!row) return undefined;

  if (row.status === "active") {
    db.update(bookings).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(bookings.id, id)).run();
  }

  const cancelled = ownedBookingRow(id, userId);
  if (!cancelled) throw new Error(`Booking ${id} vanished after cancellation`);
  return toCancellationBooking(cancelled);
}
