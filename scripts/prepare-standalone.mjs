/**
 * After `next build` with output: "standalone", copy static assets into the bundle.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");

if (!existsSync(join(standaloneDir, "server.js"))) {
  console.error("Missing .next/standalone/server.js — run `npm run build` first.");
  process.exit(1);
}

const standaloneNext = join(standaloneDir, ".next");
const standaloneStatic = join(standaloneNext, "static");
const standalonePublic = join(standaloneDir, "public");

mkdirSync(standaloneNext, { recursive: true });
cpSync(staticDir, standaloneStatic, { recursive: true });
cpSync(publicDir, standalonePublic, { recursive: true });

console.log("Standalone bundle ready:", standaloneDir);
