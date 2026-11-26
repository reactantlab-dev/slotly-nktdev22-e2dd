import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { cancelBooking } from "@/lib/cancel-booking";
import { jsonError } from "@/lib/http";

const Params = z.object({ id: z.coerce.number().int().positive() });

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return jsonError(401, "unauthorized", "Sign in to cancel a booking");

  const parsed = Params.safeParse(await params);
  if (!parsed.success) return jsonError(400, "validation_error", "Invalid booking id");

  try {
    const booking = cancelBooking(parsed.data.id, session.user.id);
    if (!booking) return jsonError(404, "not_found", "Booking not found");
    return NextResponse.json({ booking });
  } catch (error) {
    console.error(error);
    return jsonError(500, "internal_error", "Could not cancel the booking");
  }
}
