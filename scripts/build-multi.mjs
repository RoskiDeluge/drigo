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

function findFile(dir, patterns) {
  const files = fs.readdirSync(dir);
  for (const pattern of patterns) {
    const match = files.find((file) => pattern.test(file));
    if (match) return path.join(dir, match);
  }
  return null;
}

function inlineScriptTag(content) {
  return `<script>${content}</script>`;
}

const duckdbDist = path.join(root, "node_modules", "@duckdb", "duckdb-wasm", "dist");

if (!fs.existsSync(duckdbDist)) {
  throw new Error("Missing @duckdb/duckdb-wasm. Run: npm install");
}

const duckdbModulePath = findFile(duckdbDist, [/duckdb-browser\.mjs$/]);
const wasmMvpPath = findFile(duckdbDist, [/duckdb-mvp\.wasm$/]);
const workerMvpPath = findFile(duckdbDist, [/duckdb-browser-mvp\.worker\.js$/]);

if (!duckdbModulePath || !wasmMvpPath || !workerMvpPath) {
  throw new Error("DuckDB MVP wasm assets not found in node_modules/@duckdb/duckdb-wasm/dist");
}

const bundledDuckdb = await esbuild.build({
  entryPoints: [duckdbModulePath],
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  write: false
});

ensureDir(distDir);

fs.writeFileSync(path.join(distDir, "duckdb.mjs"), bundledDuckdb.outputFiles[0].text);

fs.copyFileSync(wasmMvpPath, path.join(distDir, "duckdb-mvp.wasm"));
fs.copyFileSync(workerMvpPath, path.join(distDir, "duckdb-mvp.worker.js"));

const bundles = {
  mvp: {
    mainModule: "./duckdb-mvp.wasm",
    mainWorker: "./duckdb-mvp.worker.js",
    pthreadWorker: null
  }
};

const inlineGlobals = [
  `window.__DRIGO_DUCKDB_MODULE_URL__ = "./duckdb.mjs";`,
  `window.__DRIGO_DUCKDB_BUNDLES__ = ${JSON.stringify(bundles)};`
].join("\n");

const inlineBundleScript = inlineScriptTag(inlineGlobals);

let html = readText(indexPath);
html = html.replace("<script type=\"module\">", `${inlineBundleScript}\n<script type="module">`);

fs.writeFileSync(path.join(distDir, "index.html"), html);

console.log("Built multi-file output at dist/ (index.html + assets)");
