/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { ALL_PALETTES } from "../src/lib/data/generated-palettes";
import { hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk } from "../src/lib/colors";
import { slugify } from "../src/lib/utils";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PALETTE_BATCH = 500;
const COLOR_BATCH = 2_000;

async function main(): Promise<void> {
  console.log("Seeding ColorFlow…");

  // --- Admin account (credentials are dev defaults; change in production) ---
  const adminEmail = "admin@colorflow.dev";
  const adminPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "ColorFlow Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`  admin user: ${adminEmail} / ${adminPassword} (dev default — change it)`);

  // --- Full deterministic replace of curated + generated palettes ---
  const { count: removedPalettes } = await prisma.palette.deleteMany({});
  await prisma.color.deleteMany({});
  console.log(`  cleared ${removedPalettes} palette rows`);

  for (let i = 0; i < ALL_PALETTES.length; i += PALETTE_BATCH) {
    await prisma.palette.createMany({
      data: ALL_PALETTES.slice(i, i + PALETTE_BATCH).map((p) => ({
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        category: p.category,
        tags: p.tags,
        featured: Boolean(p.featured),
        trending: Boolean(p.trending),
      })),
    });
  }

  const rows = await prisma.palette.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  const colors: {
    paletteId: string;
    name: string;
    hex: string;
    rgb: string;
    hsl: string;
    cmyk: string;
    position: number;
  }[] = [];

  for (const palette of ALL_PALETTES) {
    const paletteId = idBySlug.get(slugify(palette.name));
    if (!paletteId) continue;
    for (const [index, color] of palette.colors.entries()) {
      const rgb = hexToRgb(color.hex);
      colors.push({
        paletteId,
        name: color.name,
        hex: color.hex.toLowerCase(),
        rgb: formatRgb(rgb),
        hsl: formatHsl(rgbToHsl(rgb)),
        cmyk: formatCmyk(rgbToCmyk(rgb)),
        position: index,
      });
    }
  }

  for (let i = 0; i < colors.length; i += COLOR_BATCH) {
    await prisma.color.createMany({ data: colors.slice(i, i + COLOR_BATCH) });
  }

  console.log(`  ${ALL_PALETTES.length} palettes seeded (${colors.length} colors).`);

  // --- Migration helper for the production table (safe on modern Postgres) ---
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "_SeedMeta" (key TEXT PRIMARY KEY, value TEXT);`
  ).catch(() => undefined);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
