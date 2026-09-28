import { useToastStore, type WlToastSeverity } from "../services/toast";

/** App-level toast helper; install WlToastService and mount WlToast once. */
export function useWlToast(): {
  ok: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
  warn: (message: string, detail?: string) => void;
  err: (message: string, detail?: string) => void;
} {
  const store = useToastStore();
  const push = (severity: WlToastSeverity, summary: string, detail?: string): void => {
    store.add({ severity, summary, detail });
  };
  return {
    ok: (message, detail) => push("success", message, detail),
    info: (message, detail) => push("info", message, detail),
    warn: (message, detail) => push("warn", message, detail),
    err: (message, detail) => push("error", message, detail)
  };
}
