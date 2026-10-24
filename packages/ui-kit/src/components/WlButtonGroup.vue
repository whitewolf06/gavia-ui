<script setup lang="ts">
/** WlButtonGroup public component contract.
 * @since 0.1.0
 * @slot default - Group buttons (WlButton / WlIconButton).
 */
import { computed, provide } from "vue";
import type { WlButtonVariant, WlDensity, WlSize } from "../types";
import { buttonGroupKey } from "../utils/buttonGroup";
const props = withDefaults(
  defineProps<{
    /** Group aria-label. */
    ariaLabel?: string;
    /** Size within the component family's documented scale. */
    size?: WlSize;
    /** Visual treatment within this component family. */
    variant?: WlButtonVariant;
    /** Spacing density for this component family. */
    density?: WlDensity;
    /** Join adjacent button borders and corners into one group. */
    attached?: boolean;
  }>(),
  {}
);
provide(buttonGroupKey, computed(() => ({ size: props.size, variant: props.variant, density: props.density })));
</script>

<template>
  <div
    class="wl-btn-group"
    role="group"
    :aria-label="ariaLabel"
    data-wl="button-group"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :data-attached="attached"
  >
    <slot></slot>
  </div>
</template>
