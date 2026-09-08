import type { Category } from "@prisma/client";
import type { SeedPalette } from "./palettes";
import { CURATED_PALETTES } from "./palettes";

/**
 * Deterministic, procedurally-generated palette library.
 *
 * This module is only imported by server-side code (`prisma/seed.ts`,
 * `src/lib/palettes.ts`); the generated dataset (10,000+ palettes /
 * 50,000+ colors) is never shipped to the browser bundle. Client modules
 * must keep importing `CURATED_PALETTES` / `CATEGORY_META` from `./palettes`.
 */
export const GENERATED_PALETTE_COUNT = 10_000;

/* ------------------------------------------------------------------ */
/* Deterministic PRNG (mulberry32) — same output on every run/seed.    */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Category profiles: every category constrains hue bands, saturation  */
/* and lightness so generated colors always *look like* the category.  */
/* ------------------------------------------------------------------ */
type Profile = {
  label: string;
  /** Inclusive hue ranges (0–360) allowed for this category. */
  hueBands: [number, number][];
  /** Saturation range for the main colors. */
  sat: [number, number];
  /** Lightness ranges for: deep tone, base tone, accent, light neutral. */
  deepL: [number, number];
  baseL: [number, number];
  accentL: [number, number];
  lightL: [number, number];
  /** Whether the accent may jump to the complementary hue. */
  complementAccent: boolean;
};

const PROFILES: Record<Category, Profile> = {
  CLASSIC: {
    label: "classic",
    // Black-dominant: desaturated hues on a very dark ladder.
    hueBands: [[0, 360]],
    sat: [3, 16],
    deepL: [3, 7],
    baseL: [8, 16],
    accentL: [14, 24],
    lightL: [78, 88],
    complementAccent: false,
  },
  MINIMAL: {
    label: "minimal",
    hueBands: [[0, 360]],
    sat: [5, 14],
    deepL: [14, 24],
    baseL: [38, 58],
    accentL: [66, 78],
    lightL: [92, 96],
    complementAccent: false,
  },
  DARK: {
    label: "dark",
    hueBands: [[0, 360]],
    sat: [28, 62],
    deepL: [6, 14],
    baseL: [24, 38],
    accentL: [50, 64],
    lightL: [84, 91],
    complementAccent: true,
  },
  LIGHT: {
    label: "light",
    hueBands: [[0, 360]],
    sat: [22, 48],
    deepL: [52, 62],
    baseL: [74, 84],
    accentL: [62, 72],
    lightL: [92, 97],
    complementAccent: false,
  },
  LUXURY: {
    label: "luxury",
    hueBands: [[38, 55], [265, 292], [340, 356]],
    sat: [30, 65],
    deepL: [4, 10],
    baseL: [34, 48],
    accentL: [56, 70],
    lightL: [84, 91],
    complementAccent: false,
  },
  NATURE: {
    label: "nature",
    hueBands: [[68, 152], [20, 42]],
    sat: [30, 62],
    deepL: [12, 22],
    baseL: [30, 46],
    accentL: [52, 66],
    lightL: [86, 93],
    complementAccent: false,
  },
  OCEAN: {
    label: "ocean",
    hueBands: [[172, 228]],
    sat: [45, 80],
    deepL: [10, 22],
    baseL: [32, 50],
    accentL: [54, 68],
    lightL: [86, 93],
    complementAccent: false,
  },
  SUNSET: {
    label: "sunset",
    hueBands: [[0, 48], [300, 360]],
    sat: [55, 88],
    deepL: [12, 24],
    baseL: [36, 52],
    accentL: [58, 70],
    lightL: [86, 92],
    complementAccent: false,
  },
  PASTEL: {
    label: "pastel",
    hueBands: [[0, 360]],
    sat: [38, 62],
    deepL: [58, 68],
    baseL: [78, 86],
    accentL: [68, 76],
    lightL: [91, 96],
    complementAccent: false,
  },
  NEON: {
    label: "neon",
    hueBands: [[0, 360]],
    sat: [88, 100],
    deepL: [12, 22],
    baseL: [48, 60],
    accentL: [58, 70],
    lightL: [92, 96],
    complementAccent: true,
  },
  TECHNOLOGY: {
    label: "technology",
    hueBands: [[178, 262]],
    sat: [50, 82],
    deepL: [10, 20],
    baseL: [30, 46],
    accentL: [54, 68],
    lightL: [88, 94],
    complementAccent: false,
  },
  GAMING: {
    label: "gaming",
    hueBands: [[252, 332], [140, 162]],
    sat: [62, 92],
    deepL: [8, 18],
    baseL: [32, 48],
    accentL: [54, 68],
    lightL: [86, 92],
    complementAccent: true,
  },
  BUSINESS: {
    label: "business",
    hueBands: [[202, 238]],
    sat: [30, 62],
    deepL: [10, 20],
    baseL: [28, 44],
    accentL: [52, 66],
    lightL: [88, 94],
    complementAccent: false,
  },
  ECOMMERCE: {
    label: "e-commerce",
    hueBands: [[345, 360], [0, 28], [204, 222]],
    sat: [55, 85],
    deepL: [10, 20],
    baseL: [36, 52],
    accentL: [56, 70],
    lightL: [90, 95],
    complementAccent: false,
  },
  PORTFOLIO: {
    label: "portfolio",
    hueBands: [[214, 288]],
    sat: [38, 70],
    deepL: [10, 20],
    baseL: [30, 46],
    accentL: [54, 68],
    lightL: [88, 94],
    complementAccent: true,
  },
  FINANCE: {
    label: "finance",
    hueBands: [[192, 226], [40, 56]],
    sat: [35, 68],
    deepL: [8, 18],
    baseL: [28, 44],
    accentL: [52, 66],
    lightL: [88, 94],
    complementAccent: false,
  },
  MEDICAL: {
    label: "medical",
    hueBands: [[162, 205], [344, 360]],
    sat: [35, 70],
    deepL: [12, 22],
    baseL: [32, 48],
    accentL: [54, 68],
    lightL: [90, 96],
    complementAccent: false,
  },
  EDUCATION: {
    label: "education",
    hueBands: [[218, 278], [24, 58]],
    sat: [45, 75],
    deepL: [10, 20],
    baseL: [32, 48],
    accentL: [54, 68],
    lightL: [88, 94],
    complementAccent: true,
  },
};

