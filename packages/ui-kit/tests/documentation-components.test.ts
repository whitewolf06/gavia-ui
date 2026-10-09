// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { join } from "node:path";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { wlManifest } from "../src/manifest";
import { inputDocumentationExamples, inputDocumentationAccessibility } from "../../../apps/playground/src/documentation/components/inputs";
import { showcaseDocumentationExamples, showcaseDocumentationAccessibility } from "../../../apps/playground/src/documentation/components/showcase";
import { consumerSource } from "../../../scripts/example-source.mjs";
const directory = fileURLToPath(new NodeURL("../../../apps/playground/src/documentation/components/", import.meta.url));
const examples = { ...inputDocumentationExamples, ...showcaseDocumentationExamples };
const accessibility = { ...inputDocumentationAccessibility, ...showcaseDocumentationAccessibility };

describe("every component has copyable documentation and individual accessibility rules", () => {
  it("covers the entire public manifest with the existing Button guide and 52 additional guides", () => {
    const names = wlManifest.map((entry) => entry.name).filter((name) => name !== "WlButton").sort();
    expect(Object.keys(examples).sort()).toEqual(names);
    expect(Object.keys(accessibility).sort()).toEqual(names);
    const files = ["inputs", "showcase"].flatMap((group) => readdirSync(join(directory, group)).filter((file) => file.endsWith(".vue")).map((file) => group + "/" + file)).sort();
    expect(Object.values(examples).map((example) => example.sourceName).sort()).toEqual(files);
  });
  for (const [name, example] of Object.entries(examples)) it(name + ": the live SFC also compiles as a public consumer", () => {
    expect(example.title.trim().length).toBeGreaterThan(8);
    expect(example.description.trim().length).toBeGreaterThan(30);
    expect(accessibility[name]!.length).toBeGreaterThanOrEqual(3);
    const raw = readFileSync(join(directory, example.sourceName), "utf8");
    const source = consumerSource(raw);
    const parsed = parse(source, { filename: example.sourceName });
    expect(parsed.errors).toEqual([]);
    expect(source).toContain('from "gavia-ui"');
    expect(source).not.toMatch(/packages\/ui-kit|v-bind="preview"|defineProps<\{ preview|usePlaygroundI18n|\bt\(['"]examples\./);
    const script = compileScript(parsed.descriptor, { id: name });
    const template = compileTemplate({ source: parsed.descriptor.template!.content, filename: example.sourceName, id: name, compilerOptions: { bindingMetadata: script.bindings } });
    expect(template.errors).toEqual([]);
    if (name === "WlToast" || name === "WlConfirmDialog") {
      expect(source).toContain(name === "WlToast" ? "useWlToast" : "useWlConfirm");
    } else expect(parsed.descriptor.template!.content).toContain("<" + name);
  });
});
