import { wlManifest } from "gavia-ui";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL as NodeURL } from "node:url";
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { inputDocumentationAccessibility, inputDocumentationExamples } from "../src/documentation/components/inputs";
import { showcaseDocumentationAccessibility, showcaseDocumentationExamples } from "../src/documentation/components/showcase";
const directory = fileURLToPath(new NodeURL("../src/documentation/components/", import.meta.url));
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
    expect(source).not.toMatch(
      /packages\/ui-kit|v-bind="preview"|defineProps<\{ preview|usePlaygroundI18n|\bt\(['"](?:examples|documentation)\./
    );
    const script = compileScript(parsed.descriptor, { id: name });
    const template = compileTemplate({
      source: parsed.descriptor.template!.content, filename: example.sourceName,
      id: name, compilerOptions: { bindingMetadata: script.bindings }
    });
    expect(template.errors).toEqual([]);
    const service = ({ WlToast: "useWlToast", WlConfirmDialog: "useWlConfirm" } as Record<string, string>)[name];
    expect(service ? source : parsed.descriptor.template!.content).toContain(service ?? "<" + name);
  });
});
