<script setup lang="ts">
import Dialog from "primevue/dialog";

withDefaults(
  defineProps<{
    header?: string;
    modal?: boolean;
    closable?: boolean;
    width?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    modal: true,
    closable: true
  }
);

const visible = defineModel<boolean>("visible", { default: false });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="header"
    :modal="modal"
    :closable="closable"
    :style="width ? { width } : undefined"
    class="wl-dialog"
    :pt="pt"
    data-wl="dialog"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Dialog>
</template>
