<script setup lang="ts">
import { computed } from "vue";
import Drawer from "primevue/drawer";
import type { WlDrawerPosition } from "../types";
import { deepMerge } from "../utils/merge";

const props = withDefaults(
  defineProps<{
    header?: string;
    position?: WlDrawerPosition;
    modal?: boolean;
    dismissable?: boolean;
    closeOnEscape?: boolean;
    blockScroll?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    position: "right",
    modal: true,
    dismissable: true,
    closeOnEscape: true,
    blockScroll: true
  }
);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const visible = defineModel<boolean>("visible", { default: false });

const rootClass = computed(() => ["wl-drawer", `wl-drawer--${props.position}`]);
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
</script>

<template>
  <Drawer
    v-model:visible="visible"
    :header="header"
    :position="position"
    :modal="modal"
    :dismissable="dismissable"
    :closeOnEscape="closeOnEscape"
    :blockScroll="blockScroll"
    :class="rootClass"
    :pt="mergedPt"
    data-wl="drawer"
    @show="emit('open')"
    @hide="emit('close')"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Drawer>
</template>
