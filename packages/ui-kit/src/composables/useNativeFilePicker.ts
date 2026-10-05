import { ref } from "vue";

/** Browser selection only. The consumer owns the chosen files and upload policy. */
export function useNativeFilePicker(
  disabled: () => boolean,
  select: (files: File[]) => void,
  cancel?: () => void
) {
  const input = ref<HTMLInputElement | null>(null);
  function clear(): void { if (input.value) input.value.value = ""; }
  function choose(): void {
    // Keep click synchronous so the browser retains the caller's user activation.
    if (!disabled()) input.value?.click();
  }
  function onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    try {
      if (!disabled() && files.length) select(files);
    } finally {
      target.value = "";
    }
  }
  function onCancel(): void {
    clear();
    if (!disabled()) cancel?.();
  }
  return { input, choose, clear, onChange, onCancel };
}
