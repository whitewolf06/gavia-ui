import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { consumerSource } from "./example-source.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const uiKitDir = join(repoRoot, "packages", "ui-kit");
const args = process.argv.slice(2);
if (args.length !== 0 && (args.length !== 2 || args[0] !== "--archive" || !args[1].trim())) {
  throw new Error("Usage: pnpm verify:package [--archive <path>]");
}
const requestedArchive = args.length === 2 ? resolve(args[1]) : undefined;
if (requestedArchive && (!existsSync(requestedArchive) || !statSync(requestedArchive).isFile())) {
  throw new Error(`Archive must be an existing file: ${requestedArchive}`);
}
const packageManager = process.env.npm_execpath;

if (!packageManager) {
  throw new Error("verify:package must be started through pnpm so npm_execpath is available");
}

const packageJson = JSON.parse(readFileSync(join(uiKitDir, "package.json"), "utf8"));
const temporaryBase = join(repoRoot, ".tmp");
mkdirSync(temporaryBase, { recursive: true });
const temporaryRoot = mkdtempSync(join(temporaryBase, "gavia-ui-consumer-"));
const packDir = join(temporaryRoot, "package");
const consumerDir = join(temporaryRoot, "consumer");

function localPackage(packageName) {
  const packagePath = join(uiKitDir, "node_modules", ...packageName.split("/"));
  if (!existsSync(join(packagePath, "package.json"))) {
    throw new Error(`Workspace dependency ${packageName} is not installed`);
  }
  return `link:${packagePath.replaceAll("\\", "/")}`;
}

function runPnpm(args, cwd) {
  const isJavaScriptEntrypoint = /\.(?:c?js|mjs)$/i.test(packageManager);
  const executable = isJavaScriptEntrypoint ? process.execPath : packageManager;
  const executableArgs = isJavaScriptEntrypoint ? [packageManager, ...args] : args;

  execFileSync(executable, executableArgs, {
    cwd,
    env: process.env,
    stdio: "inherit"
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
      build: "vite build",
      typecheck: "vue-tsc --noEmit -p tsconfig.json"
    },
    dependencies: {
      "gavia-ui": `file:${archivePath.replaceAll("\\", "/")}`,
      vue: localPackage("vue")
    },
    devDependencies: {
      "@vitejs/plugin-vue": localPackage("@vitejs/plugin-vue"),
      typescript: localPackage("typescript"),
      vite: localPackage("vite"),
      "vue-tsc": localPackage("vue-tsc")
    }
  };

  write("package.json", `${JSON.stringify(consumerPackage, null, 2)}\n`);
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
          lib: ["ESNext", "DOM", "DOM.Iterable"],
          types: ["vite/client"]
        },
        include: ["src/**/*.ts", "src/**/*.vue"]
      },
      null,
      2
    )}\n`
  );
  write(
    "vite.config.ts",
    `import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\n\nexport default defineConfig({ plugins: [vue()] });\n`
  );
  write("index.html", '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n');
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
import regularFontUrl from "gavia-ui/fonts/gavia/Gavia-Regular.woff2?url";
import App from "./App.vue";

if (!regularFontUrl) throw new Error("Font asset export did not resolve");
document.documentElement.dataset.wlTheme = "gavia";
const spacing: WlSpace = "lg";
const token: WlDesignTokenName = "--wl-space-lg";
if (wlManifest.length !== packageManifest.length) throw new Error("Runtime and JSON manifests differ");
if (wlDesignTokens.length !== designCatalog.tokens.length || resolveWlToken(token) !== "16px") throw new Error("Design token exports differ");
if (getWlThemeTokens("graphite")[token] !== "16px" || spacing !== "lg") throw new Error("Theme snapshot differs");
if (!resolveWlToken("--wl-font", "gavia").startsWith('"Gavia",')) throw new Error("Gavia typography was not packaged");
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
  const exampleImports = copiedExamples.map((path, index) => `import Example${index} from "${path}";`).join("\n");
  write("src/App.vue", `<script setup lang="ts">
