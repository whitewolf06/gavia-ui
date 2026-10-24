import { describe, expect, it } from "vitest";
import * as publicComponents from "../../src/components";
import { WL_ICONS } from "../../src/icons.generated";
import { wlManifest } from "../../src/manifest";
import { parseComponentExports, parseComponentMarkers, parseComponentModels } from "../component-export-parser";
import oldIcons from "../fixtures/icons-0.3.json";
import baseline from "../fixtures/public-contract-0.3.json";

const componentSources = import.meta.glob<string>("../../src/components/*.vue", {
  eager: true,
  query: "?raw",
  import: "default"
});

const componentValues = import.meta.glob<unknown>("../../src/components/*.vue", {
  eager: true,
  import: "default"
});
const facadeSources = import.meta.glob<string>("../../src/components/*-contracts.ts", {
  eager: true,
  query: "?raw",
  import: "default"
});

// Only these explicitly reviewed generic descriptions may refine the frozen 0.3 model metadata.
const genericModelRefinements: Readonly<Record<string, { previous: string; current: string }>> = {
  WlSelect: { previous: "unknown", current: "TValue | null" },
  WlMultiSelect: { previous: "unknown[]", current: "TValue[]" },
  WlAutocomplete: { previous: "unknown", current: "TOption | string | null / TOption[] | null" },
  WlRadio: { previous: "unknown", current: "TValue | undefined" }
};

// Fixed 1.0 migrations only. Check both sides before projecting the current
// metadata back to 0.3; every other field remains subject to the frozen contract.
const tones = ["neutral", "accent", "info", "success", "warning", "danger"];
const reviewedPropMigrations: ReadonlyArray<{
  component: string;
  previous: Record<string, unknown> & { name: string };
  current: Record<string, unknown> & { name: string };
}> = [
  {
    component: "WlButton",
    previous: { name: "variant", type: "enum", default: "secondary", values: [
      "primary", "secondary", "ghost", "soft", "danger", "danger-quiet", "soft-danger", "link"
    ] },
    current: { name: "variant", type: "enum", default: "secondary", values: [
      "primary", "secondary", "ghost", "soft", "link"
    ] }
  },
  ...[
    ["WlAlert", "info", ["info", "ok", "warn", "err"], "info"],
    ["WlBadge", "accent", ["gray", "accent", "success", "warn", "danger"], "accent"],
    ["WlPill", "neutral", ["neutral", "info", "ok", "warn", "err"], "neutral"],
    ["WlProgress", "default", ["default", "ok"], "accent"]
  ].map(([component, previousDefault, values, currentDefault]) => ({
    component: component as string,
    previous: { name: "variant", type: "enum", default: previousDefault, values },
    current: { name: "tone", type: "enum", default: currentDefault, values: tones }
  })),
  {
    component: "WlTag",
    previous: { name: "variant", type: "enum", default: "gray", values: ["gray", "blue", "green", "amber", "red"] },
    current: { name: "color", type: "enum", default: "gray", values: ["gray", "blue", "green", "amber", "red"] }
  },
  ...(["WlDialog", "WlDrawer", "WlPopover"] as const).map((component) => ({
    component,
    previous: { name: "dismissable", type: "boolean", default: component !== "WlDialog" },
    current: { name: "dismissible", type: "boolean", default: component !== "WlDialog" }
  })),
  ...[
    ["WlPasswordInput", "placeholder", "Пароль"],
    ["WlNumberInput", "decrementLabel", "Уменьшить"],
    ["WlNumberInput", "incrementLabel", "Увеличить"],
    ["WlAutocomplete", "dropdownLabel", "Показать варианты"],
    ["WlDatePicker", "placeholder", "дд.мм.гггг"],
    ["WlColorPicker", "paletteLabel", "Палитра"],
    ["WlColorPicker", "inputLabel", "HEX-код цвета"],
    ["WlTable", "emptyMessage", "Нет данных"],
    ["WlTag", "removeLabel", "Удалить"],
    ["WlFilterBar", "ariaLabel", "Фильтры"],
    ["WlFilterBar", "toggleLabel", "Фильтры"],
    ["WlFilterBar", "panelTitle", "Фильтры"],
    ["WlFilterBar", "clearLabel", "Сбросить"],
    ["WlFilterBar", "applyLabel", "Применить"],
    ["WlFilterBar", "closeLabel", "Закрыть фильтры"],
    ["WlSidebar", "ariaLabel", "Основная навигация"],
    ["WlSidebar", "pinLabel", "Закрепить панель"],
    ["WlSidebar", "unpinLabel", "Открепить панель"],
    ["WlCommandPalette", "placeholder", "Поиск или переход…"],
    ["WlCommandPalette", "emptyText", "Ничего не найдено"],
    ["WlCommandPalette", "loadingText", "Поиск…"],
    ["WlCommandPalette", "ariaLabel", "Командная палитра"],
    ["WlAlert", "closeLabel", "Закрыть"],
    ["WlSpinner", "label", "Загрузка"]
  ].map(([component, name, previousDefault]) => ({
    component: component!,
    previous: { name: name!, type: "string", default: previousDefault },
    current: { name: name!, type: "string" }
  }))
];

