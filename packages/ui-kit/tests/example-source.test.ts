// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import russianExamples from "../../../apps/playground/src/i18n/messages/examples.ru.json";

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
  it.each(["WlCard", "WlDivider"])("removes the known %s typed preview without losing component bindings", (component) => {
    const raw = [
      '<script setup lang="ts">',
      `import { ${component} } from "../../../packages/ui-kit/src";`,
      `type PreviewProps = Partial<InstanceType<typeof ${component}>["$props"]>;`,
      'defineProps<{ preview?: PreviewProps }>();',
      '</script>',
      `<template><${component} v-bind="preview">Details</${component}></template>`
    ].join("\n");
    const changed = component === "WlCard"
      ? { hoverable: false, 'data-label': "A & B's <Details>" }
      : { 'data-label': "A & B's <Details>" };
    for (const options of [{}, changed]) {
      const source = consumerSource(raw, options);
      expect(source).toContain('from "gavia-ui"');
      expect(source).not.toContain("defineProps");
      expect(source).not.toContain("PreviewProps");
      expect(source).not.toContain('v-bind="preview"');
      expect(source).toContain("Details</" + component + ">");
      if (Object.keys(options).length) {
        expect(source).toContain("A &amp; B&#39;s &lt;Details>");
        if (component === "WlCard") expect(source).toContain('"hoverable":false');
      }
      compile(source);
    }
  });
  it("retains the component preview type in setup-aware consumers and escapes script literals", () => {
    const raw = setupExample.replace('WlDatePicker', 'WlCard')
      .replace('const props = defineProps<{ preview?: Record<string, unknown> }>();', [
        'type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;',
        'const props = defineProps<{ preview?: PreviewProps }>();'
      ].join("\n"))
      .replace('const mode = computed(() => props.preview?.selectionMode === "range" ? "range" : "single");',
        'const active = computed(() => props.preview?.hoverable === true);')
      .replace('WlDatePicker :selection-mode="mode"', 'WlCard :hoverable="active"');
    const options = { hoverable: true, title: "</script> A & B's\u2028\u2029" };
    const source = consumerSource(raw, options);
    expect(source).toContain('type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;');
    expect(source).toContain('const active = computed(() => props.preview?.hoverable === true);');
    expect(source).not.toContain('defineProps');
    const literal = source.match(/const props = \{ preview: (.+) as PreviewProps \};/)![1]!;
    expect(JSON.parse(literal)).toEqual(options);
    expect(literal).not.toContain('<');
    expect(literal).not.toContain('\u2028');
    expect(literal).not.toContain('\u2029');
    compile(source);
  });
  it("leaves mixed app props and unrelated PreviewProps declarations intact", () => {
    const mixed = setupExample.replace('WlDatePicker', 'WlCard')
      .replace('const props = defineProps<{ preview?: Record<string, unknown> }>();', [
        'type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;',
        'const props = defineProps<{ preview?: PreviewProps; title: string }>();'
      ].join("\n"));
    const source = consumerSource(mixed, {});
    expect(source).toContain('const props = defineProps<{ preview?: PreviewProps; title: string }>();');
    expect(source).toContain('type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;');
    const unrelated = mixed.replace('Partial<InstanceType<typeof WlCard>["$props"]>', '{ title: string }')
      .replace('preview?: PreviewProps; title: string', 'preview?: PreviewProps');
    expect(consumerSource(unrelated, {})).toContain('const props = defineProps<{ preview?: PreviewProps }>();');
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

describe("localised standalone consumer source", () => {
  it.each([
    { language: "English default", messages: undefined, label: "Add", counter: "Clicks:" },
    { language: "Russian", messages: russianExamples, label: "Добавить", counter: "Нажатий:" }
  ])("exports $language text without the private Playground hook", ({ messages, label, counter }) => {
    const raw = readFileSync(fileURLToPath(new URL("../../../apps/playground/src/design-system/examples/WlButton.vue", import.meta.url)), "utf8");
    const source = consumerSource(raw, {}, messages);
    expect(source).toContain(JSON.stringify(label));
    expect(source).toContain(JSON.stringify(counter));
    expect(source).toContain('from "gavia-ui"');
    expect(source).not.toMatch(/usePlaygroundI18n|from ["'](?:\.\.\/)+i18n|\bt\(["']examples\./);
    compile(source);
  });

  it("preserves translated script and attribute values with special characters", () => {
    const raw = [
      '<script setup lang="ts">',
      'import { usePlaygroundI18n } from "../../i18n";',
      'const { t } = usePlaygroundI18n();',
      'import { WlInput } from "../../../packages/ui-kit/src";',
      'const hint = t("examples.special");',
      '</script>',
      '<template><WlInput v-for="label in [t(\'examples.special\')]" :key="label" v-if="t(\'examples.special\') !== \'hidden\'" :placeholder="t(\'examples.special\')" :aria-label="hint + t(\'examples.special\')" /><p>{{ t("examples.special") }}</p></template>'
    ].join("\n");
    const message = "</script><div>\"A\" & B's @email | {count}</div>\u2028\u2029";
    const source = consumerSource(raw, {}, { "examples.special": message });
    const literal = source.match(/const hint = (.+);/)![1]!;
    expect(JSON.parse(literal)).toBe(message);
    expect(literal).not.toContain("<");
    expect(literal).not.toContain("\u2028");
    expect(literal).not.toContain("\u2029");
    expect(source).toContain(`placeholder="&lt;/script>&lt;div>&quot;A&quot; &amp; B's @email | {count}&lt;/div>`);
    const attributeLiteral = source.match(/v-for="label in \[(.+)\]"/)![1]!;
    expect(attributeLiteral).not.toMatch(/&(?:quot|amp|lt);|"|</);
    expect(runInNewContext(attributeLiteral, {}, { timeout: 100 })).toBe(message);
    expect(source).not.toMatch(/usePlaygroundI18n|\bt\(["']examples\./);
    compile(source);
  });
});
