import { createServer } from "node:http";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const distDir = path.join(rootDir, "frontend", "dist");
const srcDir = path.join(rootDir, "frontend", "src");
const serveDir = (async () => {
  try {
    await access(distDir);
    return distDir;
  } catch {
    return srcDir;
  }
})();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const port = Number(process.env.PORT || 4173);

createServer(async (req, res) => {
  const baseDir = await serveDir;
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  let filePath = path.join(baseDir, requestedPath);

  try {
    await access(filePath);
  } catch {
    filePath = path.join(baseDir, "index.html");
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain; charset=utf-8" });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Server error: ${error.message}`);
  }
}).listen(port, () => {
  console.log(`CyberRisk frontend available at http://127.0.0.1:${port}`);
});
