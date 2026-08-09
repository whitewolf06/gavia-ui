<script setup lang="ts">
import { computed } from "vue";
import Dialog from "primevue/dialog";
import { deepMerge } from "../utils/merge";

const props = withDefaults(
  defineProps<{
    header?: string;
    modal?: boolean;
    closable?: boolean;
    dismissable?: boolean;
    closeOnEscape?: boolean;
    blockScroll?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    width?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    modal: true,
    closable: true,
    dismissable: false,
    closeOnEscape: true,
    blockScroll: true
  }
);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const visible = defineModel<boolean>("visible", { default: false });

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
  <Dialog
    v-model:visible="visible"
    :header="header"
    :modal="modal"
    :closable="closable"
    :dismissableMask="dismissable"
    :closeOnEscape="closeOnEscape"
    :blockScroll="blockScroll"
    :style="width ? { width } : undefined"
    class="wl-dialog"
    :pt="mergedPt"
    data-wl="dialog"
    @show="emit('open')"
    @hide="emit('close')"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Dialog>
</template>
