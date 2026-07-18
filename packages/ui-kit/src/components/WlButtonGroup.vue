<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string;
  }>(),
  {}
);
</script>

<template>
  <div class="wl-btn-group" role="group" :aria-label="ariaLabel" data-wl="button-group">
    <slot />
  </div>
</template>
