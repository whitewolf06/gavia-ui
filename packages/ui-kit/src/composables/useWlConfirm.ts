import { useWlLocale } from "../config";
import { useConfirmationStore } from "../services/confirmation";

export interface WlConfirmOptions {
  message: string;
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
  confirmDanger: (options: WlConfirmOptions) => void;
  /** Existing close remains global and safe to use directly as a DOM event handler. */
  close: () => void;
  closeGroup: (group: string | undefined) => void;
}

/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export function useWlConfirm(): WlConfirmApi {
  const store = useConfirmationStore();
  const locale = useWlLocale();
  const require = (options: WlConfirmOptions, danger: boolean): void => {
    store.require({
      header: options.header ?? locale.value.confirmation,
      message: options.message,
      group: options.group,
      acceptLabel: options.acceptLabel ?? locale.value.accept,
      rejectLabel: options.rejectLabel ?? locale.value.reject,
      danger,
      accept: options.accept,
      reject: options.reject
    });
  };
  return {
    confirm: (options) => require(options, false),
    confirmDanger: (options) => require(options, true),
    close: store.close,
    closeGroup: store.closeGroup
  };
}
