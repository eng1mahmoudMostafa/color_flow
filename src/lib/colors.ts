/**
 * Color utilities — conversions, contrast, harmonies, generation.
 * Pure functions, no side effects. Shared by server and client.
 */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };
export type Cmyk = { c: number; m: number; y: number; k: number };

export const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(input: string): boolean {
  return HEX_RE.test(input.trim());
}

export function normalizeHex(input: string): string {
  let hex = input.trim().replace(/^#/, "").toLowerCase();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${hex}`;
}

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rgb: [number, number, number];

  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

export function rgbToCmyk({ r, g, b }: Rgb): Cmyk {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function formatRgb(rgb: Rgb): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

export function formatHsl(hsl: Hsl): string {
  return `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
}

export function formatCmyk(cmyk: Cmyk): string {
  return `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}

/** Best readable foreground (white/black) for a background hex. */
export function bestTextColor(bgHex: string): "#ffffff" | "#0b1020" {
  return contrastRatio(bgHex, "#ffffff") >= 4.5 ? "#ffffff" : "#0b1020";
}

export function contrastGrade(ratio: number): "AAA" | "AA" | "AA Large" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export type Harmony =
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic";

export const HARMONIES: Harmony[] = [
  "monochromatic",
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  "tetradic",
];

const HARMONY_OFFSETS: Record<Harmony, number[]> = {
  monochromatic: [0, 8, -8, 20, -20],
  analogous: [0, 30, -30, 60, -60],
  complementary: [0, 180, 20, 200, -160],
  "split-complementary": [0, 150, 210, 15, -165],
  triadic: [0, 120, 240, 30, 150],
  tetradic: [0, 90, 180, 270, 45],
};

const LIGHTNESS_STEPS = [50, 38, 55, 72, 85];

export function generateHarmony(baseHex: string, harmony: Harmony, salt = 0): string[] {
  const base = hexToRgb(baseHex);
  const baseHsl = rgbToHsl(base);
  const offsets = HARMONY_OFFSETS[harmony];

  return offsets.map((offset, i) => {
    let l = LIGHTNESS_STEPS[i % LIGHTNESS_STEPS.length];
    let s = clamp(baseHsl.s + (i % 2 === 0 ? 0 : 6), 30, 95);
    if (harmony === "monochromatic") {
      l = clamp(baseHsl.l + [-24, -10, 8, 20, 34][i] + (salt % 7), 6, 94);
      s = clamp(baseHsl.s + [4, 0, -4, -10, -16][i], 18, 100);
    }
    const h = (baseHsl.h + offset + (salt % 11) - 5 + 360) % 360;
    return rgbToHex(hslToRgb({ h, s, l: clamp(l + (salt % 5) - 2, 6, 94) }));
  });
}

/** Deterministic pseudo-random so the same (base, harmony, salt) is reproducible. */
export function generatePalette(baseHex: string, harmony: Harmony, salt = 0): string[] {
  return generateHarmony(normalizeHex(baseHex), harmony, salt);
}

export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 35);
  const l = 42 + Math.floor(Math.random() * 22);
  return rgbToHex(hslToRgb({ h, s, l }));
}
