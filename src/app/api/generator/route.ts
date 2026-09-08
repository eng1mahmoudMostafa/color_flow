import { NextRequest } from "next/server";
import { handleApiError, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { generatorSchema } from "@/lib/validation";
import { generatePalette, normalizeHex, hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk, bestTextColor } from "@/lib/colors";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `generator:${ip}`, ...RATE_POLICIES.generator });
    if (!rl.ok) {
      return ok(
        { rateLimited: true, retryAfterSeconds: rl.retryAfterSeconds, palette: [] },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { base, harmony, salt } = generatorSchema.parse(body);
    const normalized = normalizeHex(base);

    const palette = generatePalette(normalized, harmony, salt).map((hex) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb);
      return {
        hex,
        rgb: formatRgb(rgb),
        hsl: formatHsl(hsl),
        cmyk: formatCmyk(rgbToCmyk(rgb)),
        textOn: bestTextColor(hex),
      };
    });

    await logEvent("generator_used", { harmony, base: normalized });

    return ok({ base: normalized, harmony, salt, palette });
  } catch (err) {
    return handleApiError(err);
  }
}
