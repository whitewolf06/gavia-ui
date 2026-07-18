<script setup lang="ts">
import { ref } from "vue";
import Popover from "primevue/popover";

withDefaults(
  defineProps<{
    pt?: Record<string, unknown>;
  }>(),
  {}
);

const popRef = ref<InstanceType<typeof Popover> | null>(null);

function toggle(event: Event): void {
  (popRef.value as unknown as { toggle: (e: Event) => void } | null)?.toggle(event);
}
function show(event: Event): void {
  (popRef.value as unknown as { show: (e: Event) => void } | null)?.show(event);
}
function hide(): void {
  (popRef.value as unknown as { hide: () => void } | null)?.hide();
}

defineExpose({ toggle, show, hide });
</script>

<template>
  <Popover ref="popRef" :pt="pt" class="wl-popover" data-wl="popover">
    <slot />
  </Popover>
</template>
