// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { wlManifest } from "../src/manifest";
import { documentationControls, stateCases } from "../../../apps/playground/src/design-system/states";
import { acceptsDocumentationValue, documentationControlSamples, documentationDefaults, documentationPresets } from "../../../apps/playground/src/design-system/documentation-controls";
import { consumerSource } from "../../../scripts/example-source.mjs";
import { playgroundI18n } from "../../../apps/playground/src/i18n";

let previousLocale = playgroundI18n.global.locale.value;
beforeEach(() => {
  previousLocale = playgroundI18n.global.locale.value;
  playgroundI18n.global.locale.value = "en";
});
afterEach(() => {
  playgroundI18n.global.locale.value = previousLocale;
});
const examples = resolve("..", "..", "apps", "playground", "src", "design-system", "examples");
const recipes = resolve("..", "..", "apps", "playground", "src", "design-system", "recipes");

function assertCompiles(source: string, filename: string): void {
  const parsed = parse(source, { filename });
  expect(parsed.errors, filename).toEqual([]);
  const script = compileScript(parsed.descriptor, { id: filename });
  const template = compileTemplate({ source: parsed.descriptor.template!.content, id: filename, filename, compilerOptions: { bindingMetadata: script.bindings } });
  expect(template.errors, filename).toEqual([]);
  expect(source, filename).not.toMatch(/packages\/ui-kit|v-bind="preview"|defineProps<\{ preview|usePlaygroundI18n|\bt\(['"]examples\./);
}

describe("copyable examples are public package consumers", () => {
  it("has a source for every public component, without extra or missing entries", () => {
    expect(readdirSync(examples).map((name) => name.replace(/\.vue$/, "")).sort()).toEqual(wlManifest.map((entry) => entry.name).sort());
  });
  for (const entry of wlManifest) it(`${entry.name}: every documented preview state produces compilable consumer code`, () => {
    const raw = readFileSync(join(examples, `${entry.name}.vue`), "utf8");
    for (const state of stateCases(entry)) assertCompiles(consumerSource(raw, state.props), `${entry.name}-${state.id}.vue`);
    for (const control of documentationControls(entry, raw)) {
      const values = documentationControlSamples(control);
      for (const value of values) {
        expect(acceptsDocumentationValue(control, value), entry.name + ":" + control.name).toBe(true);
        assertCompiles(consumerSource(raw, { [control.name]: value }), entry.name + "-docs-" + control.name + "-" + value + ".vue");
      }
    }
    for (const preset of documentationPresets(entry)) {
      assertCompiles(consumerSource(raw, preset.props), entry.name + "-preset-" + preset.id + ".vue");
    }
  });
  it("keeps service containers and incompatible primary modes out of documentation controls", () => {
    for (const name of ["WlToast", "WlConfirmDialog"]) {
      expect(documentationControls(wlManifest.find((entry) => entry.name === name)!)).toEqual([]);
    }
    const menu = wlManifest.find((entry) => entry.name === "WlMenu")!;
    const autocomplete = wlManifest.find((entry) => entry.name === "WlAutocomplete")!;
    expect(documentationControls(menu).map((prop) => prop.name)).not.toContain("popup");
    expect(documentationControls(autocomplete).map((prop) => prop.name)).not.toContain("multiple");
    const files = wlManifest.find((entry) => entry.name === "WlFilePicker")!;
    expect(documentationControls(files).find((prop) => prop.name === "multiple")?.type).toBe("boolean");
  });
  it("uses numeric PageHeader heading levels in documentation and copied consumer props", () => {
    const entry = wlManifest.find((item) => item.name === "WlPageHeader")!;
    const heading = documentationControls(entry).find((prop) => prop.name === "headingLevel")!;
    expect(heading.values).toEqual([1, 2]);
    expect(heading.default).toBe(2);
    // The Docs default follows its secondary heading; the public component default is unchanged.
    expect(entry.props.find((prop) => prop.name === "headingLevel")?.default).toBe(1);
    const raw = readFileSync(join(examples, "WlPageHeader.vue"), "utf8");
    for (const value of heading.values!) {
      expect(typeof value).toBe("number");
      const source = consumerSource(raw, { headingLevel: value });
      expect(source).toContain('"headingLevel":' + value);
      expect(source).not.toContain('"headingLevel":"' + value + '"');
      assertCompiles(source, "page-header-numeric-" + value + ".vue");
    }
  });
  it("reads actual canonical scalar defaults rather than replacing them with manifest defaults", () => {
    const expected: Record<string, Record<string, unknown>> = {
      WlInput: { placeholder: "Title", type: "text" },
      WlNumberInput: { min: 1, max: 10, step: 1 },
      WlFilePicker: { accept: ".pdf,.txt", multiple: true },
      WlFileUpload: { maxFiles: 3, maxSize: 1048576 },
      WlIcon: { name: "folder", size: 24 },
      WlProgress: { value: 65, showValue: true },
      WlStatCard: { value: "24", progress: 75 },
      WlPageHeader: { headingLevel: 2 },
      WlSidebar: { brand: "Team", brandMark: "T", pinned: true },
      WlSteps: { current: 1 }
    };
    for (const [name, defaults] of Object.entries(expected)) {
      const entry = wlManifest.find((item) => item.name === name)!;
      const raw = readFileSync(join(examples, name + ".vue"), "utf8");
      expect(documentationDefaults(entry, raw), name).toMatchObject(defaults);
    }
  });
  it("only exposes forwarded controls and leaves models, complex data and mapping functions in the SFC", () => {
    const select = wlManifest.find((entry) => entry.name === "WlSelect")!;
    const raw = readFileSync(join(examples, "WlSelect.vue"), "utf8");
    expect(documentationControls(select, raw).map((control) => control.name)).toContain("placeholder");
    expect(documentationControls(select, raw.replace('v-bind="preview"', ""))).toEqual([]);
    for (const name of ["options", "optionLabel", "optionValue", "pt"]) {
      expect(documentationControls(select, raw).map((control) => control.name)).not.toContain(name);
    }
    for (const entry of wlManifest) {
      expect(documentationControls(entry).some((control) => ["array", "object", "slot-content"].includes(control.type)), entry.name).toBe(false);
      if (entry.model) expect(documentationControls(entry).map((control) => control.name), entry.name).not.toContain(entry.model.name);
    }
    for (const [name, models] of [["WlSidebar", ["pinned", "mobileOpen"]], ["WlChip", ["active"]], ["WlPagination", ["page"]]] as const) {
      const entry = wlManifest.find((item) => item.name === name)!;
      const raw = readFileSync(join(examples, name + ".vue"), "utf8");
      for (const model of models) expect(documentationControls(entry, raw).map((control) => control.name), name).not.toContain(model);
    }
    const forwarded = raw.replace('v-bind="preview"', 'v-bind="forwardedPreview"');
    expect(documentationControls(select, forwarded).map((control) => control.name)).toContain("placeholder");
    const radio = wlManifest.find((entry) => entry.name === "WlRadio")!;
    expect(documentationControls(radio).map((control) => control.name)).not.toContain("value");
    expect(documentationDefaults(radio, readFileSync(join(examples, "WlRadio.vue"), "utf8"))).not.toHaveProperty("value");
  });
  it("keeps number, text and icon overrides typed, including zero and empty string", () => {
    const numberEntry = wlManifest.find((entry) => entry.name === "WlFileUpload")!;
    const maxSize = documentationControls(numberEntry).find((control) => control.name === "maxSize")!;
    expect(acceptsDocumentationValue(maxSize, 1048576)).toBe(true);
    expect(acceptsDocumentationValue(maxSize, 0)).toBe(true);
    for (const invalid of ["1048576", undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(acceptsDocumentationValue(maxSize, invalid)).toBe(false);
    }
    const raw = readFileSync(join(examples, "WlFileUpload.vue"), "utf8");
    expect(consumerSource(raw, { maxSize: 1048576 })).toContain('"maxSize":1048576');
    expect(consumerSource(raw, { maxSize: 1048576 })).not.toContain('"maxSize":"1048576"');
    const progress = wlManifest.find((entry) => entry.name === "WlProgress")!;
    const percentage = documentationControls(progress).find((control) => control.name === "value")!;
    expect(acceptsDocumentationValue(percentage, 0)).toBe(true);
    expect(acceptsDocumentationValue(percentage, 100)).toBe(true);
    expect(acceptsDocumentationValue(percentage, 101)).toBe(false);
    const input = wlManifest.find((entry) => entry.name === "WlInput")!;
    const placeholder = documentationControls(input).find((control) => control.name === "placeholder")!;
    expect(acceptsDocumentationValue(placeholder, "")).toBe(true);
    expect(acceptsDocumentationValue(placeholder, 7)).toBe(false);
    const metric = wlManifest.find((entry) => entry.name === "WlStatCard")!;
    const text = documentationControls(metric).find((control) => control.name === "value")!;
    expect(acceptsDocumentationValue(text, "24")).toBe(true);
    expect(acceptsDocumentationValue(text, 24)).toBe(false);
    expect(consumerSource(readFileSync(join(examples, "WlStatCard.vue"), "utf8"), { value: "24" })).toContain('"value":"24"');
    const icon = wlManifest.find((entry) => entry.name === "WlIcon")!;
    const name = documentationControls(icon).find((control) => control.name === "name")!;
    expect(acceptsDocumentationValue(name, "folder")).toBe(true);
    expect(acceptsDocumentationValue(name, "")).toBe(true);
    expect(acceptsDocumentationValue(name, "missing-icon-name")).toBe(false);
  });
  it("puts primary finite modes first and boolean states last in documentation controls", () => {
    const input = wlManifest.find((entry) => entry.name === "WlInput")!;
    expect(documentationControls(input).slice(0, 2).map((control) => control.name)).toEqual(["size", "density"]);
    const date = wlManifest.find((entry) => entry.name === "WlDatePicker")!;
    const controls = documentationControls(date);
    expect(controls[0]?.name).toBe("selectionMode");
    expect(controls[0]?.values).toEqual(["single", "range"]);
    expect(controls.find((control) => control.name === "startLabel")?.editor).toBe("text");
    expect(controls.find((control) => control.name === "endLabel")?.editor).toBe("text");
    for (const entry of wlManifest) {
      const editors = documentationControls(entry).map((control) => control.editor);
      const firstBoolean = editors.indexOf("checkbox");
      if (firstBoolean >= 0) expect(editors.slice(firstBoolean).every((editor) => editor === "checkbox"), entry.name).toBe(true);
    }
  });
  it("uses native date/time editors with optional clearing and valid scalar values", () => {
    const date = wlManifest.find((entry) => entry.name === "WlDatePicker")!;
    const minDate = documentationControls(date).find((control) => control.name === "minDate")!;
    expect(minDate.inputType).toBe("date");
    for (const valid of ["", "2026-10-01", "2028-02-29"]) expect(acceptsDocumentationValue(minDate, valid)).toBe(true);
    for (const invalid of ["not-a-date", "2026-02-29", "2026-13-01", "0000-01-01"]) expect(acceptsDocumentationValue(minDate, invalid)).toBe(false);
    const time = wlManifest.find((entry) => entry.name === "WlTimePicker")!;
    const minTime = documentationControls(time).find((control) => control.name === "minTime")!;
    expect(minTime.inputType).toBe("time");
    for (const valid of ["", "00:00", "23:59"]) expect(acceptsDocumentationValue(minTime, valid)).toBe(true);
    for (const invalid of ["24:00", "12:60", "9:30"]) expect(acceptsDocumentationValue(minTime, invalid)).toBe(false);
  });
  it("never evaluates dynamic expressions when discovering defaults", () => {
    const input = wlManifest.find((entry) => entry.name === "WlInput")!;
    const raw = '<template><WlInput :placeholder="untrusted()" v-bind="preview" /></template>';
    expect(documentationDefaults(input, raw)).not.toHaveProperty("placeholder");
    expect(documentationDefaults(input, '<template><WlInput placeholder="A &amp; B" v-bind="preview" /></template>').placeholder).toBe("A & B");
  });
  it("offers literal collection presets with compatible keys instead of arbitrary JSON controls", () => {
    const select = wlManifest.find((entry) => entry.name === "WlSelect")!;
    const presets = documentationPresets(select);
    expect(presets[0]!.props.options).toEqual([
      { label: "Team", value: "team" }, { label: "Personal", value: "personal" },
      { label: "Archive", value: "archive", disabled: true }
    ]);
    expect(presets[1]!.props.options).toEqual([]);
    const table = wlManifest.find((entry) => entry.name === "WlTable")!;
    expect(documentationPresets(table)[0]!.props.value).toEqual([]);
    const menu = wlManifest.find((entry) => entry.name === "WlMenu")!;
    expect(documentationPresets(menu)).toEqual([]);
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
