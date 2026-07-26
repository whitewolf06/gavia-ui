import { describe, expect, it } from "vitest";
import * as components from "../src/components";
import { wlManifest } from "../src/manifest";
import type { WlManifestCategory } from "../src/manifest";

const CATEGORIES: readonly WlManifestCategory[] = [
  "actions",
  "inputs",
  "data",
  "containers",
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
        /^\d+\.\d+\.\d+$/
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
      for (const prop of entry.props) {
        if (prop.type === "enum" || prop.type === "icon") {
          expect(
            prop.values && prop.values.length > 0,
            `${entry.name}.${prop.name}: missing values`
          ).toBe(true);
        }
      }
    }
  });

  it("prop names are unique within a component", () => {
    for (const entry of wlManifest) {
      const names = entry.props.map((prop) => prop.name);
      expect(new Set(names).size, `${entry.name}: duplicate prop`).toBe(names.length);
    }
  });
});
