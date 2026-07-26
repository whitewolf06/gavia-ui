import { describe, expect, it } from "vitest";

const componentSources = import.meta.glob<string>("../src/components/*.vue", {
  eager: true,
  query: "?raw",
  import: "default"
});

describe("component public contract", () => {
  it("gives every component a stable data-wl root marker", () => {
    for (const [file, source] of Object.entries(componentSources)) {
      expect(source, `${file}: missing data-wl`).toMatch(/\bdata-wl=/);
    }
  });

  it("publishes variant and size markers whenever those props are supported", () => {
    for (const [file, source] of Object.entries(componentSources)) {
      if (/\bvariant\?\s*:/.test(source)) {
        expect(source, `${file}: missing data-variant`).toMatch(/\bdata-variant=/);
      }

      if (/\bsize\?\s*:/.test(source)) {
        expect(source, `${file}: missing data-size`).toMatch(/\bdata-size=/);
      }
    }
  });
});
