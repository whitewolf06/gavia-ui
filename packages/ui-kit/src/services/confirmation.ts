import { type App, inject, ref, type Ref, toRaw } from "vue";
import type { WlTone } from "../types";
import { onWlAppUnmount } from "../utils/appCleanup";

export interface WlConfirmation {
  message: string;
  header: string;
  acceptLabel: string;
  rejectLabel: string;
  /** Semantic appearance; takes precedence over the legacy danger flag. */
  tone?: WlTone;
  /** Legacy destructive appearance when tone is omitted. */
  danger: boolean;
  group?: string;
  accept?: () => void;
  reject?: () => void;
}
export interface WlConfirmationStore {
  current: Ref<WlConfirmation | null>;
  require: (entry: WlConfirmation) => void;
  request: (entry: WlConfirmation) => Promise<boolean>;
  accept: () => void;
  reject: () => void;
  cancel: (entry: WlConfirmation) => void;
  /** Close the active confirmation regardless of its group. */
  close: () => void;
  /** Close only the matching group; undefined selects the default group. */
  closeGroup: (group: string | undefined) => void;
}
const confirmationKey = Symbol("wl-confirmation");

export const WlConfirmationService = {
  install(app: App): void {
    const current = ref<WlConfirmation | null>(null) as Ref<WlConfirmation | null>;
    let pending: ((accepted: boolean) => void) | undefined;
    function settle(accepted: boolean, notify = false): void {
      const entry = current.value;
      const resolve = pending;
      current.value = null;
      pending = undefined;
      resolve?.(accepted);
      if (notify) {
        if (accepted) entry?.accept?.();
        else entry?.reject?.();
      }
    }
    onWlAppUnmount(app, () => settle(false));
    app.provide<WlConfirmationStore>(confirmationKey, {
      current,
      require(entry) {
        settle(false);
        current.value = entry;
      },
      request(entry) {
        settle(false);
        current.value = entry;
        return new Promise<boolean>((resolve) => {
          pending = resolve;
        });
      },
      accept: () => settle(true, true),
      reject: () => settle(false, true),
      cancel(entry) {
        if (toRaw(current.value) === toRaw(entry)) settle(false);
      },
      close() { settle(false); },
      closeGroup(group) {
        if (current.value?.group === group) settle(false);
      }
    });
  }
};

export function useConfirmationStore(): WlConfirmationStore {
  const store = inject<WlConfirmationStore | null>(confirmationKey, null);
  if (!store) throw new Error("Install WlConfirmationService before using WlConfirmDialog");
  return store;
}
