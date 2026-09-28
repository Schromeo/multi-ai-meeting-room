// Isolated offline browser acceptance harness. Uses existing Vite, no extra dependency.
// Run: node scripts/preview-source-attempt.mjs; open http://127.0.0.1:4398
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { build } from "vite";
const result = await build({
  configFile: false, logLevel: "warn",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: { write: false, minify: false,
    lib: { entry: fileURLToPath(new URL("../tests/fixtures/source-attempt-browser.ts", import.meta.url)), formats: ["es"], fileName: "fixture" },
  },
});
const output = (Array.isArray(result) ? result[0] : result).output;
const script = output.find(item => item.type === "chunk" && item.isEntry).code;
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>P2 source evidence — offline acceptance</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:16px/1.6 system-ui;background:#f4f6f9;color:#18243a;max-width:1060px;margin:32px auto;padding:24px}button{padding:12px 18px;border:0;border-radius:8px;background:#174ac5;color:white;font:inherit;cursor:pointer}article{background:white;border:1px solid #cbd5e1;border-radius:10px;padding:12px 20px;margin:12px 0}summary{font-weight:700;cursor:pointer}small{overflow-wrap:anywhere;color:#475569}pre{white-space:pre-wrap;background:#e6eef9;padding:16px;border-radius:8px}h1{margin-bottom:8px}p{margin:8px 0}</style>
<h1>P2 · Source evidence</h1><p>Offline synthetic fixture · real production receipt component + browser IndexedDB store.
No model calls. This origin is isolated from your Meeting Room.</p>
<button id="run">Run storage acceptance</button><pre id="status" role="status">Ready — no test has run.</pre><div id="preview"></div>
<script type="module" src="/boot.js"></script></html>`;
const server = createServer((req, res) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'none'; style-src 'unsafe-inline'; script-src 'self'; img-src 'none'");
  res.setHeader("Cache-Control", "no-store");
  if (req.url === "/boot.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(`const status = document.getElementById("status");
      window.addEventListener("error", e => { status.textContent = "FAIL · " + e.message; });
      import("/fixture.js").then(() => { status.textContent = "Ready — module loaded. Run storage acceptance."; })
        .catch(e => { status.textContent = "FAIL · module load: " + e.message; });`);
  }
  else if (req.url === "/fixture.js") { res.setHeader("Content-Type", "text/javascript"); res.end(script); }
  else if (req.url === "/") { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(html); }
  else { res.writeHead(404); res.end(); }
});
server.listen(4398, "127.0.0.1", () => console.log("Offline P2 browser fixture: http://127.0.0.1:4398 (Ctrl+C to stop)"));
