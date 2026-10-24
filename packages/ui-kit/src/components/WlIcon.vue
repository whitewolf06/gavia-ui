<script setup lang="ts">
/** WlIcon public component contract.
 * @since 0.1.0
 * @slot default - Custom icon; displayed when name is absent.
 */
import { computed, toRaw } from "vue";
import { useWlIcons } from "../config";
import { resolveWlIconName, type WlIconInput } from "../iconNames";
import { WL_ICONS } from "../icons.generated";

const props = withDefaults(defineProps<{
  /** Icon name from the set. */
  name?: WlIconInput;
  /**
   * Size: number (px) or string (CSS), for example "1em".
   * @default 18
   */
  size?: number | string;
  /** Accessible title for a meaningful icon. */
  title?: string; }>(), { size: 18 });
const icons = useWlIcons();
const custom = computed(() => props.name ? toRaw(icons.value[props.name]) : undefined);
const px = computed(() => typeof props.size === "number" ? `${props.size}px` : props.size);
const resolved = computed(() => resolveWlIconName(props.name));
const inner = computed(() => resolved.value ? WL_ICONS[resolved.value] : undefined);
// The catalog is validated at generation; only escaped text is added at runtime.
const markup = computed(() => {
  const escaped = props.title?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (escaped ? `<title>${escaped}</title>` : "") + (inner.value ?? "");
});
</script>

<template>
  <component
    :is="custom"
    v-if="custom"
    class="wl-icon"
    :width="px"
    :height="px"
    :aria-hidden="title ? undefined : true"
    :role="title ? 'img' : undefined"
    :aria-label="title"
    data-wl="icon"
    :data-icon="name"
    :data-size="size"
  />
  <svg
    v-else-if="inner"
    class="wl-icon"
    :width="px"
    :height="px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="title ? undefined : true"
    :role="title ? 'img' : undefined"
    :aria-label="title"
    data-wl="icon"
    :data-size="size"
    :data-icon="resolved"
    v-html="markup"
  />
  <span
    v-else
    class="wl-icon wl-icon--slot"
    :style="{ width: px, height: px }"
    data-wl="icon"
    :data-size="size"
    :role="title ? 'img' : undefined"
    :aria-label="title"
  ><slot></slot></span>
</template>
