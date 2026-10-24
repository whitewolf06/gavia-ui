import { onBeforeUnmount, readonly, ref } from "vue";

/** Permission failures and unavailable clipboard APIs resolve false, including SSR. */
export function useWlClipboard(options: { resetAfter?: number } = {}) {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let revision = 0;
  let disposed = false;
  onBeforeUnmount(() => {
    disposed = true;
    revision++;
    clearTimeout(timer);
  });
  async function copy(text: string): Promise<boolean> {
    const request = ++revision;
    clearTimeout(timer);
    copied.value = false;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText)
        return false;
      await navigator.clipboard.writeText(text);
      if (disposed || request !== revision)
        return false;
      copied.value = true;
      timer = setTimeout(() => {
        copied.value = false;
      }, Math.max(0, options.resetAfter ?? 2000));
      return true;
    } catch {
      return false;
    }
  }
  return { copied: readonly(copied), copy };
}
