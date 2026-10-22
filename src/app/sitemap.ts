import type { MetadataRoute } from "next";
import { listPalettes } from "@/lib/palettes";
import { CATEGORY_META } from "@/lib/data/palettes";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/explore",
    "/categories",
    "/generator",
    "/gradients",
    "/favorites",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.startsWith("/privacy") || path.startsWith("/terms") || path.startsWith("/contact") ? 0.5 : 0.8,
  }));

  const categoryRoutes = CATEGORY_META.map((c) => ({
    url: `\${SITE_URL}/explore?category=${c.key}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Paginate through the full palette library (10k+ palettes).
  const paletteRoutes: MetadataRoute.Sitemap = [];
  const pageSize = 2_000;
  for (let page = 1; ; page++) {
    const { palettes, hasMore } = await listPalettes({ page, perPage: pageSize });
    paletteRoutes.push(
      ...palettes.map((p) => ({
        url: `${SITE_URL}/palette/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );
    if (!hasMore) break;
  }

  return [...staticRoutes, ...categoryRoutes, ...paletteRoutes];
}

