import { useWlLocale } from "../config";
import { useConfirmationStore } from "../services/confirmation";

export interface WlConfirmOptions {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

/** App-level confirmation helper; install WlConfirmationService and mount WlConfirmDialog once. */
export function useWlConfirm(): {
  confirm: (options: WlConfirmOptions) => void;
  confirmDanger: (options: WlConfirmOptions) => void;
  close: () => void;
} {
  const store = useConfirmationStore();
  const locale = useWlLocale();
  const require = (options: WlConfirmOptions, danger: boolean): void => {
    store.require({
      header: options.header ?? "Подтверждение",
      message: options.message,
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
    close: store.close
  };
}
