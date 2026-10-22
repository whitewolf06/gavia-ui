import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { consumerManager } from "./consumer-manager.mjs";
import { consumerSource } from "./example-source.mjs";
import { checkPackedBrowser, checkPackedButtonBundle, checkPackedNode, preparePackedRuntimeFixtures } from "./package-consumer-checks.mjs";
import { packageDocumentation } from "./package-docs.mjs";
import { assertPureUtilityEntry } from "./utility-boundary.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const uiKitDir = join(repoRoot, "packages", "ui-kit");
const args = process.argv.slice(2);
let requestedArchive;
let browserRequested = false;
let selectedManager = "pnpm";
let requestedVue;
let requestedTypescript;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--browser" && !browserRequested) browserRequested = true;
  else if (args[index] === "--archive" && !requestedArchive && args[index + 1]?.trim()) requestedArchive = resolve(args[++index]);
  else if (args[index] === "--manager" && ["pnpm", "npm", "bun"].includes(args[index + 1])) selectedManager = args[++index];
  else if (/^--manager=(?:pnpm|npm|bun)$/.test(args[index])) selectedManager = args[index].split("=")[1];
  else if (args[index] === "--vue" && /^\d+\.\d+\.\d+$/.test(args[index + 1] ?? "")) requestedVue = args[++index];
  else if (args[index] === "--typescript" && /^\d+\.\d+\.\d+$/.test(args[index + 1] ?? "")) requestedTypescript = args[++index];
  else throw new Error("Usage: pnpm verify:package [--archive <path>] [--browser] [--manager=pnpm|npm|bun] [--vue <exact-version>] [--typescript <exact-version>]");
}
if (requestedArchive && (!existsSync(requestedArchive) || !statSync(requestedArchive).isFile())) {
  throw new Error(`Archive must be an existing file: ${requestedArchive}`);
}
const packageManager = process.env.npm_execpath;

if (!packageManager) {
  throw new Error("verify:package must be started through pnpm so npm_execpath is available");
}

const consumerTool = selectedManager === "pnpm" ? undefined : consumerManager(selectedManager);

const packageJson = JSON.parse(readFileSync(join(uiKitDir, "package.json"), "utf8"));
const workspaceVueVersion = JSON.parse(readFileSync(join(uiKitDir, "node_modules", "vue", "package.json"), "utf8")).version;
const registryVueVersion = requestedVue ?? (selectedManager === "bun" ? workspaceVueVersion : undefined);
// Language-tools 3 requires compiler internals absent in TypeScript 5.4.
// Exercise the supported consumer minimum with its compatible pinned runner.
const minimumCompiler = requestedTypescript?.startsWith("5.4.") === true;
const temporaryBase = join(repoRoot, ".tmp");
mkdirSync(temporaryBase, { recursive: true });
const temporaryRoot = mkdtempSync(join(temporaryBase, "gavia-ui-consumer-"));
// Validate the immutable cleanup target before work starts, preserving the original
// failure if a consumer check later throws. Cleanup never computes another path.
if (dirname(temporaryRoot) !== temporaryBase) throw new Error("Consumer must stay inside the task temporary directory");
const packDir = join(temporaryRoot, "package");
const consumerDir = join(temporaryRoot, "consumer");

function localPackage(packageName) {
  const packagePath = join(uiKitDir, "node_modules", ...packageName.split("/"));
  if (!existsSync(join(packagePath, "package.json"))) {
    throw new Error(`Workspace dependency ${packageName} is not installed`);
  }
  return `${selectedManager === "pnpm" ? "link" : "file"}:${realpathSync(packagePath).replaceAll("\\", "/")}`;
}

function runPnpm(args, cwd) {
  const isJavaScriptEntrypoint = /\.(?:c?js|mjs)$/i.test(packageManager);
  const executable = isJavaScriptEntrypoint ? process.execPath : packageManager;
  const executableArgs = isJavaScriptEntrypoint ? [packageManager, ...args] : args;

  execFileSync(executable, executableArgs, {
    cwd,
    env: process.env,
    stdio: "inherit",
    timeout: 120_000
  });
}

function write(relativePath, contents) {
  const destination = join(consumerDir, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents, "utf8");
}

