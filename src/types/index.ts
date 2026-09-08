export type ColorInfo = {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
};

export type PaletteSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  colorCount: number;
  colors: ColorInfo[];
};

export type AccessStatusResponse = {
  unlocked: boolean;
  source: "user" | "guest" | null;
  grantedAt: string | null;
  expiresAt: string | null;
  remainingMs: number;
};

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; [k: string]: unknown } };
