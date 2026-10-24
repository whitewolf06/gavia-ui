import { describe, expect, it } from "vitest";
import { getLocalizedManifest, isComponentNewInRelease } from "../src/documentation/manifest";

describe("new component release badges", () => {
  it.each([
    ["1.0.0-rc.1", "1.0.0", true],
    ["1.0.0-rc.1", "1.0.0-rc.2", true],
    ["1.0.0", "1.0.0+build.1", true],
    ["1.0.0-rc.1", "1.0.1", false],
    ["0.1.0", "1.0.0", false]
  ] as const)("compares introduction %s with release %s", (introducedIn, currentVersion, expected) => {
    expect(isComponentNewInRelease(introducedIn, currentVersion)).toBe(expected);
  });

  it("keeps the original RC introduction while marking WlLink new in stable 1.0", () => {
    const link = getLocalizedManifest().find((entry) => entry.name === "WlLink")!;
    expect(link.introducedIn).toBe("1.0.0-rc.1");
    expect(isComponentNewInRelease(link.introducedIn, "1.0.0")).toBe(true);
  });
});
