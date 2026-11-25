import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { freeSlots } from "@/lib/availability";
import { findActiveService, findSpecialist, offersService } from "@/lib/catalog";
import { jsonError } from "@/lib/http";
import { parseDate } from "@/lib/time";

const Query = z.object({
  serviceId: z.coerce.number().int().positive(),
  specialistId: z.coerce.number().int().positive(),
  date: z.iso.date(),
});

export function GET(request: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  const day = parsed.success ? parseDate(parsed.data.date) : null;
  if (!parsed.success || !day) {
    return jsonError(400, "validation_error", "serviceId, specialistId and date (YYYY-MM-DD) are required");
  }
  const { serviceId, specialistId, date } = parsed.data;
  const service = findActiveService(serviceId);
  if (!service || !findSpecialist(specialistId) || !offersService(specialistId, serviceId)) {
    return jsonError(404, "not_found", "Service or specialist not found");
  }
  const slots = freeSlots(specialistId, day, service.durationMin).map((slot) => ({
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
  }));
  return NextResponse.json({ date, slots });
}
