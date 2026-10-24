import { onScopeDispose } from "vue";
import type { WlTone } from "../types";
import { useWlLocale } from "../config";
import { useConfirmationStore, type WlConfirmation } from "../services/confirmation";

export interface WlConfirmOptions {
  message: string;
  /** Semantic appearance of the confirmation action; defaults to accent. */
  tone?: WlTone;
  /** Mount a WlConfirmDialog with the same group to display this request. */
  group?: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

export interface WlConfirmApi {
  confirm: (options: WlConfirmOptions) => void;
  /** Legacy danger alias; an explicit options.tone takes precedence. */
  confirmDanger: (options: WlConfirmOptions) => void;
  /** Existing close remains global and safe to use directly as a DOM event handler. */
  close: () => void;
  closeGroup: (group: string | undefined) => void;
}

/** Promise-returning installed helper, also assignable to the released callback API. */
export interface WlConfirmController extends WlConfirmApi {
  confirm: (options: WlConfirmOptions) => Promise<boolean>;
  /** Legacy danger alias; an explicit options.tone takes precedence. */
  confirmDanger: (options: WlConfirmOptions) => Promise<boolean>;
}

/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export function useWlConfirm(): WlConfirmController {
  const store = useConfirmationStore();
  const locale = useWlLocale();
  const owned = new Set<WlConfirmation>();
  onScopeDispose(() => {
    owned.forEach((entry) => store.cancel(entry));
    owned.clear();
  });
  const require = (options: WlConfirmOptions, danger: boolean): Promise<boolean> => {
    const tone = options.tone ?? (danger ? "danger" : "accent");
    const entry: WlConfirmation = {
      header: options.header ?? locale.value.confirmation,
      message: options.message,
      group: options.group,
      acceptLabel: options.acceptLabel ?? locale.value.accept,
      rejectLabel: options.rejectLabel ?? locale.value.reject,
      tone,
      danger: tone === "danger",
      accept: options.accept,
      reject: options.reject
    };
    owned.add(entry);
    return store.request(entry).then((accepted) => {
      owned.delete(entry);
      return accepted;
    });
  };
  return {
    confirm: (options) => require(options, false),
    confirmDanger: (options) => require(options, true),
    close: store.close,
    closeGroup: store.closeGroup
  };
}
