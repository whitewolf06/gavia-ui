import { describe, expect, it } from "vitest";
import type { WlManifestCategory } from "../../src/manifest";
import * as components from "../../src/components";
import { wlManifest } from "../../src/manifest";

const CATEGORIES: readonly WlManifestCategory[] = [
  "actions",
  "inputs",
  "data",
  "containers",
  "composites",
  "navigation",
  "feedback",
  "misc"
];

const componentNames = Object.keys(components).filter((name) => name.startsWith("Wl"));

describe("wlManifest", () => {
  it("covers every component exported from src/components", () => {
    const manifestNames = new Set(wlManifest.map((entry) => entry.name));
    for (const name of componentNames) {
      expect(manifestNames.has(name), `missing manifest entry for ${name}`).toBe(true);
    }
  });

  it("has no entries for components that do not exist", () => {
    const exported = new Set(componentNames);
    for (const entry of wlManifest) {
      expect(exported.has(entry.name), `stale manifest entry ${entry.name}`).toBe(true);
    }
  });

  it("has one entry per component (no duplicates)", () => {
    const names = wlManifest.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every entry has name, valid category and array fields", () => {
    for (const entry of wlManifest) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.introducedIn, `${entry.name}: missing introducedIn`).toMatch(
        /^\d+\.\d+\.\d+(?:-rc\.\d+)?$/
      );
      expect(CATEGORIES, `${entry.name}: bad category`).toContain(entry.category);
      expect(Array.isArray(entry.props)).toBe(true);
      expect(Array.isArray(entry.slots)).toBe(true);
      expect(Array.isArray(entry.emits)).toBe(true);
      // All current components declare at least one prop.
      expect(entry.props.length, `${entry.name}: empty props`).toBeGreaterThan(0);
    }
  });

  it("enum and icon props declare non-empty values", () => {
    for (const entry of wlManifest) {
      for (const prop of entry.props.filter((prop) => prop.type === "enum" || prop.type === "icon")) {
        expect(
          prop.values && prop.values.length > 0,
          `${entry.name}.${prop.name}: missing values`
        ).toBe(true);
      }
    }
  });

  it("prop names are unique within a component", () => {
    for (const entry of wlManifest) {
      const names = entry.props.map((prop) => prop.name);
      expect(new Set(names).size, `${entry.name}: duplicate prop`).toBe(names.length);
    }
  });

  it("keeps slot and emit names unique within a component", () => {
    for (const entry of wlManifest) {
      const slots = entry.slots.map((slot) => slot.name);
      const emits = entry.emits.map((event) => event.name);
      expect(new Set(slots).size, `${entry.name}: duplicate slot`).toBe(slots.length);
      expect(new Set(emits).size, `${entry.name}: duplicate emit`).toBe(emits.length);
    }
  });

  it("keeps enum defaults inside their documented values", () => {
    for (const entry of wlManifest) {
      for (const prop of entry.props) {
        if (prop.type !== "enum" || prop.default === undefined) continue;
        expect(prop.values, `${entry.name}.${prop.name}: missing enum values`).toContain(
          prop.default
        );
      }
    }
  });

  it.each([
    ["WlAlert", "info"],
    ["WlBadge", "accent"],
    ["WlPill", "neutral"],
    ["WlProgress", "accent"]
  ] as const)("documents canonical tone without the removed status variant for %s", (name, fallback) => {
    const props = wlManifest.find((entry) => entry.name === name)!.props;
    expect(props.find((prop) => prop.name === "variant")).toBeUndefined();
    expect(props.find((prop) => prop.name === "tone")).toMatchObject({
      type: "enum", default: fallback,
      values: ["neutral", "accent", "info", "success", "warning", "danger"]
    });
  });

  it("keeps button appearance and tag palette independent of semantic tone", () => {
    const button = wlManifest.find((entry) => entry.name === "WlButton")!;
    expect(button.props.find((prop) => prop.name === "variant")!.values)
      .toEqual(["primary", "secondary", "ghost", "soft", "link"]);
    const tag = wlManifest.find((entry) => entry.name === "WlTag")!;
    expect(tag.props.find((prop) => prop.name === "variant")).toBeUndefined();
    expect(tag.props.find((prop) => prop.name === "color")).toMatchObject({
      default: "gray", values: ["gray", "blue", "green", "amber", "red"]
    });
  });

  it.each([
    ["WlDialog", false], ["WlDrawer", true], ["WlPopover", true]
  ] as const)("documents canonical dismissal and preserves the default for %s", (name, fallback) => {
    const props = wlManifest.find((entry) => entry.name === name)!.props;
    expect(props.find((prop) => prop.name === "dismissable")).toBeUndefined();
    expect(props.find((prop) => prop.name === "dismissible")).toMatchObject({ type: "boolean", default: fallback });
  });

  it.each([
    ["WlAlert", ["closeLabel"]],
    ["WlAutocomplete", ["dropdownLabel"]],
    ["WlColorPicker", ["paletteLabel", "inputLabel"]],
    ["WlCommandPalette", ["placeholder", "emptyText", "loadingText", "ariaLabel"]],
    ["WlDatePicker", ["placeholder", "startLabel", "endLabel"]],
    ["WlFilePicker", ["chooseLabel"]],
    ["WlFilterBar", ["ariaLabel", "toggleLabel", "panelTitle", "clearLabel", "applyLabel", "closeLabel"]],
    ["WlNumberInput", ["decrementLabel", "incrementLabel"]],
    ["WlPasswordInput", ["placeholder"]],
    ["WlSidebar", ["ariaLabel", "pinLabel", "unpinLabel"]],
    ["WlSpinner", ["label"]],
    ["WlTable", ["emptyMessage"]],
    ["WlTag", ["removeLabel"]]
  ] as const)("does not inject a translated prop default into consumer examples for %s", (name, labels) => {
    const component = wlManifest.find((entry) => entry.name === name)!;
    for (const label of labels) {
      const prop = component.props.find((entry) => entry.name === label);
      expect(prop, `${name}.${label}: missing localized prop`).toBeDefined();
      expect(prop!.default, `${name}.${label}: locale text must not become an explicit prop override`).toBeUndefined();
      expect(prop!.required).not.toBe(true);
    }
  });
});
