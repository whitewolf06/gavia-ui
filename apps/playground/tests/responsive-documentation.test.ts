import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSSRApp, type Plugin } from "vue";
import { compileScript, compileStyle, compileTemplate, parse } from "vue/compiler-sfc";
import { renderToString } from "vue/server-renderer";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { foundationHeadings } from "../src/documentation/catalog";
import MediaBehavior from "../src/documentation/foundations/examples/MediaBehavior.vue";
import { playgroundI18n } from "../src/i18n";

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
const base = new NodeURL("../src/documentation/foundations/", import.meta.url);
const names = readdirSync(fileURLToPath(new NodeURL("examples/", base)))
  .filter((filename) => filename.endsWith(".vue"))
  .map((filename) => filename.slice(0, -4))
  .sort();
describe("copyable foundation examples", () => {
  for (const name of names) it(name + " compiles with public consumer imports and scoped CSS", () => {
    const filename = name + ".vue";
    const source = consumerSource(readFileSync(fileURLToPath(new NodeURL("examples/" + filename, base)), "utf8"));
    const parsed = parse(source, { filename });
    expect(parsed.errors).toEqual([]);
    expect(source).not.toMatch(/packages\/ui-kit|usePlaygroundI18n|\bt\(['"](?:examples|documentation)\./);
    expect(parsed.descriptor.template?.content.trim()).toBeTruthy();
    const script = parsed.descriptor.script || parsed.descriptor.scriptSetup
      ? compileScript(parsed.descriptor, { id: name })
      : undefined;
    for (const imported of Object.values(script?.imports ?? {})) {
      expect(["gavia-ui", "vue"]).toContain(imported.source);
    }
    const template = compileTemplate({
      filename, id: name, source: parsed.descriptor.template!.content,
      compilerOptions: { bindingMetadata: script?.bindings ?? {} }
    });
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
