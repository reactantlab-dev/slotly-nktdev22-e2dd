import { asc, eq } from "drizzle-orm";
import { activeBookingsBetween, candidateSlots } from "@/lib/availability";
import { findActiveService, findSpecialist, offersService } from "@/lib/catalog";
import { db } from "@/lib/db";
import { bookings, services, specialists, type Service } from "@/lib/db/schema";
import { AppError, isUniqueViolation } from "@/lib/errors";
import { addMinutes, parseDate } from "@/lib/time";

export type BookingDto = {
  id: number;
  serviceId: number;
  serviceName: string;
  specialistId: number;
  specialistName: string;
  clientName: string;
  clientEmail: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "cancelled";
};

const bookingColumns = {
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
};

type BookingRow = Omit<BookingDto, "startsAt" | "endsAt"> & { startsAt: Date; endsAt: Date };

export function toDto(row: BookingRow): BookingDto {
  return { ...row, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() };
}

export function bookingQuery() {
  return db
    .select(bookingColumns)
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(specialists, eq(bookings.specialistId, specialists.id));
}

export function findBooking(id: number): BookingDto | undefined {
  const row = bookingQuery().where(eq(bookings.id, id)).get();
  return row ? toDto(row) : undefined;
}

/** Throws 400 unless `startsAt` is an offered slot for the day (bookings ignored). */
export function assertOfferedSlot(specialistId: number, service: Service, startsAt: Date): void {
  const day = parseDate(startsAt.toISOString().slice(0, 10));
  const offered = day !== null && candidateSlots(specialistId, day, service.durationMin).some(
    (slot) => slot.startsAt.getTime() === startsAt.getTime(),
  );
  if (!offered) throw new AppError(400, "validation_error", "This time is not available for booking");
}

/** Throws 409 if [startsAt, endsAt) overlaps another active booking of the specialist. */
export function assertFree(specialistId: number, startsAt: Date, endsAt: Date, ignoreBookingId?: number): void {
  if (activeBookingsBetween(specialistId, startsAt, endsAt, ignoreBookingId).length > 0) {
    throw new AppError(409, "slot_taken", "This time is no longer available");
  }
}

export type CreateBookingInput = {
  serviceId: number;
  specialistId: number;
  startsAt: Date;
  clientName: string;
  clientEmail: string;
  userId?: string | null;
};

export function createBooking(input: CreateBookingInput): BookingDto {
  const service = findActiveService(input.serviceId);
  if (!service || !findSpecialist(input.specialistId)) throw new AppError(404, "not_found", "Service or specialist not found");
  if (!offersService(input.specialistId, input.serviceId)) {
    throw new AppError(400, "validation_error", "This specialist does not offer the service");
  }
  assertOfferedSlot(input.specialistId, service, input.startsAt);
  const endsAt = addMinutes(input.startsAt, service.durationMin);

  try {
    // Synchronous transaction: the overlap check and the insert run without interleaving.
    // The partial unique index is the last line of defence for identical starts.
    const id = db.transaction((tx) => {
      assertFree(input.specialistId, input.startsAt, endsAt);
      const row = tx
        .insert(bookings)
        .values({
          serviceId: input.serviceId,
          specialistId: input.specialistId,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          startsAt: input.startsAt,
          endsAt,
          userId: input.userId ?? null,
        })
        .returning({ id: bookings.id })
        .get();
      return row.id;
    });
    const booking = findBooking(id);
    if (!booking) throw new Error(`Booking ${id} vanished after insert`);
    return booking;
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, "slot_taken", "This time is no longer available");
    throw error;
  }
}

/** The client's bookings (active and cancelled), earliest first. */
export function listUserBookings(userId: string): BookingDto[] {
  return bookingQuery().where(eq(bookings.userId, userId)).orderBy(asc(bookings.startsAt), asc(bookings.id)).all().map(toDto);
}
