import { z } from "zod";
import { HEX_RE } from "@/lib/colors";
import { Category } from "@prisma/client";

export const hexSchema = z
  .string()
  .trim()
  .regex(HEX_RE, "Invalid hex color. Use formats like #3B82F6 or 3B82F6.");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.")
  .regex(/[a-zA-Z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const adminAdSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(80),
  message: z.string().trim().max(300).default(""),
  mediaUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => /^https?:\/\//i.test(v) || /^\/ads-media\//.test(v), {
      message: "Enter a full external URL (https://) or an uploaded local file (/ads-media/...).",
    }),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  linkUrl: z
    .preprocess((v) => {
      if (typeof v !== "string") return null;
      const t = v.trim();
      if (!t) return null;
      // Auto-fix bare domains like "example.com" â†’ "https://example.com"
      return /^https?:\/\//i.test(t) ? t : `https://${t}`;
    }, z.string().max(1000).nullable().optional()),
  durationSeconds: z.coerce.number().int().min(10).max(120).default(30),
  slot: z.coerce.number().int().min(1).max(3).default(1),
  active: z.boolean().default(true),
});

export const adminAdUpdateSchema = adminAdSchema.partial();

export const adClickSchema = z.object({
  id: z.string().min(1).max(64),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});

export const paletteQuerySchema = paginationSchema.extend({
  category: z.nativeEnum(Category).optional(),
  q: z.string().trim().max(80).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  trending: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const searchSchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const generatorSchema = z.object({
  base: hexSchema,
  harmony: z.enum([
    "monochromatic",
    "analogous",
    "complementary",
    "split-complementary",
    "triadic",
    "tetradic",
  ]),
  salt: z.coerce.number().int().min(0).max(1000).default(0),
});

export const favoriteSchema = z
  .object({
    paletteId: z.string().cuid().optional(),
    colorId: z.string().cuid().optional(),
  })
  .refine((v) => Boolean(v.paletteId) !== Boolean(v.colorId), {
    message: "Provide exactly one of paletteId or colorId.",
  });

export const adStartSchema = z.object({});

export const adVerifySchema = z.object({
  adSessionId: z.string().cuid("Invalid ad session id."),
});

export const copyAuthorizeSchema = z.object({
  hex: hexSchema.optional(),
});

export const customPaletteSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).default(""),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
  isPublic: z.boolean().default(false),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40).default("Color"),
        hex: hexSchema,
      })
    )
    .min(2, "A palette needs at least 2 colors.")
    .max(8, "A palette can have at most 8 colors."),
});

export const eventSchema = z.object({
  type: z.enum([
    "palette_view",
    "color_view",
    "generator_used",
    "ad_started",
    "ad_completed",
    "access_granted",
    "copy_clicked",
    "palette_saved",
  ]),
  meta: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const adminPaletteSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(400),
  category: z.nativeEnum(Category),
  tags: z.array(z.string().trim().min(1).max(24)).max(10).default([]),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  colors: z
    .array(z.object({ name: z.string().trim().min(1).max(40), hex: hexSchema }))
    .min(2)
    .max(10),
});

export type PaletteQuery = z.infer<typeof paletteQuerySchema>;
export type GeneratorInput = z.infer<typeof generatorSchema>;
export type CustomPaletteInput = z.infer<typeof customPaletteSchema>;
export type AdminPaletteInput = z.infer<typeof adminPaletteSchema>;
