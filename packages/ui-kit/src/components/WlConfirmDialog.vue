<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed, shallowRef, watch } from "vue";
import { useWlPt } from "../config";
import { useConfirmationStore, type WlConfirmation } from "../services/confirmation";
import WlButton from "./WlButton.vue";
import WlDialog from "./WlDialog.vue";
import WlIcon from "./WlIcon.vue";

defineSlots<{}>();
const props = withDefaults(defineProps<{ group?: string; motion?: boolean; pt?: WlPt<"confirmdialog"> }>(), {
  motion: undefined
});
const store = useConfirmationStore();
const section = useWlPt("confirmdialog", computed(() => props.pt));
const dialogPt = computed(() => Object.fromEntries(
  ["mask", "root", "header", "title", "content", "footer"].map((name) => [name, section(name)])
));
const entry = computed(() => {
  const current = store.current.value;
  return current && current.group === props.group ? current : null;
});
// Keep the message in the DOM until the dialog's exit transition finishes.
const lastEntry = shallowRef<WlConfirmation | null>(null);
watch(entry, (value) => { if (value) lastEntry.value = value; }, { immediate: true });
const displayed = computed(() => entry.value ?? lastEntry.value);
const visible = computed({
  get: () => entry.value !== null,
  set: (value: boolean) => {
    if (value || !entry.value) return;
    const reject = entry.value.reject;
    store.closeGroup(props.group);
    reject?.();
  }
});
function accept(): void {
  if (!entry.value) return;
  const callback = entry.value.accept;
  store.closeGroup(props.group);
  callback?.();
}
</script>

<template>
  <WlDialog v-model:visible="visible" class="wl-confirm" :header="displayed?.header" :pt="dialogPt" :motion="motion" :closable="false" data-wl="confirm-dialog" @after-leave="lastEntry = null">
    <div v-bind="section('content')" class="wl-confirm__content">
      <WlIcon v-if="displayed?.danger" v-bind="section('icon')" name="warn" :size="20" class="wl-confirm__icon wl-confirm__icon--danger" />
      <span v-bind="section('message')" class="wl-confirm__message">{{ displayed?.message }}</span>
    </div>
    <template #footer>
      <WlButton variant="secondary" @click="visible = false">{{ displayed?.rejectLabel }}</WlButton>
      <WlButton :variant="displayed?.danger ? 'danger' : 'primary'" @click="accept">{{ displayed?.acceptLabel }}</WlButton>
    </template>
  </WlDialog>
</template>
