import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { services, specialistServices, specialists, type Service } from "@/lib/db/schema";

export type SpecialistDto = { id: number; name: string; title: string };

/** An active (bookable) service, or undefined. */
export function findActiveService(serviceId: number): Service | undefined {
  return db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.isActive, true)))
    .get();
}

export function findSpecialist(specialistId: number): SpecialistDto | undefined {
  return db
    .select({ id: specialists.id, name: specialists.name, title: specialists.title })
    .from(specialists)
    .where(eq(specialists.id, specialistId))
    .get();
}

export function offersService(specialistId: number, serviceId: number): boolean {
  const row = db
    .select({ specialistId: specialistServices.specialistId })
    .from(specialistServices)
    .where(and(eq(specialistServices.specialistId, specialistId), eq(specialistServices.serviceId, serviceId)))
    .get();
  return row !== undefined;
}

/** Specialists who offer the service, sorted by name. */
export function listSpecialistsForService(serviceId: number): SpecialistDto[] {
  return db
    .select({ id: specialists.id, name: specialists.name, title: specialists.title })
    .from(specialistServices)
    .innerJoin(specialists, eq(specialistServices.specialistId, specialists.id))
    .where(eq(specialistServices.serviceId, serviceId))
    .orderBy(asc(specialists.name))
    .all();
}
