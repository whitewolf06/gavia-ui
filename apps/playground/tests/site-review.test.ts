import { wlManifest } from "gavia-ui";
// @vitest-environment node
import { expect, it } from "vitest";
import { documentationRoutes, gaviaSeoAssets } from "../build/seo-assets";
import { stackBlitzFields } from "../src/design-system/stackblitz";
import { documentationGuide, documentationGuideSections } from "../src/documentation/guides";
import { loadDocumentationSearch, searchDocumentation } from "../src/documentation/search";

it("provides substantive English and Russian guides for every new documentation path", () => {
  for (const section of documentationGuideSections) for (const language of ["en", "ru"]) {
    const guide = documentationGuide(section, language);
    expect(guide.title.trim()).not.toBe("");
    expect(guide.description).not.toMatch(/scaffold|placeholder/i);
    expect(guide.sections.length).toBeGreaterThan(0);
    expect(new Set(guide.sections.map((entry) => entry.title)).size).toBe(guide.sections.length);
    expect(guide.title).not.toBe(documentationGuide(section, language === "en" ? "ru" : "en").title);
  }
});

it("finds API details and full guide prose in search rather than just component names", async () => {
  const entries = await loadDocumentationSearch("en");
  expect(searchDocumentation(entries, "rowKey").some((entry) => entry.component === "WlTable")).toBe(true);
  expect(searchDocumentation(entries, "screen reader").some((entry) => entry.section === "accessibility")).toBe(true);
  expect(searchDocumentation(entries, "random-unknown-phrase-97129")).toEqual([]);
  expect(searchDocumentation(entries, "")).toEqual([]);
});

it("builds an editable public consumer from the exact copied SFC", () => {
  const source = '<script setup lang="ts">import { WlButton } from "gavia-ui";</script><template><WlButton>Save</WlButton></template>';
  const fields = stackBlitzFields(source, "0.99.0");
  expect(fields["project[template]"]).toBe("node");
  expect(fields["project[files][src/App.vue]"]).toBe(source);
  const manifest = JSON.parse(fields["project[files][package.json]"]!);
  expect(manifest.dependencies).toEqual({ "gavia-ui": "0.99.0", vue: "^3.4.0" });
  expect(fields["project[files][src/main.ts]"]).toContain('import "gavia-ui/styles/base.css"');
  expect(fields["project[files][src/main.ts]"]).toContain('import "gavia-ui/styles/primitives.css"');
  expect(fields["project[files][src/main.ts]"]).toContain('import "gavia-ui/styles/fonts/gavia.css"');
});

it("emits canonical multilingual sitemap, prerender input and complete machine-readable API prose", () => {
  const routes = documentationRoutes(["WlButton"]);
  expect(routes).toContain("docs/components/WlButton/");
  expect(routes).toContain("ru/docs/components/WlButton/");
  expect(routes.some((path) => path.includes("?"))).toBe(false);
  const files = new Map<string, string>();
  const plugin = gaviaSeoAssets();
  const generate = plugin.generateBundle;
  if (typeof generate !== "function") throw new Error("Missing asset generator");
  const context = { emitFile: (asset: { fileName: string; source: string }) => files.set(asset.fileName, asset.source) };
  generate.call(context as never, {} as never, {} as never, false);
  expect(files.get("sitemap.xml")).toContain("/ru/docs/components/WlButton/");
  expect(files.get("llms.txt")).toContain("docs/theming/");
  expect(files.get("llms-full.txt")).toContain("rowKey");
  const paths = JSON.parse(files.get("route-manifest.json")!).routes;
  for (const entry of wlManifest) expect(paths).toContain(`docs/components/${entry.name}/`);
  const tooltip = wlManifest.find((entry) => entry.name === "WlTooltipComponent")!;
  expect(tooltip.props.some((prop) => prop.name === "content")).toBe(true);
  expect(tooltip.props.some((prop) => prop.name === "variant")).toBe(false);
});
