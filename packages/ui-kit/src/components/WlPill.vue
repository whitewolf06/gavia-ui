<script setup lang="ts">
/** WlPill public component contract.
 * @since 0.1.0
 * @slot default - Custom text instead of label.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlPillVariant, WlTone } from "../types";
import { useWlPt } from "../config";
import { useWlTone } from "../utils/tone";

const props = withDefaults(
  defineProps<{
    /**
     * Colour variant.
     * @default "neutral"
     */
    variant?: WlPillVariant;
    /** Semantic color role; takes precedence over supported legacy color aliases. */
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
    variant: "neutral",
    dot: true
  }
);
const tone = useWlTone({
  component: "WlPill", tone: () => props.tone, variant: () => props.variant,
  aliases: { neutral: "neutral", info: "info", ok: "success", warn: "warning", err: "danger" }, fallback: "neutral"
});
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
