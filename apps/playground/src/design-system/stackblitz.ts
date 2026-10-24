/** Build only text files; the browser submits them after the user's explicit click. */
export function stackBlitzFields(source: string, version: string): Record<string, string> {
  const packageJson = { name: "gavia-ui-example", private: true, type: "module", scripts: { dev: "vite --host 0.0.0.0", build: "vite build" },
    dependencies: { "gavia-ui": version, vue: "^3.4.0" }, devDependencies: { vite: "^6.3.5", "@vitejs/plugin-vue": "^5.2.4", typescript: "~5.8.3" } };
  const main = 'import { createApp } from "vue";\nimport { WlConfig, WlToastService, WlConfirmationService, wlLocaleEn } from "gavia-ui";\nimport "gavia-ui/styles/reset.css";\nimport "gavia-ui/styles/base.css";\nimport "gavia-ui/styles/primitives.css";\nimport "gavia-ui/themes/gavia.css";\nimport "gavia-ui/styles/fonts/gavia.css";\nimport App from "./App.vue";\ndocument.documentElement.dataset.wlTheme = "gavia";\ncreateApp(App).use(WlConfig, { locale: wlLocaleEn }).use(WlToastService).use(WlConfirmationService).mount("#app");';
  const files = { "src/App.vue": source, "src/main.ts": main,
    "index.html": '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Gavia UI example</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>',
    "package.json": JSON.stringify(packageJson, null, 2), "vite.config.ts": 'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({ plugins: [vue()] });',
    ".stackblitzrc": JSON.stringify({ startCommand: "pnpm dev" }) };
  return { "project[title]": "Gavia UI example", "project[description]": "Editable Vue 3 and TypeScript example from the Gavia UI documentation.",
    "project[template]": "node", "project[dependencies]": "{}", ...Object.fromEntries(Object.entries(files).map(([path, content]) => [`project[files][${path}]`, content])) };
}
