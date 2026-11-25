import type { ApiErrorCode } from "@/lib/http";

/** A business-rule failure that maps to an API error response. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** better-sqlite3 unique violation, possibly wrapped by Drizzle. */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current; depth += 1) {
    if (typeof current === "object" && current !== null && "code" in current && current.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return true;
    }
    current = typeof current === "object" && current !== null && "cause" in current ? current.cause : undefined;
  }
  return false;
}
