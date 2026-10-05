import { describe, expect, it } from "vitest";
import { wlManifest } from "../src/manifest";
import baseline from "./fixtures/public-contract-0.3.json";
import oldIcons from "./fixtures/icons-0.3.json";
import { WL_ICONS } from "../src/icons.generated";

const componentSources = import.meta.glob<string>("../src/components/*.vue", {
  eager: true,
  query: "?raw",
  import: "default"
});

const componentsIndex = import.meta.glob<string>("../src/components/index.ts", {
  eager: true,
  query: "?raw",
  import: "default"
})["../src/components/index.ts"]!;

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

  it("preserves the 0.3 public contract of all 51 components", () => {
    const current = JSON.parse(JSON.stringify(wlManifest, (key, value) =>
      key === "description" ? undefined : value
    )) as typeof baseline;
    expect(current.map((entry) => entry.name)).toEqual(expect.arrayContaining(baseline.map((entry) => entry.name)));
    for (const original of baseline) {
      const entry = current.find((candidate) => candidate.name === original.name)!;
      const props = original.props.map((previous) => {
        const actual = entry.props.find((prop) => prop.name === previous.name);
        expect(actual, `${entry.name}.${previous.name}: original prop removed`).toBeDefined();
        const comparable = { ...actual } as Record<string, unknown>;
        if (previous.type === "icon") {
          const previousNames = (previous as { values?: string[] }).values ?? [];
          expect(comparable.values, `${entry.name}.${previous.name}: old icons must remain`).toEqual(
            expect.arrayContaining(previousNames)
          );
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
      expect({ ...entry, props, slots, emits }).toEqual(original);
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
    const exportedNames = [...componentsIndex.matchAll(/export \{ default as (Wl\w+) \}/g)]
      .map((match) => match[1]!)
      .sort();
    const manifestNames = wlManifest.map((entry) => entry.name).sort();

    expect(exportedNames).toEqual(sourceNames);
    expect(manifestNames).toEqual(sourceNames);
  });

  it("keeps data-wl values unique and namespaced", () => {
    const markers = new Map<string, string>();

    for (const [file, source] of Object.entries(componentSources)) {
      const values = [...source.matchAll(/\bdata-wl="([^"]+)"/g)].map((match) => match[1]!);
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

  it("keeps documented props connected to their component source", () => {
    for (const entry of wlManifest) {
      const file = `../src/components/${entry.name}.vue`;
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
      const source = componentSources[`../src/components/${entry.name}.vue`]!;

      for (const slot of entry.slots) {
        const dynamicPrefix = slot.name.match(/^(.+)<key>$/)?.[1];
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
        expect(source, `${entry.name}.${event.name}: documented event is not declared`).toMatch(
          eventPattern
        );
      }
    }
  });

  it("keeps v-model metadata aligned with component implementation", () => {
    for (const entry of wlManifest) {
      if (!entry.model) continue;
      const source = componentSources[`../src/components/${entry.name}.vue`]!;
      expect(
        source.includes("defineModel") || source.includes(`update:${entry.model.name}`),
        `${entry.name}: model ${entry.model.name} is not implemented`
      ).toBe(true);
    }
  });

  it("publishes variant, size and density markers whenever those props are supported", () => {
    for (const [file, source] of Object.entries(componentSources)) {
      if (/\bvariant\?\s*:/.test(source)) {
        expect(source, `${file}: missing data-variant`).toMatch(/\bdata-variant=/);
      }

      if (/\bsize\?\s*:/.test(source)) {
        expect(source, `${file}: missing data-size`).toMatch(/\bdata-size=/);
      }

      if (/\bdensity\?\s*:/.test(source)) {
        expect(source, `${file}: missing data-density`).toMatch(/\bdata-density=/);
      }
    }
  });
});
