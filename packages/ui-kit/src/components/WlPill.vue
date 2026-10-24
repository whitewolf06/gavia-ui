<script setup lang="ts">
/** WlPill public component contract.
 * @since 0.1.0
 * @slot default - Custom text instead of label.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlTone } from "../types";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    /**
     * Semantic status color.
     * @default "neutral"
     */
    tone?: WlTone;
    /**
     * Display a compact status dot.
     * @default true
     */
    dot?: boolean;
    /** Text (when no slot is provided). */
    label?: string;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"pill">;
  }>(),
  {
    tone: "neutral",
    dot: true
  }
);
const tone = computed(() => props.tone);
const legacyVariant = computed(() => ({ neutral: "neutral", accent: "info", info: "info", success: "ok", warning: "warn", danger: "err" })[tone.value]);
const section = useWlPt("pill", computed(() => props.pt));
</script>

<template>
  <span
    v-bind="section('root')"
    class="wl-pill"
    :class="`wl-pill--${legacyVariant}`"
    data-wl="pill"
    :data-variant="legacyVariant"
    :data-tone="tone"
    :data-dot="dot"
  >
    <span
      v-if="dot"
      v-bind="section('dot')"
      class="wl-pill__dot"
      aria-hidden="true"
    ></span>
    <span v-bind="section('label')"><slot>{{ label }}</slot></span>
  </span>
</template>