const componentsIndex = import.meta.glob<string>("../../src/components/index.ts", {
  eager: true,
  query: "?raw",
  import: "default"
})["../../src/components/index.ts"]!;

function componentName(file: string): string {
  return file.match(/\/([^/]+)\.vue$/)?.[1] ?? file;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("component public contract", () => {
  it("preserves the original WlIcon drawings byte for byte", () => {
    for (const [name, body] of Object.entries(oldIcons)) {
      expect(WL_ICONS[name as keyof typeof WL_ICONS], name).toBe(body);
    }
  });

  it("preserves legacy 0.3 metadata with exact reviewed generic and 1.0 migrations", () => {
    const current = JSON.parse(JSON.stringify(wlManifest, (key, value) =>
      key === "description" || key === "typescriptType" ? undefined : value
    )) as typeof baseline;
    expect(current.map((entry) => entry.name)).toEqual(expect.arrayContaining(baseline.map((entry) => entry.name)));
    for (const original of baseline) {
      const entry = current.find((candidate) => candidate.name === original.name)!;
      for (const previous of original.props.filter((prop) => prop.type === "icon")) {
        const actual = entry.props.find((prop) => prop.name === previous.name);
        const values = actual && "values" in actual ? actual.values : undefined;
        expect(values, `${entry.name}.${previous.name}: old icons must remain`).toEqual(
          expect.arrayContaining((previous as { values?: string[] }).values ?? [])
        );
      }
    }
    for (const [name, refinement] of Object.entries(genericModelRefinements)) {
      const original = baseline.find((entry) => entry.name === name)!;
      const entry = current.find((entry) => entry.name === name)!;
      expect(original.model?.type, `${name}: frozen model baseline changed`).toBe(refinement.previous);
      expect(entry.model, `${name}: reviewed generic model refinement changed`).toEqual({
        name: original.model!.name, type: refinement.current
      });
      expect(componentSources[`../../src/components/${name}.vue`], `${name}: generic implementation missing`)
        .toMatch(/<script[^>]+\bgeneric=/);
    }
    for (const migration of reviewedPropMigrations) {
      const original = baseline.find((entry) => entry.name === migration.component)!;
      const entry = current.find((candidate) => candidate.name === migration.component)!;
      const label = `${migration.component}.${migration.previous.name}`;
      expect(original.props.find((prop) => prop.name === migration.previous.name), `${label}: frozen baseline changed`)
        .toEqual(migration.previous);
      expect(entry.props.find((prop) => prop.name === migration.current.name), `${label}: reviewed 1.0 contract changed`)
        .toEqual(migration.current);
    }
    for (const migration of reviewedPropMigrations.filter((change) => change.previous.name !== change.current.name)) {
      const entry = current.find((candidate) => candidate.name === migration.component)!;
      expect(entry.props.find((prop) => prop.name === migration.previous.name), `${migration.component}: legacy alias remains`)
        .toBeUndefined();
    }
    for (const original of baseline) {
      const entry = current.find((candidate) => candidate.name === original.name)!;
      const props = original.props.map((previous) => {
        const migration = reviewedPropMigrations.find((candidate) =>
          candidate.component === original.name && candidate.previous.name === previous.name
        );
        if (migration) return migration.previous;
        const actual = entry.props.find((prop) => prop.name === previous.name);
        expect(actual, `${entry.name}.${previous.name}: original prop removed`).toBeDefined();
        const comparable = { ...actual } as Record<string, unknown>;
        if (previous.type === "icon") {
          const previousNames = (previous as { values?: string[] }).values ?? [];
          comparable.values = previousNames;
        }
        return comparable;
      });
      const slots = original.slots.map((previous) =>
        entry.slots.find((slot) => slot.name === previous.name)
      );
      const emits = original.emits.map((previous) =>
        entry.emits.find((event) => event.name === previous.name)
      );
      expect(slots, `${entry.name}: original slot removed`).not.toContain(undefined);
      expect(emits, `${entry.name}: original event removed`).not.toContain(undefined);
      const { model: currentModel, ...metadata } = entry;
      let model = original.model ? currentModel : undefined;
      const refinement = genericModelRefinements[original.name];
      if (refinement) {
        model = { ...model!, type: refinement.previous };
      }
      expect({ ...metadata, props, slots, emits, ...(model ? { model } : {}) }).toEqual(original);
    }
  });

  it("documents the optional motion API for every animated surface", () => {
    for (const name of [
      "WlDialog", "WlConfirmDialog", "WlDrawer", "WlPopover", "WlMenu",
      "WlSelect", "WlMultiSelect", "WlAutocomplete", "WlDatePicker",
      "WlCommandPalette", "WlToast"
    ]) {
      const entry = wlManifest.find((component) => component.name === name);
      expect(entry?.props.find((prop) => prop.name === "motion"), name).toMatchObject({
        name: "motion", type: "boolean"
      });
    }
    expect(wlManifest.find((entry) => entry.name === "WlDialog")?.emits.map((event) => event.name))
      .toContain("afterLeave");
  });

  it("gives every component a stable data-wl root marker", () => {
    for (const [file, source] of Object.entries(componentSources)) {
      expect(source, `${file}: missing data-wl`).toMatch(/\bdata-wl=/);
    }
  });

  it("keeps source files, public exports and manifest entries in exact sync", () => {
    const sourceNames = Object.keys(componentSources).map(componentName).sort();
    const facades = Object.fromEntries(Object.entries(facadeSources).map(([file, source]) => [
      `./${file.match(/\/([^/]+)\.ts$/)![1]}`, source
    ]));
    const exports = parseComponentExports(componentsIndex, facades);
    const exportedNames = exports.map((entry) => entry.name).sort();
    const values: Record<string, unknown> = publicComponents;
    for (const entry of exports) {
      expect(entry.file, `${entry.name}: export refers to a different component`).toBe(`./${entry.name}.vue`);
      const raw = componentValues[`../../src/components/${entry.name}.vue`];
      expect(raw, `${entry.name}: resolved SFC source missing`).toBeDefined();
      expect(values[entry.name], `${entry.name}: public facade changed runtime identity`).toBe(raw);
    }
    const manifestNames = wlManifest.map((entry) => entry.name).sort();

    expect(exportedNames).toEqual(sourceNames);
    expect(manifestNames).toEqual(sourceNames);
  });

  it("rejects facade aliases to another component and rendering wrappers", () => {
    const barrel = 'export { WlButton } from "./contracts";';
    const wrongImport = 'import RawButton from "./WlInput.vue"; export const WlButton = RawButton as Contract;';
    expect(() => parseComponentExports(barrel, { "./contracts": wrongImport }))
      .toThrow("export refers to a different component");
    const wrapper = 'import RawButton from "./WlButton.vue"; export const WlButton = wrap(RawButton) as Contract;';
    expect(() => parseComponentExports(barrel, { "./contracts": wrapper })).toThrow("preserve its imported SFC identity");
    expect(() => parseComponentExports(barrel, { "./contracts": "export const WlButton = RawButton as Contract;" }))
      .toThrow("default SFC import");
    expect(() => parseComponentExports(`${barrel}\n${barrel}`, { "./contracts": 'import RawButton from "./WlButton.vue"; export const WlButton = RawButton as Contract;' }))
      .toThrow("duplicate component export");
  });

  it("keeps data-wl values unique and namespaced", () => {
    const markers = new Map<string, string>();

    for (const [file, source] of Object.entries(componentSources)) {
      const values = parseComponentMarkers(source);
      const distinctValues = [...new Set(values)];
      expect(distinctValues.length, `${file}: expected one stable data-wl value`).toBe(1);
      expect(distinctValues[0], `${file}: invalid data-wl value`).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(
        markers.has(distinctValues[0]!),
        `${file}: duplicate data-wl=${distinctValues[0]}`
      ).toBe(false);
      markers.set(distinctValues[0]!, file);
    }
  });

  it("recognizes bound marker fallbacks and exact generated model events", () => {
    const source = `<script setup lang="ts">
      defineModel<string>();
      defineModel<boolean>("open");
    </script><template><a :data-wl="attrs['data-wl'] ?? 'link'"></a></template>`;
    expect(parseComponentMarkers(source)).toEqual(["link"]);
    expect([...parseComponentModels(source)]).toEqual(["modelValue", "open"]);
    expect(parseComponentModels(source).has("selection")).toBe(false);
    expect(() => parseComponentMarkers('<template><a :data-wl="attrs.marker"></a></template>'))
      .toThrow("stable literal fallback");
    expect(parseComponentMarkers('<template><div data-wl="menu" data-wl-part="panel"></div></template>'))
      .toEqual(["menu"]);
  });

  it("keeps documented props connected to their component source", () => {
    for (const entry of wlManifest) {
      const file = `../../src/components/${entry.name}.vue`;
      const source = componentSources[file];
      expect(source, `${entry.name}: source not found`).toBeDefined();

      for (const prop of entry.props) {
        if (prop.name === entry.model?.name) continue;
        const propPattern = new RegExp(`\\b${escapeRegExp(prop.name)}\\??\\s*:`);
        const namedModelPattern = new RegExp(
          `defineModel<[^>]+>\\(["']${escapeRegExp(prop.name)}["']`
        );
        expect(
          propPattern.test(source!) || namedModelPattern.test(source!),
          `${entry.name}.${prop.name}: documented prop/model is not declared`
        ).toBe(true);
      }
    }
  });

  it("keeps documented slots and events connected to templates and emit declarations", () => {
    for (const entry of wlManifest) {
      const source = componentSources[`../../src/components/${entry.name}.vue`]!;
      const models = parseComponentModels(source);

      for (const slot of entry.slots) {
        // Source-derived contracts retain TypeScript template-literal patterns;
        // released metadata uses the equivalent human-readable <key> spelling.
        const dynamicPrefix = slot.name.match(/^(.+?)(?:<key>|\$\{[^}]+\})$/)?.[1];
        const slotPattern = slot.name === "default"
          ? /<slot(?:\s|>)/
          : dynamicPrefix
            ? new RegExp(`<slot[^>]+:name=["'][^"']*${escapeRegExp(dynamicPrefix)}`)
            : new RegExp(`<slot[^>]+name=["']${escapeRegExp(slot.name)}["']`);
        expect(source, `${entry.name}.${slot.name}: documented slot is not rendered`).toMatch(
          slotPattern
        );
      }

      for (const event of entry.emits) {
        const eventPattern = new RegExp(`["']${escapeRegExp(event.name)}["']`);
        const modelName = event.name.startsWith("update:") ? event.name.slice("update:".length) : undefined;
        expect(eventPattern.test(source) || (modelName !== undefined && models.has(modelName)),
          `${entry.name}.${event.name}: documented event is not declared`).toBe(true);
      }
    }
  });

  it("keeps v-model metadata aligned with component implementation", () => {
    for (const entry of wlManifest) {
      if (!entry.model) continue;
      const source = componentSources[`../../src/components/${entry.name}.vue`]!;
      expect(
        parseComponentModels(source).has(entry.model.name) || source.includes(`update:${entry.model.name}`),
        `${entry.name}: model ${entry.model.name} is not implemented`
      ).toBe(true);
    }
  });

  it("publishes variant, size and density markers whenever those props are supported", () => {
    for (const axis of ["variant", "size", "density"]) {
      const declaration = new RegExp(`\\b${axis}\\?\\s*:`);
      for (const [file, source] of Object.entries(componentSources).filter(([, source]) => declaration.test(source))) {
        expect(source, `${file}: missing data-${axis}`).toMatch(new RegExp(`\\bdata-${axis}=`));
      }
    }
  });
});
