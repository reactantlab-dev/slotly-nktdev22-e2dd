/** UTC calendar helpers. Slotly keeps every time in UTC (docs/conventions.md → Time). */

export const MINUTE_MS = 60_000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parses "YYYY-MM-DD" into midnight UTC; null if malformed or not a real date. */
export function parseDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** ISO weekday of a UTC date: 1 = Monday … 7 = Sunday. */
export function isoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

/** "HH:mm" → minutes since midnight. */
export function minutesOfDay(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}
