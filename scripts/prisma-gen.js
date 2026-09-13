const { execSync } = require("child_process");

try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (err) {
  console.error("[prisma-gen] prisma generate failed:", err && err.message ? err.message : err);
  process.exit(1);
}
