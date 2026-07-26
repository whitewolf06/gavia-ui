import { useConfirm } from "primevue/useconfirm";
import { wlLocaleRu } from "../locale";

export interface WlConfirmOptions {
  /** Текст вопроса. */
  message: string;
  /** Заголовок диалога (default "Подтверждение"). */
  header?: string;
  /** Подпись кнопки подтверждения (default — локаль кита, "Подтвердить"). */
  acceptLabel?: string;
  /** Подпись кнопки отмены (default — локаль кита, "Отмена"). */
  rejectLabel?: string;
  /** Вызывается при подтверждении. */
  accept?: () => void;
  /** Вызывается при отказе или закрытии. */
  reject?: () => void;
}

const DEFAULT_ACCEPT_LABEL = String(wlLocaleRu.accept ?? "Подтвердить");
const DEFAULT_REJECT_LABEL = String(wlLocaleRu.reject ?? "Отмена");

/**
 * App-level confirm helper. Requires `app.use(WlConfirmationService)` and one
 * `<WlConfirmDialog />` mounted near the app root.
 *
 *   const { confirm, confirmDanger } = useWlConfirm();
 *   confirmDanger({ message: "Удалить задачу?", acceptLabel: "Удалить", accept: … });
 */
export function useWlConfirm(): {
  confirm: (options: WlConfirmOptions) => void;
  confirmDanger: (options: WlConfirmOptions) => void;
  close: () => void;
} {
  const confirmation = useConfirm();

  function requireDialog(options: WlConfirmOptions, danger: boolean): void {
    confirmation.require({
      header: options.header ?? "Подтверждение",
      message: options.message,
      icon: danger ? "pi pi-exclamation-triangle wl-confirm__icon--danger" : undefined,
      acceptLabel: options.acceptLabel ?? DEFAULT_ACCEPT_LABEL,
      rejectLabel: options.rejectLabel ?? DEFAULT_REJECT_LABEL,
      acceptClass: danger ? "wl-btn wl-btn--danger" : "wl-btn wl-btn--primary",
      rejectClass: "wl-btn wl-btn--secondary",
      accept: options.accept,
      reject: options.reject
    });
  }

  return {
    confirm: (options) => requireDialog(options, false),
    confirmDanger: (options) => requireDialog(options, true),
    close: () => confirmation.close()
  };
}
