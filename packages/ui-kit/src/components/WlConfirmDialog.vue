<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
import { useConfirmationStore } from "../services/confirmation";
import WlButton from "./WlButton.vue";
import WlDialog from "./WlDialog.vue";
import WlIcon from "./WlIcon.vue";

const props = defineProps<{ group?: string; pt?: Record<string, unknown> }>();
const store = useConfirmationStore();
const section = useWlPt("confirmdialog", computed(() => props.pt));
const dialogPt = computed(() => Object.fromEntries(
  ["mask", "root", "header", "title", "content", "footer"].map((name) => [name, section(name)])
));
const entry = computed(() => {
  const current = store.current.value;
  return current && current.group === props.group ? current : null;
});
const visible = computed({
  get: () => entry.value !== null,
  set: (value: boolean) => {
    if (value || !entry.value) return;
    const reject = entry.value.reject;
    store.close();
    reject?.();
  }
});
function accept(): void {
  const callback = entry.value?.accept;
  store.close();
  callback?.();
}
</script>

<template>
  <WlDialog v-model:visible="visible" class="wl-confirm" :header="entry?.header" :pt="dialogPt" :closable="false" data-wl="confirm-dialog">
    <div v-bind="section('content')" class="wl-confirm__content">
      <WlIcon v-if="entry?.danger" v-bind="section('icon')" name="warn" :size="20" class="wl-confirm__icon wl-confirm__icon--danger" />
      <span v-bind="section('message')" class="wl-confirm__message">{{ entry?.message }}</span>
    </div>
    <template #footer>
      <WlButton variant="secondary" @click="visible = false">{{ entry?.rejectLabel }}</WlButton>
      <WlButton :variant="entry?.danger ? 'danger' : 'primary'" @click="accept">{{ entry?.acceptLabel }}</WlButton>
    </template>
  </WlDialog>
</template>
