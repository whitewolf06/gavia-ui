// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { parse, compileScript, compileTemplate, compileStyle } from "vue/compiler-sfc";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { foundationHeadings } from "../../../apps/playground/src/documentation/catalog";
import MediaBehavior from "../../../apps/playground/src/documentation/foundations/examples/MediaBehavior.vue";
const base = new NodeURL("../../../apps/playground/src/documentation/foundations/", import.meta.url);
const names = ["ViewportLayout", "FluidGrid", "ContainerCard", "MediaBehavior"];
describe("copyable responsiveness examples", () => {
  for (const name of names) it(name + " compiles with public consumer imports and scoped CSS", () => {
    const filename = name + ".vue";
    const source = consumerSource(readFileSync(fileURLToPath(new NodeURL("examples/" + filename, base)), "utf8"));
    const parsed = parse(source, { filename });
    expect(parsed.errors).toEqual([]);
    expect(source).not.toContain("packages/ui-kit");
    const script = compileScript(parsed.descriptor, { id: name });
    const template = compileTemplate({ filename, id: name, source: parsed.descriptor.template!.content, compilerOptions: { bindingMetadata: script.bindings } });
    expect(template.errors).toEqual([]);
    for (const style of parsed.descriptor.styles) {
      expect(compileStyle({ filename, id: name, source: style.content, scoped: style.scoped }).errors).toEqual([]);
    }
  });
  it("renders the behavior example on the server without reading window", async () => {
    expect(typeof window).toBe("undefined");
    const html = await renderToString(createSSRApp(MediaBehavior));
    expect(html).toContain("Ширина определится после монтирования");
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
