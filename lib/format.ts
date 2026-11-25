const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 5500 → "$55", 3550 → "$35.50" */
export function formatPrice(priceCents: number): string {
  return priceFormatter.format(priceCents / 100);
}

/** 30 → "30 min", 60 → "1 h", 90 → "1 h 30 min" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** "2027-03-02T10:00:00.000Z" → "10:00" (UTC, 24-hour) */
export function formatTime(value: Date | string): string {
  return new Date(value).toISOString().slice(11, 16);
}

/** "2027-03-02T10:00:00.000Z" → "Tue, Mar 2 · 10:00" (UTC) */
export function formatDateTime(value: Date | string): string {
  return `${dayFormatter.format(new Date(value))} · ${formatTime(value)}`;
}
