import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

/** Separate, crawlable language URLs without duplicating the application. */
export function gaviaSeoAssets(): Plugin {
  return {
    name: "gavia-seo-assets",
    generateBundle() {
      const source = readFileSync(fileURLToPath(new URL("../../../packages/ui-kit/src/manifest/types.ts", import.meta.url)), "utf8");
      const components = [...source.matchAll(/^  (Wl[A-Za-z]+): "\d+\.\d+\.\d+"/gm)].map((match) => match[1]!);
      const routes = ["", "?view=docs", "?view=system", "?view=font", "?view=theme-builder", "?view=changelog",
        ...["typography", "layout", "responsive", "content", "icons", "colors", "quality"].map((section) => "?view=docs&section=" + section),
        ...components.map((component) => "?view=docs&component=" + component)];
      const escape = (value: string): string => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const base = "https://whitewolf06.github.io/gavia-ui/";
      const entries = routes.flatMap((route) => ["en", "ru"].map((language) => {
        const url = new URL(route || base, base); url.searchParams.set("lang", language);
        const alternate = (lang: string): string => { const target = new URL(url); target.searchParams.set("lang", lang === "ru" ? "ru" : "en"); return escape(target.href); };
        return "<url><loc>" + escape(url.href) + "</loc>" + ["en", "ru", "x-default"].map((lang) =>
          '<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + alternate(lang) + '"/>').join("") + "</url>";
      }));
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + entries.join("\n") + "</urlset>\n" });
    }
  };
}