const CATEGORY_ORDER: Category[] = [
  "MINIMAL", "DARK", "LIGHT", "LUXURY", "NATURE", "OCEAN", "SUNSET", "PASTEL",
  "NEON", "TECHNOLOGY", "GAMING", "BUSINESS", "ECOMMERCE", "PORTFOLIO",
  "FINANCE", "MEDICAL", "EDUCATION", "CLASSIC",
];

const HARMONIES = [
  "monochromatic", "analogous", "complementary", "triadic", "split-complementary",
] as const;

type Harmony = (typeof HARMONIES)[number];

const HUE_BANDS: { max: number; names: string[] }[] = [
  { max: 20, names: ["Crimson", "Scarlet", "Rose", "Ruby"] },
  { max: 45, names: ["Ember", "Amber", "Saffron", "Tangerine"] },
  { max: 70, names: ["Gold", "Honey", "Marigold", "Citrine"] },
  { max: 110, names: ["Lime", "Chartreuse", "Pistachio", "Mint"] },
  { max: 160, names: ["Emerald", "Jade", "Seafoam", "Sage"] },
  { max: 200, names: ["Cyan", "Teal", "Lagoon", "Aqua"] },
  { max: 250, names: ["Azure", "Sapphire", "Cobalt", "Ocean"] },
  { max: 290, names: ["Indigo", "Iris", "Periwinkle", "Violet"] },
  { max: 330, names: ["Orchid", "Magenta", "Fuchsia", "Plum"] },
  { max: 360, names: ["Raspberry", "Burgundy", "Cherry", "Wine"] },
];

