import { NextResponse } from "next/server";
import { getPaletteBySlug } from "@/lib/palettes";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

/** Escape a name for CSS identifiers. */
const safeIdent = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "palette";

export async function GET(request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const palette = await getPaletteBySlug(slug);
  if (!palette) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Palette not found" } },
      { status: 404 }
    );
  }

  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const hexes = palette.colors.map((c) => c.hex.toUpperCase());
  const ident = safeIdent(palette.name);

  let body: string;
  let type = "text/plain; charset=utf-8";
  let ext = "txt";

  switch (format) {
    case "json":
      body = JSON.stringify(
        {
          name: palette.name,
          slug: palette.slug,
          description: palette.description,
          category: palette.category,
          tags: palette.tags,
          colors: palette.colors.map((c) => ({
            name: c.name,
            hex: c.hex.toUpperCase(),
            rgb: c.rgb,
            hsl: c.hsl,
          })),
          source: "ColorFlow",
        },
        null,
        2
      );
      type = "application/json; charset=utf-8";
      ext = "json";
      break;

    case "css":
      body = [
        `/* ${palette.name} — ColorFlow palette */`,
        `:root {`,
        ...hexes.map((hex, i) => `  --${ident}-${i + 1}: ${hex};`),
        `}`,
      ].join("\n");
      type = "text/css; charset=utf-8";
      ext = "css";
      break;

    case "scss":
      body = [
        `// ${palette.name} — ColorFlow palette`,
        ...hexes.map((hex, i) => `$${ident}-${i + 1}: ${hex};`),
      ].join("\n");
      type = "text/plain; charset=utf-8";
      ext = "scss";
      break;

    case "tailwind":
      body = [
        `// ${palette.name} — ColorFlow palette`,
        `// tailwind.config.ts → theme.extend.colors`,
        `theme: {`,
        `  extend: {`,
        `    colors: {`,
        ...hexes.map((hex, i) => `      "${ident}-${i + 1}": "${hex}",`),
        `    },`,
        `  },`,
        `},`,
      ].join("\n");
      type = "text/plain; charset=utf-8";
      ext = "js";
      break;

    default:
      return NextResponse.json(
        {
          ok: false,
          error: { code: "BAD_FORMAT", message: "Unknown format. Use json, css, scss or tailwind." },
        },
        { status: 400 }
      );
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${palette.slug}-${ext === "js" ? "tailwind" : ext}.${ext}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
