// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { parse, compileScript, compileTemplate, compileStyle } from "vue/compiler-sfc";
import { createSSRApp, type Plugin } from "vue";
import { renderToString } from "vue/server-renderer";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { foundationHeadings } from "../../../apps/playground/src/documentation/catalog";
import MediaBehavior from "../../../apps/playground/src/documentation/foundations/examples/MediaBehavior.vue";
import { playgroundI18n } from "../../../apps/playground/src/i18n";

// Playground uses Vue 3.5 and kit tests Vue 3.4. Bridge only their Plugin types;
// the same real plugin is still installed and exercised at runtime.
const playgroundI18nPlugin = playgroundI18n as unknown as Plugin;

let previousLocale = playgroundI18n.global.locale.value;
beforeEach(() => {
  previousLocale = playgroundI18n.global.locale.value;
  playgroundI18n.global.locale.value = "en";
});
afterEach(() => {
  playgroundI18n.global.locale.value = previousLocale;
});
const base = new NodeURL("../../../apps/playground/src/documentation/foundations/", import.meta.url);
const names = ["ViewportLayout", "FluidGrid", "ContainerCard", "MediaBehavior"];
describe("copyable responsiveness examples", () => {
  for (const name of names) it(name + " compiles with public consumer imports and scoped CSS", () => {
    const filename = name + ".vue";
    const source = consumerSource(readFileSync(fileURLToPath(new NodeURL("examples/" + filename, base)), "utf8"));
    const parsed = parse(source, { filename });
    expect(parsed.errors).toEqual([]);
    expect(source).not.toMatch(/packages\/ui-kit|usePlaygroundI18n|\bt\(['"]examples\./);
    const script = compileScript(parsed.descriptor, { id: name });
    const template = compileTemplate({ filename, id: name, source: parsed.descriptor.template!.content, compilerOptions: { bindingMetadata: script.bindings } });
    expect(template.errors).toEqual([]);
    for (const style of parsed.descriptor.styles) {
      expect(compileStyle({ filename, id: name, source: style.content, scoped: style.scoped }).errors).toEqual([]);
    }
  });
  it("renders the behavior example on the server without reading window", async () => {
    expect(typeof window).toBe("undefined");
    const html = await renderToString(createSSRApp(MediaBehavior).use(playgroundI18nPlugin));
    expect(html).toContain("The width is determined after mounting");
    expect(html).not.toContain('id="responsive-behavior-filter"');
  });
  it("resolves each sidebar heading to a page or canonical example anchor", () => {
    const page = readFileSync(fileURLToPath(new NodeURL("ResponsiveDocumentation.vue", base)), "utf8");
    const ids = foundationHeadings("responsive").map((heading) => heading.id);
    expect(new Set(ids).size).toBe(ids.length);
    const canonicalExampleIds = ["docs-responsive-viewport", "docs-responsive-fluid", "docs-responsive-container", "docs-responsive-behavior"];
    for (const id of ids) expect(canonicalExampleIds.includes(id) || page.includes('id="' + id + '"')).toBe(true);
  });
});
