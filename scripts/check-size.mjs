import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkSizeLimits, createSizeLimits, measureJavaScript } from "./size-budget.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kit = join(root, "packages/ui-kit");
const entry = join(kit, "dist/index.js");
const limitsPath = join(root, "scripts/size-limits.json");

function newestSource(directory) {
  return Math.max(...readdirSync(directory, { withFileTypes: true }).map((item) => {
    const path = join(directory, item.name);
    return item.isDirectory() ? newestSource(path) : statSync(path).mtimeMs;
  }));
}

export async function measureBundles(record = false) {
  if (!existsSync(entry) || statSync(entry).size < 1000 || statSync(entry).mtimeMs < newestSource(join(kit, "src"))) {
    throw new Error("Size evidence requires a fresh library build. Run pnpm build only when authorised, then pnpm size.");
  }
  const requireKit = createRequire(join(kit, "package.json"));
  const { build } = await import(pathToFileURL(requireKit.resolve("vite")).href);
  const fixtures = {
    button: 'import { WlButton } from "gavia-ui"; createApp({render:()=>h(WlButton)}).mount("#app");',
    select: 'import { WlSelect } from "gavia-ui"; createApp({render:()=>h(WlSelect,{options:["One"]})}).mount("#app");',
    form: 'import { WlInput,WlSelect,WlDatePicker,WlField,WlButton } from "gavia-ui"; createApp({render:()=>h("form",[h(WlInput),h(WlSelect),h(WlDatePicker),h(WlField),h(WlButton)])}).mount("#app");',
    all: 'import * as kit from "gavia-ui"; console.log(kit); createApp({render:()=>h("div")}).mount("#app");'
  };
  const measurements = [];
  for (const [line, manifest] of [["vue34", join(kit, "package.json")], ["vue35", join(root, "apps/playground/package.json")]]) {
    const runtime = createRequire(manifest).resolve("vue/dist/vue.runtime.esm-bundler.js");
    for (const [name, body] of Object.entries(fixtures)) {
      const directory = join(root, ".tmp/size", line, name);
      mkdirSync(directory, { recursive: true });
      const input = join(directory, "entry.mjs");
      writeFileSync(input, 'import { createApp,h } from "vue";\n' + body + "\n");
      const result = await build({
        configFile: false,
        logLevel: "error",
        define: { __VUE_OPTIONS_API__: "false", __VUE_PROD_DEVTOOLS__: "false", __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false", "process.env.NODE_ENV": '"production"' },
        resolve: { alias: [{ find: /^gavia-ui$/, replacement: entry }, { find: /^vue$/, replacement: runtime }], dedupe: ["vue"] },
        build: { write: false, minify: "esbuild", target: "es2020", rollupOptions: { input } }
      });
      const output = (Array.isArray(result) ? result : [result]).flatMap((value) => value.output);
      const bundle = Object.fromEntries(output.map((chunk) => [chunk.fileName, chunk]));
      measurements.push({ name: `${line}/${name}`, ...measureJavaScript(bundle) });
    }
  }
  const evidence = { measuredAt: new Date().toISOString(), librarySha256: createHash("sha256").update(readFileSync(entry)).digest("hex"), measurements };
  mkdirSync(join(root, ".tmp/size"), { recursive: true });
  writeFileSync(join(root, ".tmp/size/evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  if (record) writeFileSync(limitsPath, JSON.stringify({ margin: 0.05, ...evidence, limits: createSizeLimits(measurements) }, null, 2) + "\n");
  const limits = JSON.parse(readFileSync(limitsPath, "utf8")).limits;
  console.table(measurements.map((row) => ({ fixture: row.name, gzip: row.gzip, limit: limits[row.name] ?? "pending", delta: limits[row.name] ? row.gzip - limits[row.name] : "pending" })));
  const failures = checkSizeLimits(measurements, limits);
  if (failures.length) throw new Error(failures.join("\n"));
  return evidence;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--record")) throw new Error("Usage: pnpm size [--record]");
  measureBundles(args.includes("--record")).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
