import { inject, ref, type App, type Ref } from "vue";

export interface WlConfirmation {
  message: string;
  header: string;
  acceptLabel: string;
  rejectLabel: string;
  danger: boolean;
  group?: string;
  accept?: () => void;
  reject?: () => void;
}
export interface WlConfirmationStore {
  current: Ref<WlConfirmation | null>;
  require: (entry: WlConfirmation) => void;
  close: () => void;
}
const confirmationKey = Symbol("wl-confirmation");

export const WlConfirmationService = {
  install(app: App): void {
    const current = ref<WlConfirmation | null>(null) as Ref<WlConfirmation | null>;
    app.provide<WlConfirmationStore>(confirmationKey, {
      current,
      require(entry) { current.value = entry; },
      close() { current.value = null; }
    });
  }
};

export function useConfirmationStore(): WlConfirmationStore {
  const store = inject<WlConfirmationStore | null>(confirmationKey, null);
  if (!store) throw new Error("Install WlConfirmationService before using WlConfirmDialog");
  return store;
}
