<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";

withDefaults(
  defineProps<{
    /** Группа диалога (как у PrimeVue ConfirmDialog); обычно не нужна. */
    group?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    group: undefined,
    pt: undefined
  }
);
</script>

<template>
  <ConfirmDialog
    :group="group"
    class="wl-dialog wl-confirm"
    :pt="pt"
    data-wl="confirm-dialog"
  />
</template>
