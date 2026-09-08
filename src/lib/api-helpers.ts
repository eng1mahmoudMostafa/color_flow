import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "COPY_LOCKED"
  | "AD_NOT_VERIFIED"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message, ...extra } }, { status });
}

/** Central error mapper — never leaks stack traces to clients. */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Invalid input.";
    return fail("VALIDATION_ERROR", message, 422, {
      issues: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }
  if (err instanceof AuthError) {
    return fail(err.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", err.message, err.status);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return fail("NOT_FOUND", "The requested resource was not found.", 404);
    if (err.code === "P2002") return fail("BAD_REQUEST", "This record already exists.", 409);
    return fail("SERVER_ERROR", "A database error occurred.", 500);
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return fail("SERVER_ERROR", "The service is temporarily unavailable. Please try again.", 503);
  }
  console.error("[api]", err);
  return fail("SERVER_ERROR", "Something went wrong. Please try again.", 500);
}

/** Extracts the caller IP for rate limiting (best-effort behind proxies). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Lightweight CSRF defence for mutating JSON routes: browsers always send
 * Origin on cross-site POSTs; we require it to match our host when present.
 */
export function assertSameOrigin(req: NextRequest): void {
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin fetches may omit Origin; non-browser clients handled by auth.
  try {
    const host = req.headers.get("host");
    if (host && new URL(origin).host !== host) {
      throw new CrossOriginError();
    }
  } catch (err) {
    if (err instanceof CrossOriginError) throw err;
    throw new CrossOriginError();
  }
}

export class CrossOriginError extends Error {
  constructor() {
    super("Cross-origin request rejected");
  }
}