/** Evocative one-word names, one bank per mood group. */
const NAME_BANKS: Record<string, string[]> = {
  water: ["Tide", "Lagoon", "Harbor", "Current", "Reef", "Cove", "Marina", "Pelagic"],
  warm: ["Ember", "Dawn", "Solar", "Kindle", "Blaze", "Sienna", "Apricot", "Copper"],
  cool: ["Glacier", "Frost", "Nimbus", "Zenith", "Polar", "Cirrus", "Boreal", "Zen"],
  green: ["Meadow", "Fern", "Cedar", "Willow", "Moss", "Grove", "Sylvan", "Verdant"],
  vivid: ["Pulse", "Volt", "Flux", "Prism", "Kinetic", "Neon", "Hyper", "Synth"],
  soft: ["Whisper", "Serene", "Velvet", "Murmur", "Cloud", "Lull", "Hush", "Downy"],
  noble: ["Regal", "Onyx", "Gilded", "Monarch", "Sovereign", "Aurum", "Crown", "Opulent"],
  neutral: ["Quartz", "Slate", "Linen", "Pebble", "Drift", "Matrix", "Basalt", "Studio"],
};

function bankForCategory(cat: Category): string[] {
  switch (cat) {
    case "OCEAN": return NAME_BANKS.water;
    case "SUNSET":
    case "ECOMMERCE": return NAME_BANKS.warm;
    case "TECHNOLOGY":
    case "BUSINESS":
    case "FINANCE":
    case "MEDICAL": return NAME_BANKS.cool;
    case "NATURE": return NAME_BANKS.green;
    case "NEON":
    case "GAMING": return NAME_BANKS.vivid;
    case "PASTEL":
    case "LIGHT": return NAME_BANKS.soft;
    case "LUXURY": return NAME_BANKS.noble;
    default: return NAME_BANKS.neutral;
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function hueName(hue: number): string {
  const h = normalizeHue(hue);
  const band = HUE_BANDS.find((b) => h <= b.max) ?? HUE_BANDS[HUE_BANDS.length - 1];
  const idx = Math.floor(h / 12) % band.names.length;
  return band.names[idx];
}

function toneLabel(l: number): string {
  if (l < 20) return "Midnight";
  if (l < 40) return "Deep";
  if (l < 65) return "Soft";
  if (l < 85) return "Light";
  return "Pale";
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = clamp01(s / 100);
  const ln = clamp01(l / 100);
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = normalizeHue(h) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) {
    r = c;
    g = x;
  } else if (hp < 2) {
    r = x;
    g = c;
  } else if (hp < 3) {
    g = c;
    b = x;
  } else if (hp < 4) {
    g = x;
    b = c;
  } else if (hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const m = ln - c / 2;
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function randIn(range: [number, number], rand: () => number): number {
  return range[0] + rand() * (range[1] - range[0]);
}

/** Picks a hue from one of the profile's allowed bands. */
function hueInProfile(profile: Profile, rand: () => number): number {
  const band = profile.hueBands[Math.floor(rand() * profile.hueBands.length)];
  const h = randIn([band[0], band[1]], rand);
  return normalizeHue(h >= 360 ? h - 360 : h);
}

/** Forces a hue back into one of the profile's allowed bands (circular). */
function clampHueToProfile(h: number, profile: Profile, inset = 3): number {
  const circDist = (x: number, y: number) => Math.min(Math.abs(x - y), 360 - Math.abs(x - y));
  const hn = normalizeHue(h);
  for (const [a, b] of profile.hueBands) {
    const inBand = a <= b ? hn >= a && hn <= b : hn >= a || hn <= b;
    if (!inBand) continue;
    // Nudge hues sitting within 4° of an edge inward so hex rounding can't leak out.
    const dA = circDist(hn, a);
    const dB = circDist(hn, b);
    if (dA < 4 && dA <= dB) return normalizeHue(a + 4);
    if (dB < 4) return normalizeHue(b - 4);
    return hn;
  }
  let best = hn;
  let bestDist = Infinity;
  let bestInset = inset;
  for (const [a, b] of profile.hueBands) {
    for (const edge of [a, b]) {
      const d = circDist(hn, edge);
      if (d < bestDist) {
        bestDist = d;
        best = edge;
        bestInset = edge === a ? inset : -inset;
      }
    }
  }
  return normalizeHue(best + bestInset);
}

function buildPalette(index: number): SeedPalette {
  const rand = mulberry32((index + 1) * 2654435761 + 101);
  const category = CATEGORY_ORDER[index % CATEGORY_ORDER.length];
  const profile = PROFILES[category];
  const harmony = HARMONIES[Math.floor(rand() * HARMONIES.length)];

  const baseHue = hueInProfile(profile, rand);
  const sat = randIn(profile.sat, rand);
  const deepL = randIn(profile.deepL, rand);
  const baseL = randIn(profile.baseL, rand);
  const accentL = randIn(profile.accentL, rand);
  const lightL = randIn(profile.lightL, rand);
  // Per-palette jitter so no two palettes look alike.
  const j1 = (rand() - 0.5) * 22;
  const j2 = (rand() - 0.5) * 18;
  const j3 = (rand() - 0.5) * 14;

  const supportHue = clampHueToProfile(
    harmony === "monochromatic"
      ? baseHue + j2
      : baseHue + (harmony === "analogous" ? 18 + j2 : 150 + j2 * 2),
    profile
  );
  const accentHue =
    profile.complementAccent && rand() < 0.45
      ? clampHueToProfile(baseHue + 180 + j3, profile)
      : hueInProfile(profile, rand);

  // Five slots ordered deep → light: background, surface, brand, accent, light.
  const colors = [
    { name: `${toneLabel(deepL)} Ground`, hex: hslToHex(baseHue, Math.round(sat * 0.65), deepL) },
    { name: hueName(clampHueToProfile(baseHue + j1, profile)), hex: hslToHex(clampHueToProfile(baseHue + j1, profile), Math.round(sat), baseL) },
    {
      name: hueName(supportHue),
      hex: hslToHex(supportHue, Math.round(Math.min(96, sat + 6 + j3)), (baseL + accentL) / 2 + j3 / 2),
    },
    { name: hueName(accentHue), hex: hslToHex(accentHue, Math.round(Math.min(98, sat + 10)), accentL) },
    { name: `${toneLabel(lightL)} Tint`, hex: hslToHex(clampHueToProfile(baseHue + j2, profile), Math.round(sat * 0.35), lightL) },
  ];

  const bank = bankForCategory(category);
  const word = bank[Math.floor(rand() * bank.length)];
  const baseName = hueName(baseHue);
  const name = `${word} ${baseName} ${String(index + 1).padStart(4, "0")}`;

  return {
    name,
    description: `A ${harmony} ${profile.label} palette built around ${baseName.toLowerCase()} tones — tuned for ${profile.label} designs.`,
    category,
    tags: [category.toLowerCase(), harmony.replace(/-/g, ""), baseName.toLowerCase(), "generated"],
    colors,
  };
}

/**
 * 10,000 procedurally generated palettes. Deterministic — same output on every
 * run. Palettes with identical color signatures are skipped so every entry is
 * visually distinct.
 */
export const GENERATED_PALETTES: SeedPalette[] = (() => {
  const seen = new Set<string>();
  const palettes: SeedPalette[] = [];
  let i = 0;
  while (palettes.length < GENERATED_PALETTE_COUNT && i < GENERATED_PALETTE_COUNT * 3) {
    const p = buildPalette(i);
    const signature = p.colors.map((c) => c.hex).join(",");
    if (!seen.has(signature)) {
      seen.add(signature);
      palettes.push(p);
    }
    i++;
  }
  return palettes;
})();

/** Curated + generated. Use this for seeding the DB and for server-side fallback. */
export const ALL_PALETTES: SeedPalette[] = [...CURATED_PALETTES, ...GENERATED_PALETTES];