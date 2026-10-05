<script setup lang="ts">
import { computed } from "vue";
import { WL_ICONS } from "../icons.generated";
import { resolveWlIconName, type WlIconInput } from "../iconNames";

const props = withDefaults(defineProps<{ name?: WlIconInput; size?: number | string }>(), { size: 18 });
const px = computed(() => typeof props.size === "number" ? `${props.size}px` : props.size);
const resolved = computed(() => resolveWlIconName(props.name));
const inner = computed(() => resolved.value ? WL_ICONS[resolved.value] : undefined);
</script>

<template>
  <svg v-if="inner" class="wl-icon" :width="px" :height="px" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true" data-wl="icon" :data-size="size" :data-icon="resolved" v-html="inner" />
  <span v-else class="wl-icon wl-icon--slot" :style="{ width: px, height: px }"
    data-wl="icon" :data-size="size"><slot /></span>
</template>
