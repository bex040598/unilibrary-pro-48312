import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const srcDir = path.join(rootDir, "frontend", "src");
const distDir = path.join(rootDir, "frontend", "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(srcDir, distDir, { recursive: true });

const apiBase = process.env.CYBERRISK_API_BASE || "http://127.0.0.1:8000";
const runtimeConfig = `window.CYBERRISK_RUNTIME_CONFIG = ${JSON.stringify(
  { apiBase },
  null,
  2
)};`;

await writeFile(path.join(distDir, "runtime-config.js"), runtimeConfig, "utf8");
console.log(`Frontend built to ${distDir}`);
