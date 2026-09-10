/* Generates seed.sql from ALL_PALETTES — no DB connection needed. */
import { ALL_PALETTES } from "../src/lib/data/generated-palettes";
import { hexToRgb, rgbToHsl, rgbToCmyk, formatRgb, formatHsl, formatCmyk } from "../src/lib/colors";
import { slugify } from "../src/lib/utils";
import bcrypt from "bcryptjs";
import { writeFileSync } from "node:fs";

function q(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

async function main(): Promise<void> {
  const out: string[] = [];
  out.push('SET synchronous_commit = off;');

  // --- Admin user ---
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  out.push(
    `INSERT INTO "User" ("id","email","name","passwordHash","role","createdAt","updatedAt") ` +
      `VALUES ('admin_cuid','admin@colorflow.dev','ColorFlow Admin',${q(passwordHash)},'ADMIN',NOW(),NOW()) ` +
      `ON CONFLICT ("email") DO UPDATE SET "role"='ADMIN', "passwordHash"=EXCLUDED."passwordHash";`
  );

  // --- Palettes (deterministic ids p00001..) ---
  const idBySlug = new Map<string, string>();
  const paletteValues: string[] = [];
  ALL_PALETTES.forEach((p, i) => {
    const slug = slugify(p.name);
    const id = "p" + String(i + 1).padStart(6, "0");
    idBySlug.set(slug, id);
    paletteValues.push(
      `(${q(id)},${q(p.name)},${q(slug)},${q(p.description)},${q(p.category)},` +
        `ARRAY[${p.tags.map(q).join(",")}]::text[],${p.featured ? "true" : "false"},${p.trending ? "true" : "false"},0,NOW(),NOW())`
    );
  });
  for (let i = 0; i < paletteValues.length; i += 400) {
    out.push(
      `INSERT INTO "Palette" ("id","name","slug","description","category","tags","featured","trending","views","createdAt","updatedAt") VALUES\n` +
        paletteValues.slice(i, i + 400).join(",\n") +
        " ON CONFLICT (slug) DO NOTHING;"
    );
  }

  // --- Colors (deterministic ids cXXXXX_N) ---
  const colorValues: string[] = [];
  for (const palette of ALL_PALETTES) {
    const paletteId = idBySlug.get(slugify(palette.name));
    if (!paletteId) continue;
    palette.colors.forEach((color, index) => {
      const rgb = hexToRgb(color.hex);
      colorValues.push(
        `(${q(paletteId + "_" + index)},${q(paletteId)},${q(color.name)},` +
          `${q(color.hex.toLowerCase())},${q(formatRgb(rgb))},${q(formatHsl(rgbToHsl(rgb)))},` +
          `${q(formatCmyk(rgbToCmyk(rgb)))},${index})`
      );
    });
  }
  for (let i = 0; i < colorValues.length; i += 800) {
    out.push(
      `INSERT INTO "Color" ("id","paletteId","name","hex","rgb","hsl","cmyk","position") VALUES\n` +
        colorValues.slice(i, i + 800).join(",\n") +
        " ON CONFLICT (id) DO NOTHING;"
    );
  }

  out.push("SET synchronous_commit = on;");
  writeFileSync("prisma/seed.sql", out.join("\n"), "utf8");
  console.log(`seed.sql written: ${ALL_PALETTES.length} palettes, ${colorValues.length} colors`);
  if (process.exitCode === undefined) process.exitCode = 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
