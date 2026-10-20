<script setup lang="ts">
/** WlConfirmDialog public component contract.
 * @since 0.2.0
 * @slot default - Default component content.
 * @slot footer - Custom footer content.
 */
import { computed, onBeforeUnmount, shallowRef, watch } from "vue";
import type { WlPt } from "../pt-types";
import type { WlTone } from "../types";
import { useWlPt } from "../config";
import { useConfirmationStore, type WlConfirmation } from "../services/confirmation";
import WlButton from "./WlButton.vue";
import WlDialog from "./WlDialog.vue";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(defineProps<{
  /** Dialog group; usually optional. */
  group?: string;
  /** Window animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"confirmdialog">; }>(), {
  motion: undefined
});
defineSlots<{
  /** Custom confirmation message; receives the active confirmation request. */
  default?(props: { confirmation: WlConfirmation }): unknown;
  /** Custom confirmation actions with accept and reject callbacks. */
  footer?(props: { confirmation: WlConfirmation; accept: () => void; reject: () => void }): unknown;
}>();
const store = useConfirmationStore();
const section = useWlPt("confirmdialog", computed(() => props.pt));
const entry = computed(() => {
  const current = store.current.value;
  return current && current.group === props.group ? current : null;
});
// Keep the message in the DOM until the dialog's exit transition finishes.
const lastEntry = shallowRef<WlConfirmation | null>(null);
watch(entry, (value) => {
  if (value) lastEntry.value = value;
}, { immediate: true });
const displayed = computed(() => entry.value ?? lastEntry.value);
const tone = computed<WlTone>(() => displayed.value?.tone ?? (displayed.value?.danger ? "danger" : "accent"));
const context = computed(() => ({ tone: tone.value, danger: tone.value === "danger" }));
const dialogPt = computed(() => Object.fromEntries(
  ["mask", "root", "header", "title", "content", "footer"].map((name) => [name, section(name, context.value)])
));
const visible = computed({
  get: () => entry.value !== null,
  set: (value: boolean) => {
    if (value || !entry.value) return;
    store.reject();
  }
});
function accept(): void {
  if (!entry.value) return;
  store.accept();
}
function reject(): void {
  if (entry.value) store.reject();
}
onBeforeUnmount(() => {
  store.closeGroup(props.group);
});
</script>

<template>
  <WlDialog
    v-model:visible="visible"
    class="wl-confirm"
    :header="displayed?.header"
    :pt="dialogPt"
    :motion="motion"
    :closable="false"
    data-wl="confirm-dialog"
    :data-tone="tone"
    @after-leave="lastEntry = null"
  >
    <slot v-if="displayed" :confirmation="displayed">
      <div v-bind="section('content', context)" class="wl-confirm__content">
        <WlIcon
          v-if="tone === 'danger'"
          v-bind="section('icon', context)"
          name="warn"
          :size="20"
          class="wl-confirm__icon wl-confirm__icon--danger"
        />
        <span v-bind="section('message', context)" class="wl-confirm__message">{{ displayed?.message }}</span>
      </div>
    </slot>
    <template #footer>
      <slot
        v-if="displayed"
        name="footer"
        :confirmation="displayed"
        :accept="accept"
        :reject="reject"
      >
        <WlButton variant="secondary" @click="visible = false">{{ displayed?.rejectLabel }}</WlButton>
        <WlButton variant="primary" :tone="tone" @click="accept">{{ displayed?.acceptLabel }}</WlButton>
      </slot>
    </template>
  </WlDialog>
</template>
