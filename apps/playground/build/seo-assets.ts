import type { Plugin } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { documentationGuideSections } from "../src/documentation/guides";

export function documentationRoutes(components: readonly string[]): string[] {
  const pages = ["", "docs/", "system/", "font/", "theme-builder/", "changelog/",
    ...["typography", "layout", "responsive", "content", "icons", "colors", "quality", ...documentationGuideSections].map((section) => `docs/${section}/`),
    ...components.map((component) => `docs/components/${component}/`)];
  return [...new Set(pages.flatMap((path) => [path, `ru/${path}`]))];
}

/** Separate, crawlable language URLs without duplicating the application. */
export function gaviaSeoAssets(): Plugin {
  let deploymentBase = "/";
  return {
    name: "gavia-seo-assets",
    configResolved(config) { deploymentBase = config.base; },
    generateBundle() {
      const api = JSON.parse(readFileSync(new URL("../../../packages/ui-kit/src/manifest/api.generated.json", import.meta.url), "utf8")) as Record<string, { props: Record<string, string>; emits: Record<string, string>; slots: Record<string, string>; models: Record<string, string> }>;
      const components = Object.keys(api).sort();
      const routes = documentationRoutes(components);
      const escape = (value: string): string => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const base = "https://whitewolf06.github.io/gavia-ui/";
      const entries = routes.map((path) => {
        const relative = path.replace(/^ru\//, "");
        const alternate = (language: string): string => escape(new URL((language === "ru" ? "ru/" : "") + relative, base).href);
        return `<url><loc>${escape(new URL(path, base).href)}</loc>` + ["en", "ru", "x-default"].map((language) =>
          `<xhtml:link rel="alternate" hreflang="${language}" href="${alternate(language)}"/>`).join("") + "</url>";
      });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + entries.join("\n") + "</urlset>\n" });
      this.emitFile({ type: "asset", fileName: "route-manifest.json", source: JSON.stringify({ base: deploymentBase, routes }, null, 2) + "\n" });
      const summary = ["# Gavia UI", "", "> Independent Vue 3 and TypeScript components with explicit CSS and five themes.", "", "Vue ^3.4.0 is the only required peer. Import CSS explicitly; router and business state belong to the consumer.", "", "## Guides",
        ...documentationGuideSections.map((section) => `- [${section}](${base}docs/${section}/)`), "", "## Components", ...components.map((name) => `- [${name}](${base}docs/components/${name}/)`), "", "## Reference", `- [Full text](${base}llms-full.txt)`, "- [Canonical repository](https://github.com/whitewolf06/gavia-ui)", ""].join("\n");
      this.emitFile({ type: "asset", fileName: "llms.txt", source: summary });
      const directory = new URL("../../../docs/guide/", import.meta.url);
      const guides = readdirSync(directory).filter((name) => name.endsWith(".md")).sort().map((name) => readFileSync(new URL(name, directory), "utf8"));
      const reference = components.map((name) => `## ${name}\n\n${base}docs/components/${name}/\n\n` + ["props", "models", "emits", "slots"].map((kind) =>
        `### ${kind}\n\n${Object.entries(api[name]![kind as keyof typeof api[string]]).map(([key, type]) => `- ${key}: ${type}`).join("\n")}`).join("\n\n"));
      this.emitFile({ type: "asset", fileName: "llms-full.txt", source: [summary, ...guides, ...reference].join("\n\n---\n\n") });
    }
  };
}