try {
  mkdirSync(consumerDir, { recursive: true });

  let archivePath = requestedArchive;
  if (!archivePath) {
    mkdirSync(packDir, { recursive: true });
    runPnpm(["pack", "--pack-destination", packDir], uiKitDir);
    const archives = readdirSync(packDir).filter((file) => file.endsWith(".tgz"));
    if (archives.length !== 1) {
      throw new Error("pnpm pack must produce exactly one .tgz archive");
    }
    archivePath = join(packDir, archives[0]);
  }
  const consumerPackage = {
    name: "gavia-ui-package-consumer-smoke",
    private: true,
    type: "module",
    scripts: {
      build: "node tool-build.mjs",
      typecheck: "node tool-typecheck.mjs"
    },
    dependencies: {
      "gavia-ui": `file:${archivePath.replaceAll("\\", "/")}`,
      vue: registryVueVersion ?? localPackage("vue")
    },
    devDependencies: selectedManager === "bun"
      ? (requestedTypescript ? { typescript: requestedTypescript } : undefined)
      : {
          "@vitejs/plugin-vue": localPackage("@vitejs/plugin-vue"),
          typescript: requestedTypescript ?? localPackage("typescript"),
          vite: localPackage("vite"),
          "vue-tsc": minimumCompiler ? "2.2.12" : localPackage("vue-tsc")
        }
  };

  write("package.json", `${JSON.stringify(consumerPackage, null, 2)}\n`);
  write("tool-build.mjs", 'import { build } from "vite";\nawait build();\n');
  // The pinned vue-tsc runner receives the consumer compiler path explicitly; linked tooling must not select the workspace TypeScript.
  write("tool-typecheck.mjs", 'import { run } from "vue-tsc";\nimport { resolve } from "node:path";\nimport { realpathSync } from "node:fs";\nprocess.argv.push("--noEmit", "-p", "tsconfig.json");\nrun(realpathSync(resolve("node_modules/typescript/lib/tsc.js")));\n');
  write(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          allowJs: true,
          lib: ["ESNext", "DOM", "DOM.Iterable"],
          types: ["vite/client"],
          jsx: "preserve",
          jsxImportSource: "vue"
        },
        include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
        vueCompilerOptions: { target: 3.4, strictTemplates: true, dataAttributes: ["data-*"] }
      },
      null,
      2
    )}\n`
  );
  write(
    "vite.config.ts",
    "import { defineConfig } from \"vite\";\nimport vue from \"@vitejs/plugin-vue\";\nimport { resolve } from \"node:path\";\n\nexport default defineConfig({ plugins: [vue()], resolve: { dedupe: [\"vue\"] }, build: { rolldownOptions: { input: { consumer: resolve(\"index.html\"), hydration: resolve(\"ssr.html\") } } } });\n"
  );
  write("index.html", '<!doctype html><html lang="ru"><head><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Packed Gavia consumer</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n');
  preparePackedRuntimeFixtures(write);
  write(
    "src/main.ts",
    `import { createApp } from "vue";
import { WlConfig, WlToastService, WlConfirmationService, createWlPt, wlLocaleRu, wlManifest, wlDesignTokens, resolveWlToken, getWlThemeTokens, type WlDesignTokenName, type WlSpace } from "gavia-ui";
import packageManifest from "gavia-ui/manifest.json";
import designCatalog from "gavia-ui/design-tokens.json";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";
import regularFontUrl from "gavia-ui/fonts/gavia/Gavia-Regular.woff2?url";
import App from "./App.vue";

if (!regularFontUrl) throw new Error("Font asset export did not resolve");
document.documentElement.dataset.wlTheme = "gavia";
const spacing: WlSpace = "lg";
const token: WlDesignTokenName = "--wl-space-lg";
if (wlManifest.length !== packageManifest.length) throw new Error("Runtime and JSON manifests differ");
if (wlDesignTokens.length !== designCatalog.tokens.length || resolveWlToken(token) !== "16px") throw new Error("Design token exports differ");
if (getWlThemeTokens("graphite")[token] !== "16px" || spacing !== "lg") throw new Error("Theme snapshot differs");
if (!resolveWlToken("--wl-font", "gavia").startsWith('"Gavia Sans",')) throw new Error("Gavia typography was not packaged");
createApp(App).use(WlConfig, { pt: createWlPt(), locale: wlLocaleRu })
  .use(WlToastService).use(WlConfirmationService).mount("#app");
