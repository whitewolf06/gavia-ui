<script setup lang="ts">
/** WlSkeleton public component contract.
 * @since 0.1.0
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    /** Width (CSS). */
    width?: string;
    /** Height (CSS). */
    height?: string;
    /** Radius (CSS). */
    borderRadius?: string;
    /**
     * Shape.
     * @default "rectangle"
     */
    shape?: "rectangle" | "circle";
    /** Apply the text or avatar skeleton presentation. */
    preset?: "text" | "avatar";
    /**
     * Number of placeholder lines in the text preset.
     * @default 1
     */
    lines?: number;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"skeleton">;
  }>(),
  {
    shape: "rectangle",
    lines: 1
  }
);
const section = useWlPt("skeleton", computed(() => props.pt));
const lineCount = computed(() => Number.isFinite(props.lines) ? Math.min(100, Math.max(1, Math.floor(props.lines))) : 1);
const multiline = computed(() => props.preset === "text" && lineCount.value > 1);
const width = computed(() => props.width ?? (props.preset === "avatar" ? "40px" : "100%"));
const height = computed(() => props.height ?? (props.preset === "avatar" ? "40px" : "12px"));
const borderRadius = computed(() => props.shape === "circle" ? "50%" : props.borderRadius ?? (props.preset === "avatar" ? "50%" : undefined));
</script>

<template>
  <span
    v-bind="section('root')"
    :class="multiline ? 'wl-skeleton-text' : 'wl-skeleton'"
    aria-hidden="true"
    data-wl="skeleton"
    :data-preset="preset"
    :style="{ width, height: multiline ? undefined : height, borderRadius }"
  >
    <span
      v-for="index in multiline ? lineCount : 0"
      :key="index"
      v-bind="section('line')"
      class="wl-skeleton wl-skeleton__line"
      :style="{ height, width: index === lineCount ? '60%' : '100%', borderRadius }"
    ></span>
  </span>
</template>
