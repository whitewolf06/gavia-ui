// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { consumerSource } from "../../../scripts/example-source.mjs";

const setupExample = [
  '<script setup lang="ts">',
  'import { computed } from "vue";',
  'import { WlDatePicker } from "../../../packages/ui-kit/src";',
  'const props = defineProps<{ preview?: Record<string, unknown> }>();',
  'const mode = computed(() => props.preview?.selectionMode === "range" ? "range" : "single");',
  '</script>',
  '<template><WlDatePicker :selection-mode="mode" v-bind="preview" /></template>'
].join("\n");

function compile(source: string): void {
  const parsed = parse(source, { filename: "consumer.vue" });
  expect(parsed.errors).toEqual([]);
  const script = compileScript(parsed.descriptor, { id: "consumer" });
  const template = compileTemplate({ source: parsed.descriptor.template!.content, id: "consumer", filename: "consumer.vue", compilerOptions: { bindingMetadata: script.bindings } });
  expect(template.errors).toEqual([]);
}

describe("setup-aware consumer source", () => {
  it("keeps setup and template options consistent while removing showcase-only props", () => {
    const options = { selectionMode: "range", showIcon: true, size: "lg" };
    const source = consumerSource(setupExample, options);
    expect(source).toContain('const props = { preview: ' + JSON.stringify(options) + ' as Record<string, unknown> };');
    expect(source).toContain("v-bind=" + String.fromCharCode(39) + JSON.stringify(options) + String.fromCharCode(39));
    expect(source).toContain('from "gavia-ui"');
    expect(source).not.toContain("defineProps");
    expect(source).not.toContain('v-bind="preview"');
    compile(source);
  });
  it("preserves strings with SFC closing tags, quotes and line separators safely", () => {
    const options = { placeholder: "</script><div>\"A\" & B's</div>\u2028\u2029", maxDate: null, step: 2, disabled: false };
    const source = consumerSource(setupExample, options);
    const literal = source.match(/const props = \{ preview: (.+) as Record<string, unknown> \};/)![1]!;
    expect(JSON.parse(literal)).toEqual(options);
    expect(literal).not.toContain("<");
    expect(literal).not.toContain("\u2028");
    expect(literal).not.toContain("\u2029");
    compile(source);
  });
  it("keeps the existing stateless example conversion", () => {
    const legacy = setupExample.replace('const props = defineProps', 'defineProps').replace('const mode = computed(() => props.preview?.selectionMode === "range" ? "range" : "single");', '').replace(':selection-mode="mode" ', '');
    const source = consumerSource(legacy, { invalid: true });
    expect(source).not.toContain("defineProps");
    expect(source).not.toContain('v-bind="preview"');
    expect(source).toContain('"invalid":true');
    compile(source);
  });
});