`
  );
  // Compile the exact code copied from the showcase using only the packed public API.
  const copiedExamples = [];
  for (const category of ["examples", "recipes"]) {
    const directory = join(repoRoot, "apps", "playground", "src", "design-system", category);
    for (const filename of readdirSync(directory).filter((name) => name.endsWith(".vue")).sort()) {
      write(`src/${category}/${filename}`, consumerSource(readFileSync(join(directory, filename), "utf8")));
      copiedExamples.push(`./${category}/${filename}`);
    }
  }
  // Check positive and negative API type contracts against declarations from the actual archive.
  // These are compile-only files: they are not imported by the runtime application.
  const apiContractFiles = [
    "types/selection-contracts.types.ts", "types/table-contract.types.ts", "types/pt-contract.types.ts",
    "types/navigation-contract.types.ts", "types/generic-mode-contract.types.ts", "types/date-picker.types.ts",
    "fixtures/selection-contracts-consumer.vue", "fixtures/table-contract-consumer.vue",
    "fixtures/navigation-contract-consumer.vue", "fixtures/date-picker-consumer.vue",
    "types/collection-contract.types.ts", "fixtures/collection-contract-consumer.vue",
    "types/input-model-modifiers.types.ts", "fixtures/input-model-modifiers-consumer.vue",
    "types/overlay-locale-contract.types.ts", "fixtures/overlay-model-modifiers-consumer.vue", "types/pt-tooltip-contract.types.ts",
    "types/native-contract.types.ts", "types/native-contract.tsx", "types/field-slot-contract.types.ts", "fixtures/public-components-consumer.vue"
  ];
  for (const relativePath of apiContractFiles) {
    const source = readFileSync(join(uiKitDir, "tests", relativePath), "utf8")
      .replace(/from (["'])(?:\.\.\/)+src\1/g, 'from "gavia-ui"');
    write(`src/contracts/${relativePath}`, source);
  }
  const exampleImports = copiedExamples.map((path, index) => `import Example${index} from "${path}";`).join("\n");
  write("src/App.vue", `<script setup lang="ts">
