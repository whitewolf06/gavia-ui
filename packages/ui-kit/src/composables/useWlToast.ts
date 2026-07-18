import { useToast } from "primevue/usetoast";

const WL_TOAST_LIFE = 2200;

type WlToastSeverity = "success" | "info" | "warn" | "error";

/**
 * App-level toast helper. Requires `app.use(WlToastService)` and one
 * `<WlToast />` mounted near the app root.
 */
export function useWlToast(): {
  ok: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
  warn: (message: string, detail?: string) => void;
  err: (message: string, detail?: string) => void;
} {
  const toast = useToast();

  function push(severity: WlToastSeverity, message: string, detail?: string): void {
    toast.add({ severity, summary: message, detail, life: WL_TOAST_LIFE });
  }

  return {
    ok: (message, detail) => push("success", message, detail),
    info: (message, detail) => push("info", message, detail),
    warn: (message, detail) => push("warn", message, detail),
    err: (message, detail) => push("error", message, detail)
  };
}
