import { ImageResponse } from "next/og";
import { getPaletteBySlug } from "@/lib/palettes";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ColorFlow palette";

type Params = Promise<{ slug: string }>;

/** Dynamic social-share card (og:image) generated per palette. */
export default async function OgImage({ params }: { params: Params }) {
  const { slug } = await params;
  const palette = await getPaletteBySlug(slug);
  const name = palette?.name ?? "ColorFlow";
  const colors = palette?.colors.map((c) => c.hex.toUpperCase()) ?? ["#0F172A", "#1E293B", "#334155", "#64748B", "#F8FAFC"];
  const textOn = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55 ? "#0B0E18" : "#FFFFFF";
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0B0E18",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 64px 0" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>ColorFlow</div>
          <div style={{ display: "flex", fontSize: 26, color: "#94A3B8" }}>Color Palette</div>
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, padding: "40px 64px 0", lineHeight: 1.1 }}>
          {name}
        </div>
        <div style={{ display: "flex", flex: 1, gap: 12, padding: "40px 64px 64px" }}>
          {colors.map((hex) => (
            <div
              key={hex}
              style={{
                display: "flex",
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 18,
                background: hex,
                borderRadius: 18,
                color: textOn(hex),
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {hex}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
