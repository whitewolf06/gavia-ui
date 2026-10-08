import { useToastStore, type WlToastSeverity } from "../services/toast";

export interface WlToastOptions {
  /** Mount a WlToast with the same group to display these messages. */
  group?: string;
}

export interface WlToastApi {
  ok: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
  warn: (message: string, detail?: string) => void;
  err: (message: string, detail?: string) => void;
  /** Clear this helper's group without removing another group's messages. */
  clear: () => void;
}

/** App-level toast helper; install WlToastService and mount WlToast once per displayed group. */
export function useWlToast(options: WlToastOptions = {}): WlToastApi {
  const store = useToastStore();
  const push = (severity: WlToastSeverity, summary: string, detail?: string): void => {
    store.add({ severity, summary, detail, group: options.group });
  };
  return {
    ok: (message, detail) => push("success", message, detail),
    info: (message, detail) => push("info", message, detail),
    warn: (message, detail) => push("warn", message, detail),
    err: (message, detail) => push("error", message, detail),
    clear: () => store.clear(options.group)
  };
}
