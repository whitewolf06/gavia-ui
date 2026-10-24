<script setup lang="ts">
/** WlDivider public component contract.
 * @since 0.1.0
 * @slot default - Text or other content centred on the line.
 */
import { computed, useSlots } from "vue";
import type { WlPt } from "../pt-types";
import { useWlPt } from "../config";

const props = defineProps<{
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"divider">;
  /** Layout direction and applicable arrow-key navigation direction. */
  orientation?: "horizontal" | "vertical";
}>();

const slots = useSlots();

const rootClass = computed(() => {
  const classes = ["wl-divider"];
  if (!slots.default) classes.push("wl-divider--plain");
  if (props.orientation === "vertical") classes.push("wl-divider--vertical");
  return classes;
});
const section = useWlPt("divider", computed(() => props.pt));
</script>

<template>
  <div
    v-bind="section('root')"
    :class="rootClass"
    role="separator"
    :aria-orientation="orientation ?? 'horizontal'"
    :data-orientation="orientation ?? 'horizontal'"
    data-wl="divider"
  >
    <span v-if="$slots.default" v-bind="section('content')"><slot></slot></span>
  </div>
</template>
