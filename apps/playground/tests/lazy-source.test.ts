import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { type SourceLoader, useLazySource } from "../src/design-system/lazy-source";

function deferred() {
  let resolve!: (source: string) => void;
  const promise = new Promise<string>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("selected SFC source loading", () => {
  it("requests only the selected source, shares in-flight work and caches a successful import", async () => {
    const pending = deferred();
    const selectedLoader = vi.fn(() => pending.promise);
    const unusedLoader = vi.fn(async () => "unused");
    const selected = ref<SourceLoader | undefined>(selectedLoader);
    const scope = effectScope();
    const first = scope.run(() => useLazySource(() => selected.value))!;
    const second = scope.run(() => useLazySource(() => selected.value))!;
    await nextTick();
    expect(first.loading.value).toBe(true);
    expect(selectedLoader).toHaveBeenCalledTimes(1);
    expect(unusedLoader).not.toHaveBeenCalled();
    pending.resolve("<template>Current example</template>");
    await flushPromises();
    expect([first.source.value, second.source.value]).toEqual(Array(2).fill("<template>Current example</template>"));
    await first.reload();
    expect(selectedLoader).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("ignores older responses after navigation and clears unrelated copy text while loading", async () => {
    const old = deferred();
    const current = deferred();
    const selected = ref<SourceLoader | undefined>(() => old.promise);
    const scope = effectScope();
    const state = scope.run(() => useLazySource(() => selected.value))!;
    selected.value = () => current.promise;
    await nextTick();
    expect(state.source.value).toBe("");
    current.resolve("Current");
    await flushPromises();
    old.resolve("Stale");
    await flushPromises();
    expect(state.source.value).toBe("Current");
    expect(state.loading.value).toBe(false);
    scope.stop();
  });

  it("allows retry after a rejected import and ignores completion after disposal", async () => {
    const loader = vi.fn<SourceLoader>().mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce("Recovered");
    const scope = effectScope();
    const state = scope.run(() => useLazySource(() => loader))!;
    await flushPromises();
    expect(state.error.value).toBeInstanceOf(Error);
    expect(state.loading.value).toBe(false);
    await state.reload();
    expect(state.source.value).toBe("Recovered");
    expect(state.error.value).toBeUndefined();
    scope.stop();

    const pending = deferred();
    const disposedScope = effectScope();
    const disposed = disposedScope.run(() => useLazySource(() => () => pending.promise))!;
    disposedScope.stop();
    pending.resolve("Too late");
    await flushPromises();
    expect(disposed.source.value).toBe("");
  });
});
