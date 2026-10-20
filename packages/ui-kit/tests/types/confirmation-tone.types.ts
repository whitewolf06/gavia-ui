import { ref } from "vue";
import type { WlConfirmApi, WlConfirmation, WlConfirmController, WlConfirmOptions, WlTone } from "../../src";
import type { WlConfirmationStore } from "../../src/services/confirmation";

interface LegacyConfirmation {
  message: string;
  header: string;
  acceptLabel: string;
  rejectLabel: string;
  danger: boolean;
  group?: string;
  accept?: () => void;
  reject?: () => void;
}
const legacyOptions: WlConfirmOptions = { message: "Continue?" };
const legacyEntry: LegacyConfirmation = {
  message: "Delete?", header: "Delete", acceptLabel: "Delete", rejectLabel: "Keep", danger: true
};
const legacyAdapter: WlConfirmApi = {
  confirm: (_options: { message: string }) => {},
  confirmDanger: (_options: { message: string }) => {},
  close: () => {},
  closeGroup: () => {}
};
const legacyStore: WlConfirmationStore = {
  current: ref<LegacyConfirmation | null>(null),
  require: (_entry: LegacyConfirmation) => {},
  request: (_entry: LegacyConfirmation) => Promise.resolve(false),
  accept: () => {}, reject: () => {}, cancel: (_entry: LegacyConfirmation) => {},
  close: () => {}, closeGroup: () => {}
};

function confirmationTones(controller: WlConfirmController, tone: WlTone): void {
  const result: Promise<boolean> = controller.confirm({ ...legacyOptions, tone });
  const alias: Promise<boolean> = controller.confirmDanger({ message: "Review?", tone: "info" });
  const request: WlConfirmation = { ...legacyEntry, tone: "success" };
  legacyStore.require(request);
  // @ts-expect-error Use the canonical semantic tone names.
  controller.confirm({ message: "Delete?", tone: "err" });
  // @ts-expect-error The legacy alias accepts the same finite tone set.
  controller.confirmDanger({ message: "Delete?", tone: "red" });
  void result;
  void alias;
}

void legacyAdapter;
void legacyStore;
void confirmationTones;
