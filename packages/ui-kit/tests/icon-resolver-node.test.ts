// @vitest-environment node
import { describe, expect, it } from "vitest";
import { resolveWlIconName } from "../src/iconNames";

describe("server-side icon resolver", () => {
  it("resolves persisted names without a browser or changing saved values", () => {
    expect(typeof window).toBe("undefined");
    const record = Object.freeze({ icon: "pi pi-pencil" });
    expect(resolveWlIconName(record.icon)).toBe("edit");
    expect(record.icon).toBe("pi pi-pencil");
    expect(resolveWlIconName("future-icon")).toBeUndefined();
  });
});
