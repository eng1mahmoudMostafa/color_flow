import { NextRequest } from "next/server";
import { handleApiError, ok, assertSameOrigin } from "@/lib/api-helpers";
import { adminPaletteSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk } from "@/lib/colors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPaletteSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await tx.color.deleteMany({ where: { paletteId: id } });
      await tx.palette.update({
        where: { id },
        data: {
          name: data.name,
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
      });
    });

    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { id } = await params;

    await prisma.palette.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
