import { describe, expect, it, vi } from "vitest";
import { createCatalogLoader } from "../src/i18n/catalog";

describe("lazy catalog requests", () => {
  it("shares pending imports by language and namespace and merges each successful catalog once", async () => {
    const loader = vi.fn(async (locale: string, namespace: string) => locale + ":" + namespace);
    const accept = vi.fn();
    const load = createCatalogLoader(loader, accept);
    const first = load("en", "shell");
    const duplicate = load("en", "shell");
    expect(first).toBe(duplicate);
    await Promise.all([first, load("ru", "shell"), load("en", "examples")]);
    await load("en", "shell");
    expect(loader.mock.calls).toEqual([["en", "shell"], ["ru", "shell"], ["en", "examples"]]);
    expect(accept).toHaveBeenCalledTimes(3);
  });

  it("retries a rejected import without publishing incomplete messages", async () => {
    const loader = vi.fn(async (_locale: string, _namespace: string) => "Loaded")
      .mockRejectedValueOnce(new Error("Offline"));
    const accept = vi.fn();
    const load = createCatalogLoader(loader, accept);
    await expect(load("ru", "tokens")).rejects.toThrow("Offline");
    expect(accept).not.toHaveBeenCalled();
    await load("ru", "tokens");
    expect(loader).toHaveBeenCalledTimes(2);
    expect(accept).toHaveBeenCalledExactlyOnceWith("ru", "tokens", "Loaded");
  });
});
