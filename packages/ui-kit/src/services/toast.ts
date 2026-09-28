import { inject, ref, type App, type Ref } from "vue";

export type WlToastSeverity = "success" | "info" | "warn" | "error";
export interface WlToastMessage {
  id: number;
  severity: WlToastSeverity;
  summary: string;
  detail?: string;
  group?: string;
}
export interface WlToastStore {
  messages: Ref<WlToastMessage[]>;
  add: (message: Omit<WlToastMessage, "id">, life?: number) => void;
  remove: (id: number) => void;
}
const toastKey = Symbol("wl-toast");

/** Each Vue app receives its own queue. */
export const WlToastService = {
  install(app: App): void {
    const messages = ref<WlToastMessage[]>([]);
    let nextId = 0;
    const remove = (id: number): void => {
      messages.value = messages.value.filter((message) => message.id !== id);
    };
    app.provide<WlToastStore>(toastKey, {
      messages,
      remove,
      add(message, life = 2200) {
        const id = ++nextId;
        messages.value.push({ ...message, id });
        if (life > 0) setTimeout(() => remove(id), life);
      }
    });
  }
};

export function useToastStore(): WlToastStore {
  const store = inject<WlToastStore | null>(toastKey, null);
  if (!store) throw new Error("Install WlToastService before using WlToast");
  return store;
}
