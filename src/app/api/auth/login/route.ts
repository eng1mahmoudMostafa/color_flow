import { NextRequest } from "next/server";
import { handleApiError, fail, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, createAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `login:${ip}`, ...RATE_POLICIES.auth });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many login attempts. Please wait a minute.", 429, {
        retryAfterSeconds: rl.retryAfterSeconds,
      });
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message for both cases — no account enumeration.
    const invalid = fail("UNAUTHORIZED", "Invalid email or password.", 401);
    if (!user) return invalid;
    if (!(await verifyPassword(password, user.passwordHash))) return invalid;

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    await createAuthCookie(sessionUser);
    return ok({ user: sessionUser });
  } catch (err) {
    return handleApiError(err);
  }
}
