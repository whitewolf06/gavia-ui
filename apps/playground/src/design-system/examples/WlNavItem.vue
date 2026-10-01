<script setup lang="ts">
import { ref } from "vue";
import { WlNavItem } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlNavItem label="Материалы команды" icon="folder" :badge="12" :active="active" v-bind="preview" @click="active = !active" />
  </div>
</template>
