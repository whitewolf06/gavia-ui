import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const budget = JSON.parse(readFileSync(process.argv[2], "utf8"));
let metrics;
await build({
  configFile: false, logLevel: "warn", resolve: { dedupe: ["vue"] },
  build: {
    outDir: "button-dist", minify: "esbuild",
    rollupOptions: { input: "button.html" }
  },
  plugins: [{
    name: "packed-button-budget",
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === "chunk");
      const packedModules = chunks.flatMap((chunk) => Object.entries(chunk.modules))
        .filter(([id]) => id.replaceAll("\\", "/").endsWith("/gavia-ui/dist/index.js"));
      assert.equal(packedModules.length, 1, "Probe must consume the installed packed entry");
      const [, module] = packedModules[0];
      const unused = ["WlDialog", "WlTable", "WlSelect", "WlDatePicker", "WlCommandPalette", "WlToast", "wlDesignTokens", "wlManifest"];
      for (const name of unused) {
        assert.ok(!module.renderedExports.includes(name), name + " was retained in the button-only chunk");
      }
      assert.deepEqual(module.renderedExports.sort(), ["WlButton", "createWlPt"],
        "Button-only fixture retained unused public code or editor metadata");
      const code = chunks.map((chunk) => chunk.code).join("\n");
      for (const component of ["dialog", "table", "select", "date-picker", "command-palette", "toast"]) {
        assert.ok(!new RegExp('["\\\']data-wl["\\\']\\s*:\\s*["\\\']' + component + '["\\\']').test(code),
          "Unused component rendering code was retained: " + component);
      }
      metrics = {
        fixture: "WlButton only, Vue runtime included, no CSS or fonts",
        jsBytes: Buffer.byteLength(code), jsGzipBytes: gzipSync(code).byteLength,
        kitRenderedBytes: module.renderedLength,
        retainedKitExports: module.renderedExports.sort(), removedKitExportCount: module.removedExports.length
      };
      assert.ok(metrics.jsGzipBytes <= budget.maxJsGzipBytes,
        "Button JS gzip budget exceeded: " + metrics.jsGzipBytes + " > " + budget.maxJsGzipBytes);
      assert.ok(metrics.kitRenderedBytes <= budget.maxKitRenderedBytes,
        "Button kit code budget exceeded: " + metrics.kitRenderedBytes + " > " + budget.maxKitRenderedBytes);
    }
  }]
});
assert.ok(metrics, "Rollup did not produce budget evidence");
writeFileSync("bundle-evidence.json", JSON.stringify(metrics, null, 2) + "\n");
console.log("Button tree-shaking and gzip budget passed: " + JSON.stringify(metrics));

