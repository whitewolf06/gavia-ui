import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const uiKitDir = join(repoRoot, "packages", "ui-kit");
const packageManager = process.env.npm_execpath;

if (!packageManager) {
  throw new Error("verify:package must be started through pnpm so npm_execpath is available");
}

const packageJson = JSON.parse(readFileSync(join(uiKitDir, "package.json"), "utf8"));
const temporaryBase = join(repoRoot, ".tmp");
mkdirSync(temporaryBase, { recursive: true });
const temporaryRoot = mkdtempSync(join(temporaryBase, "whiteui-consumer-"));
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
  mkdirSync(packDir, { recursive: true });
  mkdirSync(consumerDir, { recursive: true });

  runPnpm(["pack", "--pack-destination", packDir], uiKitDir);

  const archiveName = readdirSync(packDir).find((file) => file.endsWith(".tgz"));
  if (!archiveName) {
    throw new Error("pnpm pack did not produce a .tgz archive");
  }

  const archivePath = join(packDir, archiveName);
  const consumerPackage = {
    name: "whiteui-package-consumer-smoke",
    private: true,
    type: "module",
    scripts: {
      build: "vite build",
      typecheck: "vue-tsc --noEmit -p tsconfig.json"
    },
    dependencies: {
      "@whitelife-core/ui-kit": `file:${archivePath.replaceAll("\\", "/")}`,
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
    `import { createApp } from "vue";\nimport { WlConfig, createWlPt, wlLocaleRu, wlManifest } from "@whitelife-core/ui-kit";\nimport packageManifest from "@whitelife-core/ui-kit/manifest.json";\nimport "@whitelife-core/ui-kit/styles/reset.css";\nimport "@whitelife-core/ui-kit/styles/base.css";\nimport "@whitelife-core/ui-kit/themes/white.css";\nimport "@whitelife-core/ui-kit/themes/graphite.css";\nimport "@whitelife-core/ui-kit/themes/newspaper.css";\nimport App from "./App.vue";\n\nif (wlManifest.length !== packageManifest.length) {\n  throw new Error("Runtime and JSON manifests differ");\n}\n\ncreateApp(App).use(WlConfig, { pt: createWlPt(), locale: wlLocaleRu }).mount("#app");\n`
  );
  write(
    "src/App.vue",
    `<script setup lang="ts">\nimport { ref } from "vue";\nimport { WlButton, WlFilterBar, WlPageHeader, WlSelect } from "@whitelife-core/ui-kit";\n\nconst filtersOpen = ref(false);\nconst selected = ref<string | null>(null);\n</script>\n\n<template>\n  <WlPageHeader title="Consumer smoke" subtitle="Packed package" />\n  <WlFilterBar v-model:open="filtersOpen">\n    <WlButton>Apply</WlButton>\n    <WlSelect v-model="selected" :options="['A', 'B']" />\n  </WlFilterBar>\n</template>\n`
  );

  runPnpm(["--ignore-workspace", "install", "--offline", "--ignore-scripts"], consumerDir);
  runPnpm(["--ignore-workspace", "run", "typecheck"], consumerDir);
  runPnpm(["--ignore-workspace", "run", "build"], consumerDir);

  const installedPackageDir = join(consumerDir, "node_modules", "@whitelife-core", "ui-kit");
  const requiredFiles = [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/manifest.json",
    "styles/reset.css",
    "styles/base.css",
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
  if (JSON.stringify(installedManifest).match(/primevue|primeicons|@primeuix/i)) {
    throw new Error("Published manifest still references PrimeVue or PrimeIcons");
  }
  if (readFileSync(join(installedPackageDir, "dist", "index.js"), "utf8").match(/primevue|primeicons|@primeuix/i)) {
    throw new Error("Published JavaScript still references PrimeVue or PrimeIcons");
  }

  if (!existsSync(join(consumerDir, "dist", "index.html"))) {
    throw new Error("Consumer fixture did not produce dist/index.html");
  }

  console.log(`Consumer smoke passed for ${packageJson.name}@${packageJson.version}`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
