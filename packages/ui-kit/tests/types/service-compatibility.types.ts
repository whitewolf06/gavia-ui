import type { WlConfirmApi, WlConfirmController, WlToastApi, WlToastController } from "../../src";
import { useWlConfirm, useWlToast } from "../../src";

// Existing consumer-provided adapters need neither Promise returns nor new methods.
const legacyConfirm: WlConfirmApi = {
  confirm: () => {}, confirmDanger: () => {}, close: () => {}, closeGroup: () => {}
};
const legacyToast: WlToastApi = {
  ok: () => {}, info: () => {}, warn: () => {}, err: () => {}, clear: () => {}
};

function installedContracts(): void {
  const confirmation: WlConfirmController = useWlConfirm();
  const pending: Promise<boolean> = confirmation.confirm({ message: "Continue?" });
  const toast: WlToastController = useWlToast();
  const id: number = toast.info("Saved", { life: 0 });
  toast.update(id, { summary: "Updated" });
  const compatibleConfirm: WlConfirmApi = confirmation;
  const compatibleToast: WlToastApi = toast;
  void pending;
  void compatibleConfirm;
  void compatibleToast;
}

void legacyConfirm;
void legacyToast;
void installedContracts;
