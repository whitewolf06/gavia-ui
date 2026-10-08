<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";
import type { WlButtonVariant, WlDensity, WlSize } from "../types";

const props = withDefaults(
  defineProps<{
    variant?: WlButtonVariant;
    size?: WlSize;
    density?: WlDensity;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    type?: "button" | "submit" | "reset";
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
  (e: "click", event: MouseEvent): void;
}>();

const rootClass = computed(() => [
  "wl-btn",
  `wl-btn--${props.variant}`,
  `wl-btn--${props.size}`,
  props.block && "wl-btn--block",
  props.density === "compact" && "is-compact",
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
  <button
    v-bind="section('root')"
    :class="rootClass"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    data-wl="button"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    @click="onClick"
  >
    <span v-if="loading" v-bind="section('loadingIcon')" class="wl-btn__spinner" aria-hidden="true" />
    <slot v-else name="icon" />
    <span v-if="$slots.default" v-bind="section('label')" class="wl-btn__label"><slot /></span>
  </button>
</template>
