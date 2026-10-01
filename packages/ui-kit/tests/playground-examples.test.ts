// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { wlManifest } from "../src/manifest";
import { stateCases } from "../../../apps/playground/src/design-system/states";
import { consumerSource } from "../../../scripts/example-source.mjs";
const examples = resolve("..", "..", "apps", "playground", "src", "design-system", "examples");
const recipes = resolve("..", "..", "apps", "playground", "src", "design-system", "recipes");

function assertCompiles(source: string, filename: string): void {
  const parsed = parse(source, { filename });
  expect(parsed.errors, filename).toEqual([]);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({ source: parsed.descriptor.template!.content, id: filename, filename, compilerOptions: { bindingMetadata: script.bindings } });
  expect(template.errors, filename).toEqual([]);
  expect(source, filename).not.toMatch(/packages\/ui-kit|v-bind="preview"|defineProps<\{ preview/);
}

describe("copyable examples are public package consumers", () => {
  it("has a source for every public component, without extra or missing entries", () => {
    expect(readdirSync(examples).map((name) => name.replace(/\.vue$/, "")).sort()).toEqual(wlManifest.map((entry) => entry.name).sort());
  });
  for (const entry of wlManifest) it(`${entry.name}: every documented preview state produces compilable consumer code`, () => {
    const raw = readFileSync(join(examples, `${entry.name}.vue`), "utf8");
    for (const state of stateCases(entry)) assertCompiles(consumerSource(raw, state.props), `${entry.name}-${state.id}.vue`);
  });
  it("all six complete scenarios compile as standalone Vue examples", () => {
    const names = readdirSync(recipes);
    expect(names).toHaveLength(6);
    for (const filename of names) assertCompiles(consumerSource(readFileSync(join(recipes, filename), "utf8")), filename);
  });
  it("preserves quoted content and typed overrides without duplicate attributes", () => {
    const raw = readFileSync(join(examples, "WlInput.vue"), "utf8");
    assertCompiles(consumerSource(raw, { placeholder: `Название "A" & B's <C>`, disabled: true }), "quoted-input.vue");
  });
});