${exampleImports}
import { WlToast, WlConfirmDialog } from "gavia-ui";
const examples = [${copiedExamples.map((_, index) => `Example${index}`).join(", ")}];
</script>
<template><component :is="examples[0]" /><WlToast /><WlConfirmDialog /></template>
`);

  runPnpm(["--ignore-workspace", "install", "--offline", "--ignore-scripts"], consumerDir);
  runPnpm(["--ignore-workspace", "run", "typecheck"], consumerDir);
  runPnpm(["--ignore-workspace", "run", "build"], consumerDir);

  const installedPackageDir = join(consumerDir, "node_modules", ...packageJson.name.split("/"));
  const requiredFiles = [
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
    "styles/fonts/gavia.css",
    "fonts/gavia/manifest.json",
    "fonts/gavia/qa-report.json",
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
  const acceptedBlock = /APPROVED_0600_SHA256 = \{([\s\S]*?)\r?\n\}/.exec(verifier)?.[1];
  const acceptedHashes = Object.fromEntries([...(acceptedBlock ?? "").matchAll(/'(Gavia-[^']+\.(?:ttf|woff2))': '([a-f0-9]{64})'/g)]
    .map((match) => [match[1], match[2]]));
  if (Object.keys(acceptedHashes).length !== 24 || packedFontManifest.family !== "Gavia"
    || packedFontManifest.version !== "0.600" || packedFontManifest.license !== "OFL-1.1"
    || packedFontManifest.faces.length !== 12) {
    throw new Error("Packed font family differs from the accepted Gavia 0.600 release");
  }
  const packedFontFiles = readdirSync(packedFontDirectory).filter((file) => /\.(?:ttf|woff2)$/.test(file)).sort();
  if (JSON.stringify(packedFontFiles) !== JSON.stringify(Object.keys(acceptedHashes).sort())) {
    throw new Error("Packed font family must contain exactly the 24 current font files");
  }
  for (const face of packedFontManifest.faces) {
    for (const format of ["ttf", "woff2"]) {
      const asset = face[format];
      const actual = createHash("sha256").update(readFileSync(join(packedFontDirectory, asset.file))).digest("hex");
      if (asset.sha256 !== acceptedHashes[asset.file] || actual !== acceptedHashes[asset.file]) {
        throw new Error("Packed font failed accepted SHA256: " + asset.file);
      }
    }
  }
  for (const filename of ["OFL.txt", "Onest-OFL.txt", "FONTLOG.txt", "manifest.json", "qa-report.json"]) {
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
  if (fontFaces.length !== 12) throw new Error("Packed font stylesheet must register all 12 faces");
  for (const face of packedFontManifest.faces) {
    const matches = fontFaces.filter(([, block]) => block.match(/font-weight:\s*(\d+)\s*;/)?.[1] === String(face.weight)
      && block.match(/font-style:\s*(normal|italic)\s*;/)?.[1] === face.style);
    const block = matches[0]?.[1];
    const url = block?.match(/url\(["']([^"']+)["']\)/)?.[1];
    if (matches.length !== 1 || !block?.match(/font-family:\s*["']Gavia["']\s*;/)
      || url !== "../../fonts/gavia/" + face.woff2.file
      || !existsSync(resolve(dirname(fontStylesheetPath), url))) {
      throw new Error("Packed font CSS has a broken face or URL: " + face.name);
    }
  }
  const builtAssets = join(consumerDir, "dist", "assets");
  const emittedFonts = readdirSync(builtAssets).filter((file) => file.endsWith(".woff2"));
  const emittedHashes = emittedFonts.map((file) => createHash("sha256").update(readFileSync(join(builtAssets, file))).digest("hex")).sort();
  const expectedWebHashes = packedFontManifest.faces.map((face) => face.woff2.sha256).sort();
  if (JSON.stringify(emittedHashes) !== JSON.stringify(expectedWebHashes)) {
    throw new Error("Consumer build did not emit exactly the 12 accepted WOFF2 assets");
  }
  const builtCss = readdirSync(builtAssets).filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(builtAssets, file), "utf8")).join("\n");
  const builtFontFaces = [...builtCss.matchAll(/@font-face\s*\{([^}]+)\}/g)]
    .filter(([, block]) => /font-family:["']?Gavia(?:["']|;)/.test(block));
  if (builtFontFaces.length !== 12) throw new Error("Consumer CSS did not preserve the 12 Gavia font faces");
  for (const [, block] of builtFontFaces) {
    const fontUrl = block.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    const emittedPath = fontUrl?.startsWith("/") ? join(consumerDir, "dist", fontUrl.slice(1)) : resolve(builtAssets, fontUrl ?? "");
    if (!fontUrl || !existsSync(emittedPath)) throw new Error("Consumer font CSS has an unresolved emitted URL: " + fontUrl);
  }
  console.log("Packed font smoke passed: 24 accepted binaries, OFL notices, 12 CSS faces and emitted WOFF2 assets");

  // Git checkouts may use CRLF on Windows and LF on the publishing runner.
  const packedLicense = readFileSync(join(installedPackageDir, "LICENSE"), "utf8").replaceAll("\r\n", "\n");
  const canonicalLicense = readFileSync(join(repoRoot, "LICENSE"), "utf8").replaceAll("\r\n", "\n");
  if (packedLicense !== canonicalLicense) {
    throw new Error("Packed LICENSE differs from the repository license");
  }
  const canonicalChangelog = readFileSync(join(repoRoot, "CHANGELOG.md"), "utf8")
    .replaceAll("(docs/", "(https://github.com/whitewolf06/gavia-ui/blob/main/docs/");
  if (readFileSync(join(installedPackageDir, "CHANGELOG.md"), "utf8") !== canonicalChangelog) {
    throw new Error("Packed changelog is out of sync with the repository");
  }
  if (readFileSync(join(installedPackageDir, "dist", "index.js"), "utf8").match(/primevue|primeicons|@primeuix/i)) {
    throw new Error("Published JavaScript still references PrimeVue or PrimeIcons");
  }

  if (!existsSync(join(consumerDir, "dist", "index.html"))) {
    throw new Error("Consumer fixture did not produce dist/index.html");
  }

  console.log(`Consumer smoke passed for ${packageJson.name}@${packageJson.version}`);
  console.log(`Copied showcase sources passed typecheck and build: ${copiedExamples.length}`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
