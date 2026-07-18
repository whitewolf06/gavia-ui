<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
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
    pt?: Record<string, unknown>;
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

function onClick(event: MouseEvent): void {
  if (props.disabled || props.loading) return;
  emit("click", event);
}
</script>

<template>
  <Button
    :class="rootClass"
    :type="type"
    :disabled="disabled || loading"
    :pt="pt"
    data-wl="button"
    :data-variant="variant"
    :data-size="size"
    @click="onClick"
  >
    <span v-if="loading" class="wl-btn__spinner" aria-hidden="true" />
    <slot v-else name="icon" />
    <span v-if="$slots.default" class="wl-btn__label"><slot /></span>
  </Button>
</template>
