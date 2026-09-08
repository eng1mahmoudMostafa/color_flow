import "server-only";
import { prisma } from "@/lib/db";
import { ALL_PALETTES } from "@/lib/data/generated-palettes";
import { hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk } from "@/lib/colors";
import { slugify } from "@/lib/utils";
import type { PaletteSummary, ColorInfo } from "@/types";

type DbPaletteWithColors = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  colors: { name: string; hex: string; rgb: string; hsl: string; cmyk: string }[];
};

export function colorInfoFromHex(name: string, hex: string): ColorInfo {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const rgb = hexToRgb(normalized);
  return {
    name,
    hex: normalized.toLowerCase(),
    rgb: formatRgb(rgb),
    hsl: formatHsl(rgbToHsl(rgb)),
    cmyk: formatCmyk(rgbToCmyk(rgb)),
  };
}

export function toPaletteSummary(p: DbPaletteWithColors): PaletteSummary {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    tags: p.tags,
    featured: p.featured,
    trending: p.trending,
    colorCount: p.colors.length,
    colors: p.colors.map((c) => ({
      name: c.name,
      hex: c.hex.toLowerCase(),
      rgb: c.rgb,
      hsl: c.hsl,
      cmyk: c.cmyk,
    })),
  };
}

function fallbackSummaries(): PaletteSummary[] {
  return ALL_PALETTES.map((p) => ({
    id: slugify(p.name),
    name: p.name,
    slug: slugify(p.name),
    description: p.description,
    category: p.category,
    tags: p.tags,
    featured: Boolean(p.featured),
    trending: Boolean(p.trending),
    colorCount: p.colors.length,
    colors: p.colors.map((c) => colorInfoFromHex(c.name, c.hex)),
  }));
}

export async function listPalettes(opts: {
  category?: string;
  q?: string;
  featured?: boolean;
  trending?: boolean;
  page?: number;
  perPage?: number;
}): Promise<{ palettes: PaletteSummary[]; total: number; hasMore: boolean }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 12;
  try {
    const where = {
      ...(opts.category ? { category: opts.category as never } : {}),
      ...(opts.featured !== undefined ? { featured: opts.featured } : {}),
      ...(opts.trending !== undefined ? { trending: opts.trending } : {}),
      ...(opts.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: "insensitive" as const } },
              { description: { contains: opts.q, mode: "insensitive" as const } },
              { tags: { has: opts.q.toLowerCase() } },
              { colors: { some: { name: { contains: opts.q, mode: "insensitive" as const } } } },
              { colors: { some: { hex: { contains: opts.q.replace("#", "") } } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.palette.findMany({
        where,
        include: { colors: { orderBy: { position: "asc" } } },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.palette.count({ where }),
    ]);

    return {
      palettes: rows.map(toPaletteSummary),
      total,
      hasMore: page * perPage < total,
    };
  } catch (err) {
    console.error("[palettes] DB unavailable, using curated fallback:", err);
    let rows = fallbackSummaries();
    if (opts.category) rows = rows.filter((p) => p.category === opts.category);
    if (opts.featured !== undefined) rows = rows.filter((p) => p.featured === opts.featured);
    if (opts.trending !== undefined) rows = rows.filter((p) => p.trending === opts.trending);
    if (opts.q) {
      const q = opts.q.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.colors.some((c) => c.name.toLowerCase().includes(q) || c.hex.includes(q.replace("#", "")))
      );
    }
    return {
      palettes: rows.slice((page - 1) * perPage, page * perPage),
      total: rows.length,
      hasMore: page * perPage < rows.length,
    };
  }
}

export async function getPaletteBySlug(slug: string): Promise<PaletteSummary | null> {
  try {
    const row = await prisma.palette.findUnique({
      where: { slug },
      include: { colors: { orderBy: { position: "asc" } } },
    });
    if (!row) return null;
    return toPaletteSummary(row);
  } catch (err) {
    console.error("[palettes] DB unavailable, using curated fallback:", err);
    return fallbackSummaries().find((p) => p.slug === slug) ?? null;
  }
}

export async function getRelatedPalettes(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<PaletteSummary[]> {
  try {
    const rows = await prisma.palette.findMany({
      where: { category: category as never, slug: { not: excludeSlug } },
      include: { colors: { orderBy: { position: "asc" } } },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (rows.length > 0) return rows.map(toPaletteSummary);
  } catch (err) {
    console.error("[palettes] DB unavailable, using curated fallback:", err);
  }
  return fallbackSummaries()
    .filter((p) => p.category === category && p.slug !== excludeSlug)
    .slice(0, limit);
}

/** Aggregated color info across all curated palettes, for /color/[hex] context. */
export async function findColorInPalettes(hex: string): Promise<{ palette: PaletteSummary; color: ColorInfo }[]> {
  const target = hex.toLowerCase();
  const { palettes } = await listPalettes({ perPage: 48 });
  const matches: { palette: PaletteSummary; color: ColorInfo }[] = [];
  for (const p of palettes) {
    const color = p.colors.find((c) => c.hex.toLowerCase() === target);
    if (color) matches.push({ palette: p, color });
  }
  return matches;
}
