<script setup lang="ts">
import { computed, ref } from "vue";
import Popover from "primevue/popover";
import { deepMerge } from "../utils/merge";

const props = withDefaults(
  defineProps<{
    dismissable?: boolean;
    closeOnEscape?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    dismissable: true,
    closeOnEscape: true
  }
);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const popRef = ref<InstanceType<typeof Popover> | null>(null);
let openState = false;
const mergedPt = computed(() =>
  deepMerge(
    {
      root: {
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby
      }
    },
    props.pt
  )
);

function markOpen(): void {
  if (openState) return;
  openState = true;
  emit("open");
}

function markClose(): void {
  if (!openState) return;
  openState = false;
  emit("close");
}

function toggle(event: Event): void {
  (popRef.value as unknown as { toggle: (e: Event) => void } | null)?.toggle(event);
  openState ? markClose() : markOpen();
}
function show(event: Event): void {
  (popRef.value as unknown as { show: (e: Event) => void } | null)?.show(event);
  markOpen();
}
function hide(): void {
  (popRef.value as unknown as { hide: () => void } | null)?.hide();
  markClose();
}

defineExpose({ toggle, show, hide });
</script>

<template>
  <Popover
    ref="popRef"
    :dismissable="dismissable"
    :closeOnEscape="closeOnEscape"
    :pt="mergedPt"
    class="wl-popover"
    data-wl="popover"
    @show="markOpen"
    @hide="markClose"
  >
    <slot />
  </Popover>
</template>
