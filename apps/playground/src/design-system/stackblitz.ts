/** Build only text files; the browser submits them after the user's explicit click. */
export function stackBlitzFields(source: string, version: string, packageName = "legato-ui"): Record<string, string> {
  const theme = packageName === "gavia-ui" ? "gavia" : "legato";
  const dependency = packageName === "legato-ui" ? version : "npm:" + packageName + "@" + version;
  const packageJson = { name: "legato-ui-example", private: true, type: "module", scripts: { dev: "vite --host 0.0.0.0", build: "vite build" },
    dependencies: { "legato-ui": dependency, vue: "^3.4.0" }, devDependencies: { vite: "^6.3.5", "@vitejs/plugin-vue": "^5.2.4", typescript: "~5.8.3" } };
  const main = `import { createApp } from "vue";\nimport { WlConfig, WlToastService, WlConfirmationService, wlLocaleEn } from "legato-ui";\nimport "legato-ui/styles/reset.css";\nimport "legato-ui/styles/base.css";\nimport "legato-ui/styles/primitives.css";\nimport "legato-ui/themes/${theme}.css";\nimport "legato-ui/styles/fonts/${theme}.css";\nimport App from "./App.vue";\ndocument.documentElement.dataset.wlTheme = "${theme}";\ncreateApp(App).use(WlConfig, { locale: wlLocaleEn }).use(WlToastService).use(WlConfirmationService).mount("#app");`;
  const files = { "src/App.vue": source, "src/main.ts": main,
    "index.html": '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Legato UI example</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>',
    "package.json": JSON.stringify(packageJson, null, 2), "vite.config.ts": 'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({ plugins: [vue()] });',
    ".stackblitzrc": JSON.stringify({ startCommand: "pnpm dev" }) };
  return { "project[title]": "Legato UI example", "project[description]": "Editable Vue 3 and TypeScript example from the Legato UI documentation.",
    "project[template]": "node", "project[dependencies]": "{}", ...Object.fromEntries(Object.entries(files).map(([path, content]) => [`project[files][${path}]`, content])) };
}
