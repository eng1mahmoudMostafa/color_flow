import { NextRequest } from "next/server";
import { handleApiError, ok, clientIp } from "@/lib/api-helpers";
import { eventSchema } from "@/lib/validation";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/** Anonymous aggregate event tracking — no personal data is stored. */
export async function POST(req: NextRequest) {
  try {
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `events:${ip}`, ...RATE_POLICIES.events });
    if (!rl.ok) return ok({ recorded: false });

    const body = await req.json();
    const { type, meta } = eventSchema.parse(body);
    await logEvent(type, meta);
    return ok({ recorded: true });
  } catch (err) {
    return handleApiError(err);
  }
}
