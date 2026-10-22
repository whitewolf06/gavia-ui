<script setup lang="ts">
/** WlButton public component contract.
 * @since 0.1.0
 * @slot icon - Leading icon (hidden while loading).
 * @slot default - Text or other button content.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlButtonVariant, WlDensity, WlSize, WlTone } from "../types";
import { useWlPt } from "../config";
import { useWlButtonGroupDefaults } from "../utils/buttonGroup";
import WlLink from "./WlLink.vue";

const props = withDefaults(
  defineProps<{
    /** Visual treatment; inherits an enclosing WlButtonGroup when omitted.
     * @default "secondary"
     */
    variant?: WlButtonVariant;
    /** Semantic color, independent of the visual treatment. */
    tone?: WlTone;
    /** Control size; inherits an enclosing WlButtonGroup when omitted.
     * @default "md"
     */
    size?: WlSize;
    /** Spacing density; inherits an enclosing WlButtonGroup when omitted.
     * @default "default"
     */
    density?: WlDensity;
    /** Display a spinner and prevent activation.
     * @default false
     */
    loading?: boolean;
    /** Prevent pointer and keyboard activation.
     * @default false
     */
    disabled?: boolean;
    /** Fill the available inline width.
     * @default false
     */
    block?: boolean;
    /** Native button type; applies when rendering a button.
     * @default "button"
     */
    type?: "button" | "submit" | "reset";
    /** Render a link explicitly; href or to also selects link rendering. */
    as?: "button" | "a";
    /** Link destination, forwarded to WlLink. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /** Place the icon before or after the default slot.
     * @default "start"
     */
    iconPosition?: "start" | "end";
    /** Attributes for the root, label and loadingIcon pass-through sections. */
    pt?: WlPt<"button">;
  }>(),
  {
    variant: "secondary",
    size: "md",
    density: "default",
    loading: false,
    disabled: false,
    block: false,
    type: "button"
  }
);

const emit = defineEmits<{
  /** Emitted on activation when neither disabled nor loading. */
  (e: "click", event: MouseEvent): void;
}>();
const groupDefaults = useWlButtonGroupDefaults(props);
const isLink = computed(() => props.as === "a" || props.href !== undefined || props.to !== undefined);
const tone = computed(() => props.tone ?? (["primary", "soft", "link"].includes(groupDefaults.value.variant) ? "accent" : "neutral"));
const visualVariant = computed(() => {
  const variant = groupDefaults.value.variant;
  if (tone.value === "danger") {
    if (variant === "primary") return "danger";
    return variant === "soft" ? "soft-danger" : "danger-quiet";
  }
  return variant;
});

const rootClass = computed(() => [
  "wl-btn",
  `wl-btn--${visualVariant.value}`,
  `wl-btn--${groupDefaults.value.size}`,
  props.block && "wl-btn--block",
  groupDefaults.value.density === "compact" && "is-compact",
  props.loading && "is-loading",
  props.disabled && "is-disabled"
]);
const section = useWlPt("button", computed(() => props.pt));

function onClick(event: MouseEvent): void {
  if (props.disabled || props.loading) return;
  // Safari does not focus buttons on pointer activation. Establish the opener
  // before consumers show an overlay so its normal focus restoration works.
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true });
  emit("click", event);
}
</script>

<template>
  <component
    :is="isLink ? WlLink : 'button'"
    v-bind="section('root')"
    :class="rootClass"
    :type="isLink ? undefined : type"
    :href="href"
    :to="to"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    data-wl="button"
    :data-variant="groupDefaults.variant"
    :data-tone="tone"
    :data-size="groupDefaults.size"
    :data-density="groupDefaults.density"
    @click="onClick"
  >
    <span
      v-if="loading"
      v-bind="section('loadingIcon')"
      class="wl-btn__spinner"
      aria-hidden="true"
    ></span>
    <slot v-else-if="iconPosition !== 'end'" name="icon"></slot>
    <span v-if="$slots.default" v-bind="section('label')" class="wl-btn__label"><slot></slot></span>
    <slot v-if="!loading && iconPosition === 'end'" name="icon"></slot>
  </component>
</template>
