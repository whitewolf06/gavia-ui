<script setup lang="ts">
/** WlProgress public component contract.
 * @since 0.1.0
 */
import { computed, useAttrs } from "vue";
import type { WlPt } from "../pt-types";
import type { WlTone } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /** Current value, clamped to the range from zero to max.
     * @default 0
     */
    value?: number;
    /** Semantic progress color.
     * @default "accent"
     */
    tone?: WlTone;
    /** Positive finite upper bound; invalid values fall back to 100.
     * @default 100
     */
    max?: number;
    /** Show activity without exposing a known current value.
     * @default false
     */
    indeterminate?: boolean;
    /** Accessible name when no external label is referenced. */
    ariaLabel?: string;
    /** ID of the element naming this progress indicator. */
    ariaLabelledby?: string;
    /** Use the thin track treatment.
     * @default false
     */
    thin?: boolean;
    /** Display the percentage for determinate progress.
     * @default false
     */
    showValue?: boolean;
    /** Attributes for the root, value and label sections. */
    pt?: WlPt<"progress">;
  }>(),
  {
    value: 0,
    tone: "accent",
    thin: false,
    showValue: false
  }
);
defineSlots<{}>();
const tone = computed(() => props.tone);
const rootClass = computed(() => [
  "wl-progress",
  tone.value === "success" ? "wl-progress--ok" : "wl-progress--default",
  props.thin && "wl-progress--thin"
]);
const section = useWlPt("progress", computed(() => props.pt));
const attrs = useAttrs();
const rootAttrs = computed(() => {
  void attrs.id; // Track additions to Vue 3.4's initially empty attrs proxy.
  return mergeWlAttrs(attrs, section("root"));
});
const accessibleLabel = computed(() => props.ariaLabel ?? (typeof rootAttrs.value["aria-label"] === "string" ? rootAttrs.value["aria-label"] : undefined));
const accessibleLabelledby = computed(() => props.ariaLabelledby ?? (typeof rootAttrs.value["aria-labelledby"] === "string" ? rootAttrs.value["aria-labelledby"] : undefined));
const maximum = computed(() => props.max !== undefined && Number.isFinite(props.max) && props.max > 0 ? props.max : 100);
const value = computed(() => Number.isFinite(props.value) ? Math.max(0, Math.min(maximum.value, props.value)) : 0);
const percent = computed(() => value.value / maximum.value * 100);
const accessibleValue = computed(() => typeof rootAttrs.value["aria-valuetext"] === "string"
  ? rootAttrs.value["aria-valuetext"]
  : props.showValue && !props.indeterminate ? `${percent.value}%` : undefined);
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="rootClass"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : value"
    aria-valuemin="0"
    :aria-valuemax="maximum"
    :aria-label="accessibleLabel"
    :aria-labelledby="accessibleLabelledby"
    :aria-valuetext="accessibleValue"
    data-wl="progress"
    :data-variant="tone === 'success' ? 'ok' : 'default'"
    :data-tone="tone"
    :data-indeterminate="indeterminate || undefined"
  >
    <div v-bind="section('value')" class="wl-progress__value" :style="indeterminate ? undefined : { width: percent + '%' }"></div>
    <span v-if="showValue && !indeterminate" v-bind="section('label')" class="wl-progress__label">{{ percent }}%</span>
  </div>
</template>
