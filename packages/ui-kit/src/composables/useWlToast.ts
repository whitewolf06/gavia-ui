import type { WlTone } from "../types";
import { getWlToastSeverity, useToastStore, type WlToastMessageOptions, type WlToastUpdate } from "../services/toast";

export interface WlToastOptions {
  /** Mount a WlToast with the same group to display these messages. */
  group?: string;
}

export interface WlToastPush {
  (summary: string, options?: WlToastMessageOptions): number;
  /** Existing detail strings remain supported. */
  (summary: string, detail?: string): number;
}
export type WlToastContent = string | (WlToastMessageOptions & { summary: string });
export interface WlToastPromiseOptions<T> {
  loading: WlToastContent;
  success: WlToastContent | ((value: T) => WlToastContent);
  error: WlToastContent | ((error: unknown) => WlToastContent);
}
export interface WlToastApi {
  ok: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
  warn: (message: string, detail?: string) => void;
  err: (message: string, detail?: string) => void;
  /** Clear this helper's group without removing another group's messages. */
  clear: () => void;
}

/** The installed helper's richer API; legacy WlToastApi implementations remain valid. */
export interface WlToastController extends WlToastApi {
  /** Show a message using its semantic tone; defaults to info. */
  show: WlToastPush;
  success: WlToastPush;
  info: WlToastPush;
  warning: WlToastPush;
  error: WlToastPush;
  /** Alias for success, preserving the existing API. */
  ok: WlToastPush;
  /** Alias for warning, preserving the existing API. */
  warn: WlToastPush;
  /** Alias for error, preserving the existing API. */
  err: WlToastPush;
  update: (id: number, patch: WlToastUpdate) => void;
  dismiss: (id: number) => void;
  promise: <T>(promise: Promise<T>, options: WlToastPromiseOptions<T>) => Promise<T>;
  /** Clear this helper's group without removing another group's messages. */
  clear: () => void;
}

function content(value: WlToastContent): WlToastMessageOptions & { summary: string } {
  return typeof value === "string" ? { summary: value } : value;
}

/** App-level toast helper; install WlToastService and mount WlToast once per displayed group. */
export function useWlToast(options: WlToastOptions = {}): WlToastController {
  const store = useToastStore();
  const push = (fallback: WlTone): WlToastPush => (summary: string, detail?: string | WlToastMessageOptions) => {
    const settings = typeof detail === "string" ? { detail } : detail;
    const tone = settings?.tone ?? fallback;
    return store.add({ ...settings, tone, severity: getWlToastSeverity(tone), summary, group: options.group });
  };
  const owns = (id: number) => store.messages.value.some((message) => message.id === id && message.group === options.group);
  const update = (id: number, patch: WlToastUpdate, resetLife = false): void => {
    if (owns(id)) store.update(id, patch, resetLife);
  };
  const success = push("success");
  const info = push("info");
  const warning = push("warning");
  const error = push("danger");
  return {
    show: info,
    success, info, warning, error,
    ok: success, warn: warning, err: error,
    update,
    dismiss: (id) => { if (owns(id)) store.remove(id); },
    promise<T>(promise: Promise<T>, settings: WlToastPromiseOptions<T>): Promise<T> {
      const initial = content(settings.loading);
      const id = store.add({ ...initial, tone: initial.tone ?? "info", severity: "info", life: 0, group: options.group });
      return promise.then((value) => {
        const resolved = content(typeof settings.success === "function" ? settings.success(value) : settings.success);
        update(id, {
          ...resolved, tone: resolved.tone ?? "success", severity: "success", detail: resolved.detail, action: resolved.action
        }, true);
        return value;
      }, (reason: unknown) => {
        const resolved = content(typeof settings.error === "function" ? settings.error(reason) : settings.error);
        update(id, {
          ...resolved, tone: resolved.tone ?? "danger", severity: "error", detail: resolved.detail, action: resolved.action
        }, true);
        throw reason;
      });
    },
    clear: () => store.clear(options.group)
  };
}
