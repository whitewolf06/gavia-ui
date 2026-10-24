import { describe, expect, it } from "vitest";
import { getInstallCommand } from "../src/project/installation";

describe("installation command contract", () => {
  it.each([
    ["pnpm", "pnpm add"], ["npm", "npm install"], ["bun", "bun add"]
  ] as const)("%s uses the package name independently from the displayed published version", (manager, prefix) => {
    expect(getInstallCommand(manager)).toBe(prefix + " gavia-ui");
    expect(getInstallCommand(manager, true)).toBe(prefix + " gavia-ui vue");
  });
});
