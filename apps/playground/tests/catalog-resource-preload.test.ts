import { describe, expect, it, vi } from "vitest";
import { createCatalogLoader } from "../src/i18n/catalog";
import { createCatalogResourceLoader } from "../src/i18n/preload";

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe("catalog resources shared with early startup", () => {
  it("reuses a pending prefetch when i18n installs it and publishes the resource once", async () => {
    const ready = deferred<{ text: string }>();
    const request = vi.fn(() => ready.promise);
    const resource = createCatalogResourceLoader(request);
    const accept = vi.fn();
    const install = createCatalogLoader(resource, accept);
    const early = resource("ru", "shell");
    expect(resource("ru", "shell")).toBe(early);
    const installing = install("ru", "shell");
    await Promise.resolve();
    expect(request).toHaveBeenCalledExactlyOnceWith("ru", "shell");
    expect(accept).not.toHaveBeenCalled();
    const catalog = { text: "Ready" };
    ready.resolve(catalog);
    await Promise.all([early, installing]);
    await install("ru", "shell");
    expect(accept).toHaveBeenCalledExactlyOnceWith("ru", "shell", catalog);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("retries a failed prefetch without publishing an incomplete resource", async () => {
    const request = vi.fn(async (_locale: string, _namespace: string) => ({ text: "Ready" }))
      .mockRejectedValueOnce(new Error("Offline"));
    const resource = createCatalogResourceLoader(request);
    const accept = vi.fn();
    await expect(resource("ru", "tokens")).rejects.toThrow("Offline");
    expect(accept).not.toHaveBeenCalled();
    await createCatalogLoader(resource, accept)("ru", "tokens");
    expect(request).toHaveBeenCalledTimes(2);
    expect(accept).toHaveBeenCalledExactlyOnceWith("ru", "tokens", { text: "Ready" });
  });

  it("keeps languages and namespaces isolated when requests overlap", async () => {
    const request = vi.fn(async (locale: string, namespace: string) => locale + ":" + namespace);
    const resource = createCatalogResourceLoader(request);
    await expect(Promise.all([resource("ru", "shell"), resource("en", "shell"), resource("ru", "tokens")]))
      .resolves.toEqual(["ru:shell", "en:shell", "ru:tokens"]);
    expect(request.mock.calls).toEqual([["ru", "shell"], ["en", "shell"], ["ru", "tokens"]]);
  });
});
