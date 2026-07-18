<script setup lang="ts">
import { computed } from "vue";
import Drawer from "primevue/drawer";
import type { WlDrawerPosition } from "../types";

const props = withDefaults(
  defineProps<{
    header?: string;
    position?: WlDrawerPosition;
    modal?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    position: "right",
    modal: true
  }
);

const visible = defineModel<boolean>("visible", { default: false });

const rootClass = computed(() => ["wl-drawer", `wl-drawer--${props.position}`]);
</script>

<template>
  <Drawer
    v-model:visible="visible"
    :header="header"
    :position="position"
    :modal="modal"
    :class="rootClass"
    :pt="pt"
    data-wl="drawer"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Drawer>
</template>
