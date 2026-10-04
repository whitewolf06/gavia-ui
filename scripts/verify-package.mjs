import { execFileSync } from "node:child_process";
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
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import App from "./App.vue";

const spacing: WlSpace = "lg";
const token: WlDesignTokenName = "--wl-space-lg";
if (wlManifest.length !== packageManifest.length) throw new Error("Runtime and JSON manifests differ");
if (wlDesignTokens.length !== designCatalog.tokens.length || resolveWlToken(token) !== "16px") throw new Error("Design token exports differ");
if (getWlThemeTokens("graphite")[token] !== "16px" || spacing !== "lg") throw new Error("Theme snapshot differs");
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
    "themes/newspaper.css"
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
  if (readFileSync(join(installedPackageDir, "LICENSE"), "utf8") !== readFileSync(join(repoRoot, "LICENSE"), "utf8")) {
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
