import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const forbidden = /primevue|primeicons|@primeuix/i;

function fail(message) { throw new Error(message); }
function read(path) { return readFileSync(join(root, path), "utf8"); }

for (const path of ["package.json", "packages/ui-kit/package.json", "apps/playground/package.json"]) {
  const manifest = JSON.parse(read(path));
  for (const group of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const name of Object.keys(manifest[group] ?? {})) {
      if (forbidden.test(name)) fail(`${path}: forbidden ${group} entry ${name}`);
    }
  }
}
const kit = JSON.parse(read("packages/ui-kit/package.json"));
if (Object.keys(kit.peerDependencies ?? {}).join(",") !== "vue" || kit.dependencies?.vue) {
  fail("The library must expose Vue as its sole peer and never bundle it");
}

function scan(path) {
  for (const entry of readdirSync(join(root, path), { withFileTypes: true })) {
    const relative = `${path}/${entry.name}`;
    if (entry.isDirectory()) scan(relative);
    else if (/\.(?:vue|ts|js|css)$/.test(entry.name)) {
      const source = read(relative);
      if (forbidden.test(source) || /\.p-[a-z]|\[data-p-/i.test(source)) {
        fail(`${relative}: forbidden dependency import or selector`);
      }
    }
  }
}
for (const path of ["packages/ui-kit/src", "packages/ui-kit/styles", "packages/ui-kit/themes", "apps/playground/src", "apps/playground/e2e"]) scan(path);
if (forbidden.test(read("pnpm-lock.yaml"))) fail("pnpm-lock.yaml still contains a forbidden package");

console.log("Dependency boundary verified: Vue is the only library peer; no PrimeVue/PrimeIcons code or lock entries");
