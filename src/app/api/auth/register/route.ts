import { NextRequest } from "next/server";
import { handleApiError, fail, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { registerSchema } from "@/lib/validation";
import { hashPassword, createAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `register:${ip}`, ...RATE_POLICIES.register });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many registration attempts. Try again later.", 429);
    }

    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail("BAD_REQUEST", "An account with this email already exists.", 409);
    }

    const isFirstUser = (await prisma.user.count()) === 0;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: isFirstUser ? "ADMIN" : "USER",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await createAuthCookie(user);
    return ok({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
