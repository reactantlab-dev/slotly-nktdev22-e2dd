import { NextResponse } from "next/server";
import { z } from "zod";
import { findOwnedBooking, rescheduleBooking } from "@/lib/bookings";
import { errorResponse, jsonError } from "@/lib/http";
import { getSessionUser } from "@/lib/session";

const Params = z.object({ id: z.coerce.number().int().positive() });
const Body = z.object({ startsAt: z.iso.datetime() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthorized", "Sign in to change a booking");
  const parsedParams = Params.safeParse(await params);
  if (!parsedParams.success || !findOwnedBooking(parsedParams.data.id, user.id)) {
    return jsonError(404, "not_found", "Booking not found");
  }
  const body = await request.json().catch(() => null);
  const parsedBody = Body.safeParse(body);
  try {
    // A malformed new time is reported after the cancelled / too-late checks (docs/api.md order).
    const startsAt = parsedBody.success ? new Date(parsedBody.data.startsAt) : null;
    const booking = rescheduleBooking(parsedParams.data.id, user.id, startsAt);
    return NextResponse.json({ booking });
  } catch (error) {
    return errorResponse(error);
  }
}
