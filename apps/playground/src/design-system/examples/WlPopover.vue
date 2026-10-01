<script setup lang="ts">
import { ref } from "vue";
import { WlPopover, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const popover = ref<InstanceType<typeof WlPopover> | null>(null);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="popover?.toggle($event)">Сведения</WlButton><WlPopover ref="popover" aria-label="Сведения о материале" v-bind="preview"><p class="wl-text-body">Содержимое привязано к кнопке.</p><WlButton size="sm" @click="popover?.hide()">Закрыть</WlButton></WlPopover>
  </div>
</template>
