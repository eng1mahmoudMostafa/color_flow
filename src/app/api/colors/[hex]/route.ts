import { NextRequest } from "next/server";
import { handleApiError, fail, ok } from "@/lib/api-helpers";
import { hexSchema } from "@/lib/validation";
import { normalizeHex, contrastRatio, contrastGrade, bestTextColor, hexToRgb, rgbToHsl, rgbToCmyk, hslToRgb, rgbToHex, formatRgb, formatHsl, formatCmyk } from "@/lib/colors";
import { findColorInPalettes, listPalettes } from "@/lib/palettes";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ hex: string }> }
) {
  try {
    const raw = (await params).hex;
    const hex = hexSchema.parse(decodeURIComponent(raw));
    const normalized = normalizeHex(hex);
    const rgb = hexToRgb(normalized);
    const hsl = rgbToHsl(rgb);
    const cmyk = rgbToCmyk(rgb);

    const white = contrastRatio(normalized, "#ffffff");
    const black = contrastRatio(normalized, "#0b1020");
    const compRgb = hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
    const compHex = rgbToHex(compRgb);

    const inPalettes = await findColorInPalettes(normalized);
    const { palettes: related } = await listPalettes({ perPage: 6 });

    return ok({
      hex: normalized,
      name: inPalettes[0]?.color.name ?? normalized.toUpperCase(),
      rgb: formatRgb(rgb),
      hsl: formatHsl(hsl),
      cmyk: formatCmyk(cmyk),
      hue: hsl.h,
      saturation: hsl.s,
      lightness: hsl.l,
      contrast: {
        onWhite: { ratio: white, grade: contrastGrade(white) },
        onBlack: { ratio: black, grade: contrastGrade(black) },
        bestText: bestTextColor(normalized),
      },
      complementary: compHex,
      foundInPalettes: inPalettes.map((m) => ({
        slug: m.palette.slug,
        name: m.palette.name,
        colorName: m.color.name,
      })),
      relatedPalettes: related.map((p) => ({
        slug: p.slug,
        name: p.name,
        colors: p.colors.map((c) => c.hex),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
