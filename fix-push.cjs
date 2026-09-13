const { execFileSync } = require("child_process");
function run(args) {
  execFileSync("git", args, { stdio: "inherit" });
}
try {
  run(["rm", "--cached", "push.log", "fixpush.log", "tsc.txt", "gstat.txt", "glog.txt"]);
} catch (e) { console.log("uncache-note:" + (e && e.message ? e.message.split("\n")[0] : e)); }
try {
  run(["add", "-A"]);
  run(["commit", "-m", "fix(copy-crash): remove invalid nested buttons, translate-safe toasts, silent error recovery"]);
  run(["push", "origin", "main"]);
  console.log("PUSH-OK");
} catch (e) { console.log("PUSH-FAIL:" + (e && e.message ? e.message.split("\n")[0] : e)); process.exit(0); }
