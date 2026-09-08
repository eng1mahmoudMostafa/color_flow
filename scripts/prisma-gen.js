// Generates the Prisma client for the build environment.
// `prisma generate` fails if DATABASE_URL is missing (schema uses env()).
// On build hosts (Vercel) that variable may not exist yet — fall back to a
// placeholder URL. This only affects the generated client, never the runtime
// connection (the real DATABASE_URL is provided at deploy time).
const { execSync } = require("child_process");
const { existsSync } = require("fs");

const PLACEHOLDER = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
process.env.DATABASE_URL = process.env.DATABASE_URL || PLACEHOLDER;
process.env.SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL || PLACEHOLDER;

try {
  execSync("prisma generate", { stdio: "inherit", env: process.env });
} catch (err) {
  // On dev machines the client is usually already generated, and regenerating
  // can hit FS-lock errors (e.g. OneDrive EPERM). Production builds (Vercel)
  // start with a clean tree, so a failure here is treated as tolerable only
  // if a generated client already exists; otherwise re-throw.
  if (existsSync("generated/client") || existsSync("node_modules/.prisma/client")) {
    console.log("prisma generate skipped (client already present)");
    return;
  }
  throw err;
}