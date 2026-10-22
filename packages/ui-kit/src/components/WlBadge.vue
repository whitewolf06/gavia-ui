<script setup lang="ts">
/** WlBadge public component contract.
 * @since 0.1.0
 * @slot default - Default component content.
 */
import { type AriaAttributes, computed, useAttrs } from "vue";
import type { WlPt } from "../pt-types";
import type { WlTone } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";
import { formatWlCount } from "../utils/format";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /** Text or count shown when dot is false. */
    value?: string | number;
    /** Semantic badge color.
     * @default "accent"
     */
    tone?: WlTone;
    /** Display numeric values above this limit as a capped count. */
    max?: number;
    /** Accessible label; required for a meaningful dot indicator. */
    ariaLabel?: string;
    /** Show a dot instead of the value; unlabeled dots are decorative.
     * @default false
     */
    dot?: boolean;
    /** Attributes for the badge root section. */
    pt?: WlPt<"badge">;
  }>(),
  {
    tone: "accent",
    dot: false
  }
);

defineSlots<{
  /** Custom badge content with the original and displayed values. */
  default?(props: { value: string | number | undefined; displayValue: string | number | undefined }): unknown; }>();
const tone = computed(() => props.tone);
const legacyVariant = computed(() => ({ neutral: "gray", accent: "accent", info: "accent", success: "success", warning: "warn", danger: "danger" })[tone.value]);
const displayValue = computed(() => typeof props.value === "number" && props.max !== undefined
  ? formatWlCount(props.value, { max: props.max })
  : props.value);

const rootClass = computed(() => [
  "wl-badge",
  `wl-badge--${legacyVariant.value}`,
  props.dot && "wl-badge--dot"
]);
const section = useWlPt("badge", computed(() => props.pt));
const attrs = useAttrs();
const rootAttrs = computed(() => {
  void attrs.id;
  return mergeWlAttrs(attrs, section("root"));
});
const accessibleLabel = computed(() => props.ariaLabel ?? (typeof rootAttrs.value["aria-label"] === "string" ? rootAttrs.value["aria-label"] : undefined));
const named = computed(() => Boolean(accessibleLabel.value?.trim()
  || (typeof rootAttrs.value["aria-labelledby"] === "string" && rootAttrs.value["aria-labelledby"].trim())));
const role = computed(() => typeof rootAttrs.value.role === "string" ? rootAttrs.value.role : props.dot && named.value ? "img" : undefined);
const hidden = computed(() => props.dot && !named.value ? true : rootAttrs.value["aria-hidden"] as AriaAttributes["aria-hidden"]);
</script>

<template>
  <span
    v-bind="rootAttrs"
    :class="rootClass"
    data-wl="badge"
    :data-variant="legacyVariant"
    :data-tone="tone"
    :aria-label="accessibleLabel"
    :role="role"
    :aria-hidden="hidden"
  >
    <slot v-if="!dot" :value="value" :display-value="displayValue">{{ displayValue }}</slot>
  </span>
</template>
