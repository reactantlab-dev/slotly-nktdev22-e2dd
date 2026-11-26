import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/bookings";
import { errorResponse, jsonError } from "@/lib/http";
import { getSessionUser } from "@/lib/session";

const Body = z.object({
  serviceId: z.number().int().positive(),
  specialistId: z.number().int().positive(),
  startsAt: z.iso.datetime(),
  clientName: z.string().trim().min(1).max(80),
  clientEmail: z.string().trim().toLowerCase().pipe(z.email()),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "validation_error", "Check the booking details");
  try {
    const user = await getSessionUser();
    const booking = createBooking({ ...parsed.data, startsAt: new Date(parsed.data.startsAt), userId: user?.id });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
