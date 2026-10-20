import { onScopeDispose, ref, shallowRef, watch } from "vue";

export type SourceLoader = () => Promise<string>;
const cache = new WeakMap<SourceLoader, Promise<string>>();

function loadSource(loader: SourceLoader): Promise<string> {
  const previous = cache.get(loader);
  if (previous) return previous;
  const pending = Promise.resolve().then(loader).catch((error: unknown) => {
    cache.delete(loader);
    throw error;
  });
  cache.set(loader, pending);
  return pending;
}

/** Load only the selected SFC; stale imports cannot overwrite another example. */
export function useLazySource(selected: () => SourceLoader | undefined) {
  const source = shallowRef("");
  const loading = ref(false);
  const error = shallowRef<unknown>();
  let revision = 0;
  let disposed = false;
  async function reload(): Promise<void> {
    const current = ++revision;
    const loader = selected();
    source.value = "";
    error.value = undefined;
    loading.value = Boolean(loader);
    if (!loader) return;
    try {
      const result = await loadSource(loader);
      if (!disposed && current === revision) source.value = result;
    } catch (failure: unknown) {
      if (!disposed && current === revision) error.value = failure;
    } finally {
      if (!disposed && current === revision) loading.value = false;
    }
  }
  watch(selected, () => {
    void reload();
  }, { immediate: true });
  onScopeDispose(() => {
    disposed = true;
    revision++;
  });
  return { source, loading, error, reload };
}
