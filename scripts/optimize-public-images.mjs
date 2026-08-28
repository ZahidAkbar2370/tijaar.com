/**
 * Generate WebP variants for large static images in public/.
 * Skips missing files (e.g. local dev without assets).
 */
import { existsSync } from "fs";
import { dirname } from "path";
import { mkdirSync } from "fs";
import sharp from "sharp";

const jobs = [
  { input: "public/assets/herobg.jpg", output: "public/assets/herobg-480.webp", width: 480, quality: 42 },
  { input: "public/assets/herobg.jpg", output: "public/assets/herobg-640.webp", width: 640, quality: 48 },
  { input: "public/assets/herobg.jpg", output: "public/assets/herobg-768.webp", width: 768, quality: 52 },
  { input: "public/assets/herobg.jpg", output: "public/assets/herobg-1280.webp", width: 1280, quality: 68 },
  { input: "public/assets/herobg.jpg", output: "public/assets/herobg.webp", width: 1280, quality: 68 },
  { input: "public/images/tijaar-logo.png", output: "public/images/tijaar-logo.webp", width: 280, quality: 85 },
];

let converted = 0;

for (const job of jobs) {
  if (!existsSync(job.input)) {
    continue;
  }
  mkdirSync(dirname(job.output), { recursive: true });
  await sharp(job.input)
    .rotate()
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality, effort: 6 })
    .toFile(job.output);
  converted += 1;
  console.log(`Optimized ${job.input} -> ${job.output}`);
}

if (converted === 0) {
  console.log("No public images to optimize (files not present in this environment).");
}
