import { type App, inject, ref, type Ref } from "vue";
import type { WlTone } from "../types";
import { onWlAppUnmount } from "../utils/appCleanup";
import { isWlDevelopment } from "../utils/development";

export type WlToastSeverity = "success" | "info" | "warn" | "error";
export type WlToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export interface WlToastAction {
  label: string;
  onClick: () => void;
}
export interface WlToastMessageOptions {
  /** Semantic tone; takes precedence over a legacy severity or helper name. */
  tone?: WlTone;
  detail?: string;
  /** Milliseconds; zero keeps the message until it is dismissed. */
  life?: number;
  action?: WlToastAction;
}
export interface WlToastMessage {
  id: number;
  /** @deprecated Use tone for new messages; retained as the legacy projection. */
  severity: WlToastSeverity;
  /** Optional on existing consumer messages; installed stores always resolve it. */
  tone?: WlTone;
  summary: string;
  detail?: string;
  group?: string;
  life?: number;
  action?: WlToastAction;
}
export type WlToastUpdate = Partial<Omit<WlToastMessage, "id" | "group">>;
export interface WlToastServiceOptions {
  life?: number;
  errorLife?: number;
}
export interface WlToastStore {
  messages: Ref<WlToastMessage[]>;
  add: (message: Omit<WlToastMessage, "id">, life?: number) => number;
  /** Promise settlement resets the lifetime even if its tone did not change. */
  update: (id: number, patch: WlToastUpdate, resetLife?: boolean) => void;
  remove: (id: number) => void;
  pause: (id: number, reason?: unknown) => void;
  resume: (id: number, reason?: unknown) => void;
  /** Remove only one group; omitted group clears the default group. */
  clear: (group?: string) => void;
}
const toastKey = Symbol("wl-toast");

const legacyTones: Readonly<Record<WlToastSeverity, WlTone>> = {
  success: "success", info: "info", warn: "warning", error: "danger"
};
const legacySeverities: Readonly<Record<WlTone, WlToastSeverity>> = {
  neutral: "info", accent: "info", info: "info", success: "success", warning: "warn", danger: "error"
};

/** Resolve existing consumer messages without requiring a new field. */
export function getWlToastTone(message: Pick<WlToastMessage, "tone" | "severity">): WlTone {
  return message.tone ?? legacyTones[message.severity];
}

/** Keep the released severity field available to existing slots and adapters. */
export function getWlToastSeverity(tone: WlTone): WlToastSeverity {
  return legacySeverities[tone];
}

function validLife(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

interface ToastTimer {
  timer?: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
  sticky: boolean;
  paused: Set<unknown>;
}

/** Each Vue app receives its own queue. */
export const WlToastService = {
  install(app: App, options: WlToastServiceOptions = {}): void {
    const messages = ref<WlToastMessage[]>([]);
    let nextId = 0;
    let warnedSeverity = false;
    const timers = new Map<number, ToastTimer>();
    const defaultLife = (tone: WlTone) => tone === "danger"
      ? validLife(options.errorLife, validLife(options.life, 8000))
      : validLife(options.life, 5000);
    function warnLegacySeverity(): void {
      if (warnedSeverity || !isWlDevelopment()) return;
      warnedSeverity = true;
      console.warn("[Gavia UI] Toast severity is deprecated; use tone instead.");
    }
    function stop(timer: ToastTimer): void {
      if (timer.timer !== undefined) clearTimeout(timer.timer);
      timer.timer = undefined;
    }
    const remove = (id: number): void => {
      const timer = timers.get(id);
      if (timer) stop(timer);
      timers.delete(id);
      messages.value = messages.value.filter((message) => message.id !== id);
    };
    function schedule(id: number, timer: ToastTimer): void {
      if (timer.sticky || timer.paused.size) return;
      timer.startedAt = Date.now();
      timer.timer = setTimeout(() => remove(id), timer.remaining);
    }
    function resetTimer(message: WlToastMessage, life: number): void {
      const previous = timers.get(message.id);
      if (previous) stop(previous);
      const timer: ToastTimer = {
        remaining: life, startedAt: Date.now(), sticky: life === 0,
        paused: previous?.paused ?? new Set()
      };
      timers.set(message.id, timer);
      schedule(message.id, timer);
    }
    onWlAppUnmount(app, () => {
      timers.forEach(stop);
      timers.clear();
      messages.value = [];
    });
    app.provide<WlToastStore>(toastKey, {
      messages,
      remove,
      update(id, patch, resetLife = false) {
        const message = messages.value.find((entry) => entry.id === id);
        if (!message) return;
        if (patch.severity !== undefined && patch.tone === undefined) warnLegacySeverity();
        const previousTone = getWlToastTone(message);
        const tone = patch.tone ?? (patch.severity !== undefined ? legacyTones[patch.severity] : previousTone);
        if (patch.summary !== undefined) message.summary = patch.summary;
        message.tone = tone;
        message.severity = getWlToastSeverity(tone);
        if (Object.prototype.hasOwnProperty.call(patch, "detail")) message.detail = patch.detail;
        if (Object.prototype.hasOwnProperty.call(patch, "action")) message.action = patch.action;
        if (resetLife || patch.life !== undefined || tone !== previousTone) {
          message.life = validLife(patch.life, defaultLife(tone));
          resetTimer(message, message.life);
        }
      },
      pause(id, reason = "manual") {
        const timer = timers.get(id);
        if (!timer || timer.paused.has(reason)) return;
        if (timer.timer !== undefined) {
          timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
          stop(timer);
        }
        timer.paused.add(reason);
      },
      resume(id, reason = "manual") {
        const timer = timers.get(id);
        if (!timer || !timer.paused.delete(reason) || timer.paused.size) return;
        schedule(id, timer);
      },
      clear(group) {
        for (const message of messages.value) {
          if (message.group === group) remove(message.id);
        }
      },
      add(message, life = message.life) {
        if (message.tone === undefined) warnLegacySeverity();
        const id = ++nextId;
        const tone = getWlToastTone(message);
        const duration = validLife(life, defaultLife(tone));
        const entry: WlToastMessage = { ...message, id, tone, severity: getWlToastSeverity(tone), life: duration };
        messages.value.push(entry);
        resetTimer(entry, duration);
        return id;
      }
    });
  }
};

export function useToastStore(): WlToastStore {
  const store = inject<WlToastStore | null>(toastKey, null);
  if (!store) throw new Error("Install WlToastService before using WlToast");
  return store;
}
