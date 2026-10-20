import { ref } from "vue";
import type { WlPt } from "../src/pt-types";
import type { WlToastMessage, WlToastStore } from "../src/services/toast";
import type { WlTone } from "../src/types";
import { useWlConfirm } from "../src/composables/useWlConfirm";
import { useWlToast } from "../src/composables/useWlToast";

type LegacyToastMessage = Omit<WlToastMessage, "tone">;
const legacyMessage: LegacyToastMessage = { id: 1, severity: "info", summary: "Existing message" };
const compatibleLegacyMessage: WlToastMessage = legacyMessage;
const legacyStore = {
  messages: ref<LegacyToastMessage[]>([legacyMessage]),
  add: (_message: Omit<LegacyToastMessage, "id">, _life?: number): number => 1,
  update: (_id: number, _patch: Partial<Omit<LegacyToastMessage, "id" | "group">>): void => {},
  remove: (_id: number): void => {},
  pause: (_id: number, _reason?: unknown): void => {},
  resume: (_id: number, _reason?: unknown): void => {},
  clear: (_group?: string): void => {}
};
const compatibleLegacyStore: WlToastStore = legacyStore;

const toastPt: WlPt<"toast"> = {
  message: ({ context }) => {
    const tone: WlTone = context.tone;
    const id: number = context.id;
    return { "data-tone": tone, "data-message-id": id };
  }
};
const confirmationPt: WlPt<"confirmdialog"> = {
  root: ({ context }) => {
    const tone: WlTone = context.tone;
    const danger: boolean = context.danger;
    return { "data-tone": tone, "data-danger": danger };
  }
};

function contract(): void {
  const toast = useWlToast({ group: "workspace" });
  const id: number = toast.ok("Saved", "Details");
  const canonicalId: number = toast.show("Saved", { tone: "success" });
  toast.update(canonicalId, { tone: "danger" });
  toast.error("Recovered", { tone: "neutral" });
  toast.info("Ready", { life: 0, action: { label: "Undo", onClick: () => {} } });
  toast.update(id, { summary: "Updated", life: 5000, severity: "error" });
  toast.dismiss(id);
  const operation: Promise<number> = toast.promise(Promise.resolve(42), {
    loading: "Saving", success: (value) => ({ summary: value.toFixed(), life: 1000 }), error: "Failed"
  });
  const accepted: Promise<boolean> = useWlConfirm().confirm({ message: "Continue?", accept: () => {} });
  const dangerous: Promise<boolean> = useWlConfirm().confirmDanger({ message: "Delete?" });
  // @ts-expect-error A message cannot be moved into another helper's group.
  toast.update(id, { group: "other" });
  // @ts-expect-error Typed severity remains the existing finite set.
  toast.update(id, { severity: "danger" });
  // @ts-expect-error Legacy severities are not canonical tone values.
  toast.show("Invalid", { tone: "error" });
  // @ts-expect-error Unknown semantic tones are rejected on updates too.
  toast.update(id, { tone: "critical" });
  void operation;
  void accepted;
  void dangerous;
}

void contract;
void toastPt;
void confirmationPt;
void compatibleLegacyMessage;
void compatibleLegacyStore;
