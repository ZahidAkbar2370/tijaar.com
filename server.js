/**
 * cPanel / Node.js App entry point for production.
 * Startup file in cPanel "Setup Node.js App": server.js
 *
 * Requires a prior `npm run build` (standalone output under .next/standalone).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const standaloneDir = path.join(__dirname, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

if (!existsSync(standaloneServer)) {
  console.error(
    "[tijaar] Missing .next/standalone/server.js. Run `npm run build` before starting."
  );
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || "production";
// process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.HOSTNAME = "127.0.0.1";
if (!process.env.PORT) {
  process.env.PORT = "3000";
}

const child = spawn(process.execPath, ["server.js"], {
  cwd: standaloneDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    if (!child.killed) child.kill(sig);
  });
}
