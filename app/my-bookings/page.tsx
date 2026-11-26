import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookingItem } from "@/components/account/BookingItem";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { listUserBookings } from "@/lib/bookings";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "My bookings" };

export default async function MyBookingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const bookings = listUserBookings(user.id);

  return (
    <>
      <PageHeader eyebrow={user.name} title="My bookings" />
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet">
          <ButtonLink href="/services" variant="secondary" size="sm" className="mt-4">
            Book a visit
          </ButtonLink>
        </EmptyState>
      ) : (
        <ul aria-label="Bookings" className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingItem key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </>
  );
}
