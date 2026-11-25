import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

/** Error codes used across the API. See docs/api.md → Errors. */
export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "slot_taken"
  | "too_late"
  | "internal_error";

export function jsonError(status: number, code: ApiErrorCode, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Maps AppError to its JSON error; anything else is logged and becomes a 500 without details. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) return jsonError(error.status, error.code, error.message);
  console.error(error);
  return jsonError(500, "internal_error", "Something went wrong");
}
