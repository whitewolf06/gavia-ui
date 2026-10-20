import { describe, expect, it, vi } from "vitest";
import { createPlaygroundPageLoader, playgroundPageLoaders, preloadPlaygroundPage } from "../src/page-loaders";

const imports = vi.hoisted(() => ({ home: vi.fn(), docs: vi.fn(), system: vi.fn() }));
vi.mock("../src/HomePage.vue", () => {
  imports.home();
  return { default: { name: "HomePage" } };
});
vi.mock("../src/DocsPage.vue", () => {
  imports.docs();
  return { default: { name: "DocsPage" } };
});
vi.mock("../src/DesignSystem.vue", () => {
  imports.system();
  return { default: { name: "DesignSystem" } };
});

describe("shared route page imports", () => {
  it("shares an unresolved import and keeps the successful module for the component request", async () => {
    let resolve!: (page: { default: string }) => void;
    const ready = new Promise<{ default: string }>((done) => {
      resolve = done;
    });
    const request = vi.fn(() => ready);
    const load = createPlaygroundPageLoader(request);
    const preload = load();
    const component = load();
    expect(component).toBe(preload);
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    resolve({ default: "Home" });
    await expect(preload).resolves.toEqual({ default: "Home" });
    expect(load()).toBe(preload);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("retries a failed import instead of retaining a rejected preload", async () => {
    const request = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce("Loaded");
    const load = createPlaygroundPageLoader(request);
    const first = load();
    expect(load()).toBe(first);
    await expect(first).rejects.toThrow("Offline");
    const retry = load();
    expect(retry).not.toBe(first);
    await expect(retry).resolves.toBe("Loaded");
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("preloads only the requested page and shares the legacy components alias with Docs", async () => {
    await preloadPlaygroundPage("home");
    expect(imports.home).toHaveBeenCalledTimes(1);
    expect(imports.docs).not.toHaveBeenCalled();
    expect(imports.system).not.toHaveBeenCalled();
    expect(playgroundPageLoaders.home()).toBe(preloadPlaygroundPage("home"));
    expect(preloadPlaygroundPage("components")).toBe(playgroundPageLoaders.docs());
    await preloadPlaygroundPage("docs");
    expect(imports.docs).toHaveBeenCalledTimes(1);
    expect(imports.system).not.toHaveBeenCalled();
  });
});
