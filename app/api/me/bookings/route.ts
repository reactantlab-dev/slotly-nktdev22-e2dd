import { NextResponse } from "next/server";
import { listUserBookings } from "@/lib/bookings";
import { jsonError } from "@/lib/http";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthorized", "Sign in to see your bookings");
  return NextResponse.json({ bookings: listUserBookings(user.id) });
}
