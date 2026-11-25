import { NextResponse } from "next/server";
import { z } from "zod";
import { findActiveService, listSpecialistsForService } from "@/lib/catalog";
import { jsonError } from "@/lib/http";

const Params = z.object({ id: z.coerce.number().int().positive() });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = Params.safeParse(await params);
  if (!parsed.success) return jsonError(400, "validation_error", "Service id must be a positive integer");
  if (!findActiveService(parsed.data.id)) return jsonError(404, "not_found", "Service not found");
  return NextResponse.json({ specialists: listSpecialistsForService(parsed.data.id) });
}
