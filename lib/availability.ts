import { and, eq, gt, lt, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, workingHours } from "@/lib/db/schema";
import { now } from "@/lib/clock";
import { addMinutes, isoWeekday, minutesOfDay, overlaps } from "@/lib/time";

export const SLOT_STEP_MIN = 30;

export type Slot = { startsAt: Date; endsAt: Date };
type Interval = { startsAt: Date; endsAt: Date };

/**
 * Candidate starts for a day, ignoring bookings: on the 30-minute grid from opening,
 * the whole service fits before closing, and the start is after now.
 */
export function candidateSlots(specialistId: number, day: Date, durationMin: number): Slot[] {
  const hours = db
    .select()
    .from(workingHours)
    .where(and(eq(workingHours.specialistId, specialistId), eq(workingHours.weekday, isoWeekday(day))))
    .all();
  const current = now();
  const slots: Slot[] = [];
  for (const { startTime, endTime } of hours) {
    const close = minutesOfDay(endTime);
    for (let start = minutesOfDay(startTime); start + durationMin <= close; start += SLOT_STEP_MIN) {
      const startsAt = addMinutes(day, start);
      if (startsAt > current) slots.push({ startsAt, endsAt: addMinutes(startsAt, durationMin) });
    }
  }
  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Active bookings of a specialist that intersect [from, to), optionally ignoring one booking. */
export function activeBookingsBetween(specialistId: number, from: Date, to: Date, ignoreBookingId?: number): Interval[] {
  const conditions = [
    eq(bookings.specialistId, specialistId),
    eq(bookings.status, "active"),
    lt(bookings.startsAt, to),
    gt(bookings.endsAt, from),
  ];
  if (ignoreBookingId !== undefined) conditions.push(ne(bookings.id, ignoreBookingId));
  return db
    .select({ startsAt: bookings.startsAt, endsAt: bookings.endsAt })
    .from(bookings)
    .where(and(...conditions))
    .all();
}

/** Free slots: candidates that overlap no active booking. */
export function freeSlots(specialistId: number, day: Date, durationMin: number, ignoreBookingId?: number): Slot[] {
  const busy = activeBookingsBetween(specialistId, day, addMinutes(day, 24 * 60), ignoreBookingId);
  return candidateSlots(specialistId, day, durationMin).filter(
    (slot) => !busy.some((booking) => overlaps(slot.startsAt, slot.endsAt, booking.startsAt, booking.endsAt)),
  );
}