${exampleImports}
import { WlToast, WlConfirmDialog } from "gavia-ui";
import PackedSmoke from "./PackedSmoke.vue";
const examples = [${copiedExamples.map((_, index) => `Example${index}`).join(", ")}];
</script>
<template><PackedSmoke /><component :is="examples[0]" /><WlToast /><WlConfirmDialog /></template>
`);

  // npm and Bun are used only in the throwaway consumer; the repository stays pnpm-only.
  const offline = registryVueVersion || requestedTypescript ? [] : ["--offline"];
  if (selectedManager === "pnpm") {
    runPnpm(["--ignore-workspace", "install", ...offline, "--ignore-scripts"], consumerDir);
  } else if (selectedManager === "npm") {
    consumerTool.run(["install", ...offline, "--ignore-scripts", "--install-links=false", "--workspaces=false", "--no-audit", "--no-fund"], consumerDir);
  } else {
    consumerTool.run(["install", ...offline, "--ignore-scripts", "--no-progress"], consumerDir);
    // Bun treats file: build tools as local projects and resolves their development
    // graphs. Reuse the existing pinned toolchain after the actual archive install.
    for (const name of ["@vitejs/plugin-vue", "typescript", "vite", "vue-tsc"]) {
      if (name === "typescript" && requestedTypescript) continue;
      const destination = join(consumerDir, "node_modules", ...name.split("/"));
      mkdirSync(dirname(destination), { recursive: true });
      symlinkSync(join(uiKitDir, "node_modules", ...name.split("/")), destination,
        process.platform === "win32" ? "junction" : "dir");
    }
  }
  function runConsumerScript(name) {
    if (selectedManager === "pnpm") runPnpm(["--ignore-workspace", "run", name], consumerDir);
    else consumerTool.run(["run", name], consumerDir);
  }
  runConsumerScript("typecheck");
  const nativeAndSSR = checkPackedNode(consumerDir);
  runConsumerScript("build");
  const buttonBundle = checkPackedButtonBundle(consumerDir);

  const installedPackageDir = join(consumerDir, "node_modules", ...packageJson.name.split("/"));
  const requiredFiles = [
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "dist/index.js",
    "dist/index.d.ts",
    "dist/manifest.json",
    "dist/design-tokens.json",
    "styles/reset.css",
    "styles/base.css",
    "styles/primitives.css",
    "themes/white.css",
    "themes/graphite.css",
    "themes/newspaper.css",
    "themes/gavia.css",
    "themes/gavia-dark.css",
    "styles/fonts/gavia.css",
    "fonts/gavia/manifest.json",
    "fonts/gavia/OFL.txt",
    "fonts/gavia/Onest-OFL.txt",
    "fonts/gavia/FONTLOG.txt"
  ];

  for (const relativePath of requiredFiles) {
    if (!existsSync(join(installedPackageDir, relativePath))) {
      throw new Error(`Packed package is missing ${relativePath}`);
    }
  }

  for (const forbiddenPeer of ["vue", "primevue", "primeicons"]) {
    if (existsSync(join(installedPackageDir, "node_modules", forbiddenPeer))) {
      throw new Error(`Packed package contains a nested ${forbiddenPeer} dependency`);
    }
  }
  const installedManifest = JSON.parse(readFileSync(join(installedPackageDir, "package.json"), "utf8"));
  assertPureUtilityEntry(installedPackageDir);
  if (installedManifest.name !== packageJson.name || installedManifest.version !== packageJson.version) {
    throw new Error(`Packed package must be ${packageJson.name}@${packageJson.version}, received ${installedManifest.name}@${installedManifest.version}`);
  }
  if (JSON.stringify(installedManifest).match(/primevue|primeicons|@primeuix/i)) {
    throw new Error("Published manifest still references PrimeVue or PrimeIcons");
  }
  if (installedManifest.license !== "MIT") {
    throw new Error("Published manifest must declare MIT");
  }
  if (installedManifest.exports?.["./styles/fonts/gavia.css"] !== "./styles/fonts/gavia.css"
    || installedManifest.exports?.["./fonts/gavia/*"] !== "./fonts/gavia/*") {
    throw new Error("Published manifest is missing the public font exports");
  }

  // Check the archive against the accepted drawing, independently of the mutable manifest.
  const packedFontDirectory = join(installedPackageDir, "fonts", "gavia");
  const canonicalFontDirectory = join(uiKitDir, "fonts", "gavia");
  const packedFontManifest = JSON.parse(readFileSync(join(packedFontDirectory, "manifest.json"), "utf8"));
  const verifier = readFileSync(join(repoRoot, "scripts", "fonts", "verify_fonts.py"), "utf8");
  const acceptedBlock = /APPROVED_SANS_0600_SHA256 = \{([\s\S]*?)\r?\n\}/.exec(verifier)?.[1];
  const acceptedHashes = Object.fromEntries([...(acceptedBlock ?? "").matchAll(/'(Gavia-[^']+\.(?:ttf|woff2))': '([a-f0-9]{64})'/g)]
    .map((match) => [match[1], match[2]]));
  if (Object.keys(acceptedHashes).length !== 24 || packedFontManifest.family !== "Gavia Sans"
    || packedFontManifest.version !== "0.600" || packedFontManifest.license !== "OFL-1.1"
    || packedFontManifest.faces.length !== 12) {
    throw new Error("Packed font family differs from the accepted Gavia Sans 0.600 release");
  }
  const packedFontFiles = readdirSync(packedFontDirectory).filter((file) => /\.(?:ttf|woff2)$/.test(file)).sort();
  const acceptedWebFonts = Object.keys(acceptedHashes).filter((file) => file.endsWith(".woff2")).sort();
  const variableManifestPath = join(packedFontDirectory, "variable-manifest.json");
  const variableManifest = existsSync(variableManifestPath) ? JSON.parse(readFileSync(variableManifestPath, "utf8")) : null;
  const variableFiles = variableManifest?.files ?? [];
  if (variableManifest) {
    if (variableManifest.family !== "Gavia Sans" || variableManifest.axis?.tag !== "wght"
      || variableManifest.axis.minimum !== 100 || variableManifest.axis.default !== 400
      || variableManifest.axis.maximum !== 700 || !Array.isArray(variableFiles) || variableFiles.length !== 4
      || variableManifest.version !== packedFontManifest.version || variableManifest.license !== packedFontManifest.license) {
      throw new Error("Packed variable font has an invalid family, axis or subset inventory");
    }
    const names = new Set();
    const suffixes = { full: "", core: "-Core" };
    const coverage = new Map();
    const unicodeCharacters = (range) => {
      if (typeof range !== "string" || !range.trim()) throw new Error("Packed variable font has no unicode range");
      const characters = new Set();
      for (const part of range.split(/\s*,\s*/)) {
        const match = /^U\+([\dA-F]{4,6})(?:-([\dA-F]{4,6}))?$/i.exec(part);
        if (!match) throw new Error("Packed variable font has an invalid unicode range: " + part);
        const first = Number.parseInt(match[1], 16);
        const last = Number.parseInt(match[2] ?? match[1], 16);
        if (last < first || last > 0x10ffff) throw new Error("Packed variable font has invalid unicode bounds: " + part);
        for (let character = first; character <= last; character += 1) characters.add(character);
      }
      return characters;
    };
    for (const record of variableFiles) {
      const expected = "Gavia-Variable" + (record?.style === "italic" ? "-Italic" : "") + suffixes[record?.subset] + ".woff2";
      if (!record || !["normal", "italic"].includes(record.style) || !Object.hasOwn(suffixes, record.subset)
        || record.file !== expected || names.has(record.file) || typeof record.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(record.sha256)
        || !Number.isSafeInteger(record.bytes) || record.bytes <= 0) {
        throw new Error("Packed variable font has an unsafe, duplicate or invalid file record");
      }
      names.add(record.file);
      coverage.set(record.style + "/" + record.subset, unicodeCharacters(record.unicodeRange));
      const bytes = readFileSync(join(packedFontDirectory, record.file));
      if (bytes.length !== record.bytes || bytes.toString("ascii", 0, 4) !== "wOF2"
        || bytes.readUInt32BE(4) !== 0x00010000 || bytes.readUInt32BE(8) !== bytes.length
        || createHash("sha256").update(bytes).digest("hex") !== record.sha256) {
        throw new Error("Packed variable font differs from its generated manifest: " + record.file);
      }
      if (record.subset === "core" && bytes.length > 80_000) {
        throw new Error("Packed Core font exceeds its 80,000-byte budget: " + record.style);
      }
    }
    const sorted = (characters) => [...characters].sort((left, right) => left - right);
    const combiningMark = (character) => (character >= 0x300 && character <= 0x36f)
      || (character >= 0x1ab0 && character <= 0x1aff) || (character >= 0x1dc0 && character <= 0x1dff)
      || (character >= 0x20d0 && character <= 0x20ff) || (character >= 0xfe20 && character <= 0xfe2f);
    for (const style of ["normal", "italic"]) {
      const full = coverage.get(style + "/full");
      const core = coverage.get(style + "/core");
      if (!full || !core || [...core].some((character) => !full.has(character) || combiningMark(character))) {
        throw new Error("Packed Core must stay inside complete fallback coverage and defer combining marks: " + style);
      }
    }
    if (JSON.stringify(sorted(coverage.get("normal/full"))) !== JSON.stringify(sorted(coverage.get("italic/full")))) {
      throw new Error("Packed variable-font styles have different full coverage");
    }
    if (readFileSync(variableManifestPath, "utf8").replaceAll("\r\n", "\n")
      !== readFileSync(join(canonicalFontDirectory, "variable-manifest.json"), "utf8").replaceAll("\r\n", "\n")) {
      throw new Error("Packed variable-font manifest differs from its canonical source");
    }
    if (readFileSync(join(packedFontDirectory, "VARIABLE-FONTLOG.txt"), "utf8").replaceAll("\r\n", "\n")
      !== readFileSync(join(canonicalFontDirectory, "VARIABLE-FONTLOG.txt"), "utf8").replaceAll("\r\n", "\n")) {
      throw new Error("Packed variable-font notices differ from their canonical source");
    }
  }
  const expectedPackedFonts = [...acceptedWebFonts, ...variableFiles.map((record) => record.file)].sort();
  if (JSON.stringify(packedFontFiles) !== JSON.stringify(expectedPackedFonts)
    || existsSync(join(packedFontDirectory, "qa-report.json"))) {
    throw new Error("Packed font family must retain accepted static WOFF2s, declared variable files and exclude TTF/QA artifacts");
  }
  for (const face of packedFontManifest.faces) {
    for (const format of ["woff2"]) {
      const asset = face[format];
      const actual = createHash("sha256").update(readFileSync(join(packedFontDirectory, asset.file))).digest("hex");
      if (asset.sha256 !== acceptedHashes[asset.file] || actual !== acceptedHashes[asset.file]) {
        throw new Error("Packed font failed accepted SHA256: " + asset.file);
      }
    }
  }
  for (const filename of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt", "manifest.json"]) {
    const normalize = (text) => text.replaceAll("\r\n", "\n");
    if (normalize(readFileSync(join(packedFontDirectory, filename), "utf8"))
      !== normalize(readFileSync(join(canonicalFontDirectory, filename), "utf8"))) {
      throw new Error("Packed font metadata or notices differ: " + filename);
    }
  }
  const packedFontLicense = readFileSync(join(packedFontDirectory, "OFL.txt"), "utf8");
  if (!packedFontLicense.includes("SIL OPEN FONT LICENSE Version 1.1")
    || !packedFontLicense.includes("The Onest Project Authors") || !packedFontLicense.includes("The Gavia Font Project Contributors")) {
    throw new Error("Packed font software must retain its OFL license and both copyright notices");
  }
  const fontStylesheetPath = join(installedPackageDir, "styles", "fonts", "gavia.css");
  const fontStylesheet = readFileSync(fontStylesheetPath, "utf8");
  const fontFaces = [...fontStylesheet.matchAll(/@font-face\s*\{([^}]+)\}/g)];
  const staticFaces = fontFaces.filter(([, block]) => /font-weight:\s*\d+\s*;/.test(block)
    && /font-family:\s*["']Gavia(?: Sans)?["']\s*;/.test(block));
  if (staticFaces.length !== 24) throw new Error("Packed font stylesheet must retain 12 canonical static faces and 12 legacy aliases");
  for (const family of ["Gavia Sans", "Gavia"]) for (const face of packedFontManifest.faces) {
    const matches = staticFaces.filter(([, block]) => block.match(/font-weight:\s*(\d+)\s*;/)?.[1] === String(face.weight)
      && block.match(/font-style:\s*(normal|italic)\s*;/)?.[1] === face.style
      && block.match(/font-family:\s*["']([^"']+)["']\s*;/)?.[1] === family);
    const block = matches[0]?.[1];
    const url = block?.match(/url\(["']([^"']+)["']\)/)?.[1];
    if (matches.length !== 1 || !block?.includes('font-family: "' + family + '";')
      || url !== "../../fonts/gavia/" + face.woff2.file
      || !existsSync(resolve(dirname(fontStylesheetPath), url))) {
      throw new Error("Packed font CSS has a broken face or URL: " + face.name);
    }
  }
  const variableFaces = fontFaces.filter(([, block]) => /font-weight:\s*100\s+700\s*;/.test(block)
    && /font-family:\s*["']Gavia(?: Sans)?["']\s*;/.test(block));
  if (variableFaces.length !== (variableFiles.length ? 8 : 0)) throw new Error("Packed variable-font CSS has an incomplete subset registration");
  for (const record of variableFiles) {
    const matching = variableFaces.filter(([, block]) => block.includes("../../fonts/gavia/" + record.file));
    if (matching.length !== 2
      || JSON.stringify(matching.map(([, block]) => block.match(/font-family:\s*["']([^"']+)["']\s*;/)?.[1]).sort())
      !== JSON.stringify(["Gavia", "Gavia Sans"])
      || matching.some(([, block]) => !block.includes("font-style: " + record.style + ";")
        || !block.includes("unicode-range: " + record.unicodeRange + ";") || !/font-display:\s*swap\s*;/.test(block))) {
      throw new Error("Packed variable-font CSS has a broken style, subset or URL: " + record.file);
    }
    if (record.subset === "core") {
      const fullFile = variableFiles.find((file) => file.style === record.style && file.subset === "full");
      for (const family of ["Gavia Sans", "Gavia"]) {
        const familyBlock = (block) => block.includes('font-family: "' + family + '";');
        const fullIndex = variableFaces.findIndex(([, block]) => familyBlock(block) && block.includes(fullFile.file));
        const coreIndex = variableFaces.findIndex(([, block]) => familyBlock(block) && block.includes(record.file));
        if (fullIndex < 0 || coreIndex <= fullIndex) throw new Error("Core must follow its complete fallback: " + record.file);
      }
    }
  }
  const builtAssets = join(consumerDir, "dist", "assets");
  const emittedFonts = readdirSync(builtAssets).filter((file) => file.endsWith(".woff2"));
  const emittedHashes = emittedFonts.map((file) => createHash("sha256").update(readFileSync(join(builtAssets, file))).digest("hex")).sort();
  const expectedWebHashes = [...packedFontManifest.faces.map((face) => face.woff2.sha256),
    ...variableFiles.map((file) => file.sha256)].sort();
  if (JSON.stringify(emittedHashes) !== JSON.stringify(expectedWebHashes)) {
    throw new Error("Consumer build did not emit the accepted static fonts and CSS-referenced variable subsets");
  }
  const builtCss = readdirSync(builtAssets).filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(builtAssets, file), "utf8")).join("\n");
  const builtFontFaces = [...builtCss.matchAll(/@font-face\s*\{([^}]+)\}/g)]
    .filter(([, block]) => /font-family:["']?Gavia(?: Sans)?["';]/.test(block));
  if (builtFontFaces.length !== 24 + variableFaces.length) throw new Error("Consumer CSS did not preserve Gavia faces, subsets and legacy aliases");
  for (const [, block] of builtFontFaces) {
    const fontUrl = block.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    const emittedPath = fontUrl?.startsWith("/") ? join(consumerDir, "dist", fontUrl.slice(1)) : resolve(builtAssets, fontUrl ?? "");
    if (!fontUrl || !existsSync(emittedPath)) throw new Error("Consumer font CSS has an unresolved emitted URL: " + fontUrl);
  }
  console.log("Packed font smoke passed: 12 accepted WOFF2 files, OFL notices, 12 canonical CSS faces plus legacy aliases");

  // Git checkouts may use CRLF on Windows and LF on the publishing runner.
  const packedLicense = readFileSync(join(installedPackageDir, "LICENSE"), "utf8").replaceAll("\r\n", "\n");
  const canonicalLicense = readFileSync(join(repoRoot, "LICENSE"), "utf8").replaceAll("\r\n", "\n");
  if (packedLicense !== canonicalLicense) {
    throw new Error("Packed LICENSE differs from the repository license");
  }
  for (const [name, content] of Object.entries(packageDocumentation(repoRoot))) {
    if (readFileSync(join(installedPackageDir, name), "utf8").replaceAll("\r\n", "\n") !== content) {
      throw new Error(`Packed ${name} is out of sync with canonical repository sources`);
    }
  }
  if (readFileSync(join(installedPackageDir, "dist", "index.js"), "utf8").match(/primevue|primeicons|@primeuix/i)) {
    throw new Error("Published JavaScript still references PrimeVue or PrimeIcons");
  }

  if (!existsSync(join(consumerDir, "dist", "index.html"))) {
    throw new Error("Consumer fixture did not produce dist/index.html");
  }

  const browser = browserRequested ? await checkPackedBrowser(consumerDir, selectedManager + "-vue-" + (registryVueVersion ?? workspaceVueVersion)) : undefined;
  const evidenceDir = join(temporaryBase, "package-verification");
  mkdirSync(evidenceDir, { recursive: true });
  const installedVue = JSON.parse(readFileSync(join(consumerDir, "node_modules", "vue", "package.json"), "utf8"));
  const evidencePath = join(evidenceDir, selectedManager + "-vue-" + installedVue.version + "-" + (browserRequested ? "browser" : "node") + ".json");
  writeFileSync(evidencePath, JSON.stringify({
    package: packageJson.name, version: packageJson.version,
    toolchain: "Pinned workspace Vue/Vite tooling; explicit consumer TypeScript path; package installed from the archive",
    typescriptVersion: JSON.parse(readFileSync(join(consumerDir, "node_modules/typescript/package.json"), "utf8")).version,
    strictTemplates: true, jsx: true,
    manager: selectedManager, managerVersion: consumerTool?.version ?? process.env.npm_config_user_agent?.split(" ")[0], vueVersion: installedVue.version,
    archiveSha256: createHash("sha256").update(readFileSync(archivePath)).digest("hex"),
    copiedExamples: copiedExamples.length, apiContractFiles, nativeAndSSR, buttonBundle,
    browser: browser ?? { skipped: true, command: "pnpm verify:package:browser" }
  }, null, 2) + "\n");
  console.log("Package verification evidence: " + evidencePath);
  console.log(`Consumer smoke passed for ${packageJson.name}@${packageJson.version}`);
  console.log(`Copied showcase sources passed typecheck and build: ${copiedExamples.length}`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
