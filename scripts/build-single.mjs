import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexPath = path.join(root, "index.html");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readBinary(filePath) {
  return fs.readFileSync(filePath);
}

function findFile(dir, patterns) {
  const files = fs.readdirSync(dir);
  for (const pattern of patterns) {
    const match = files.find((file) => pattern.test(file));
    if (match) return path.join(dir, match);
  }
  return null;
}

function toDataUrl(buffer, mime) {
  const b64 = buffer.toString("base64");
  return `data:${mime};base64,${b64}`;
}

function inlineScriptTag(content) {
  return `<script>${content}</script>`;
}

const duckdbDist = path.join(root, "node_modules", "@duckdb", "duckdb-wasm", "dist");
const fireproofDist = path.join(root, "node_modules", "@fireproof", "core", "dist");

if (!fs.existsSync(duckdbDist)) {
  throw new Error("Missing @duckdb/duckdb-wasm. Run: npm install");
}

if (!fs.existsSync(fireproofDist)) {
  throw new Error("Missing @fireproof/core. Run: npm install");
}

const duckdbModulePath = findFile(duckdbDist, [/duckdb-browser\.mjs$/]);
const wasmMvpPath = findFile(duckdbDist, [/duckdb-mvp\.wasm$/]);
const wasmEhPath = findFile(duckdbDist, [/duckdb-eh\.wasm$/]);
const workerMvpPath = findFile(duckdbDist, [/duckdb-browser-mvp\.worker\.js$/]);
const workerEhPath = findFile(duckdbDist, [/duckdb-browser-eh\.worker\.js$/]);
const pthreadPath = findFile(duckdbDist, [/pthread.*worker\.js$/]);

if (!duckdbModulePath || !wasmMvpPath || !wasmEhPath || !workerMvpPath || !workerEhPath) {
  throw new Error("DuckDB wasm assets not found in node_modules/@duckdb/duckdb-wasm/dist");
}

const fireproofModulePath = findFile(path.join(fireproofDist, "src"), [/fireproof\.mjs$/]);
if (!fireproofModulePath) {
  throw new Error("Fireproof module not found in node_modules/@fireproof/core/dist/src");
}

const bundledDuckdb = await esbuild.build({
  entryPoints: [duckdbModulePath],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false
});

const bundledFireproof = await esbuild.build({
  entryPoints: [fireproofModulePath],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false
});

const duckdbModule = bundledDuckdb.outputFiles[0].text;
const fireproofModule = bundledFireproof.outputFiles[0].text;

const bundles = {
  mvp: {
    mainModule: toDataUrl(readBinary(wasmMvpPath), "application/wasm"),
    mainWorker: toDataUrl(readBinary(workerMvpPath), "text/javascript"),
    pthreadWorker: null
  },
  eh: {
    mainModule: toDataUrl(readBinary(wasmEhPath), "application/wasm"),
    mainWorker: toDataUrl(readBinary(workerEhPath), "text/javascript"),
    pthreadWorker: pthreadPath ? toDataUrl(readBinary(pthreadPath), "text/javascript") : null
  }
};

const inlineGlobals = [
  `window.__DRIGO_DUCKDB_MODULE__ = ${JSON.stringify(duckdbModule)};`,
  `window.__DRIGO_DUCKDB_BUNDLES__ = ${JSON.stringify(bundles)};`,
  `window.__DRIGO_FIREPROOF_MODULE__ = ${JSON.stringify(fireproofModule)};`
].join("\n");

const inlineBundleScript = inlineScriptTag(inlineGlobals);

let html = readText(indexPath);

html = html.replace("<script type=\"module\">", `${inlineBundleScript}\n<script type="module">`);

ensureDir(distDir);
fs.writeFileSync(path.join(distDir, "index.html"), html);

console.log("Built single-file output at dist/index.html");
