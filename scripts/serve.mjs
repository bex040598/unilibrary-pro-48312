import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);

if (!existsSync(distDir)) {
  console.error("dist papkasi topilmadi. Avval `npm run build` bajaring.");
  process.exit(1);
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath) {
  const normalized = urlPath === "/" ? "/index.html" : urlPath;
  const candidate = path.join(distDir, normalized);
  if (existsSync(candidate)) {
    return candidate;
  }

  return path.join(distDir, "index.html");
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
    const filePath = resolveFile(requestUrl.pathname);
    const fileStat = await stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": fileStat.size,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
    });

    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Statik faylni yuklashda xatolik yuz berdi.");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`CyberRisk frontend ${port}-portda ishga tushdi`);
});
