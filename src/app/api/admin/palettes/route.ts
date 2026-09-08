import { NextRequest } from "next/server";
import { handleApiError, ok, assertSameOrigin } from "@/lib/api-helpers";
import { adminPaletteSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk } from "@/lib/colors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    await requireAdmin();

    const body = await req.json();
    const data = adminPaletteSchema.parse(body);

    let slug = slugify(data.name);
    const clash = await prisma.palette.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;

    const created = await prisma.palette.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        category: data.category,
        tags: data.tags,
        featured: data.featured,
        trending: data.trending,
        colors: {
          create: data.colors.map((c, i) => {
            const rgb = hexToRgb(c.hex);
            return {
              name: c.name,
              hex: c.hex.toLowerCase(),
              rgb: formatRgb(rgb),
              hsl: formatHsl(rgbToHsl(rgb)),
              cmyk: formatCmyk(rgbToCmyk(rgb)),
              position: i,
            };
          }),
        },
      },
      include: { colors: { orderBy: { position: "asc" } } },
    });

    return ok({ id: created.id, slug: created.slug });
  } catch (err) {
    return handleApiError(err);
  }
}
