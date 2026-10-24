<script setup lang="ts">
/** WlTag public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot default - Tag text.
 * @slot removeIcon - Custom removeIcon content.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlIconInput, WlSizeSm, WlTone } from "../types";
import { useWlLocale, useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    /**
     * Palette color, independent of semantic tone. Other strings remain native color attributes.
     * @default "gray"
     */
    color?: string;
    /** Semantic color role. */
    tone?: WlTone;
    /** Icon name or supported custom icon descriptor. */
    icon?: WlIconInput;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Show the remove button.
     * @default false
     */
    removable?: boolean;
    /**
     * Remove button aria-label; uses locale.remove when omitted or undefined (English: Remove).
     * @default undefined
     */
    removeLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"tag">;
  }>(),
  {
    color: "gray",
    removable: false,
    size: "md", density: "default", disabled: false
  }
);

const emit = defineEmits<{
  /** Remove button click. */
  (e: "remove", event: MouseEvent): void;
}>();

defineSlots<{
  /** Tag text. */
  default?(props: Record<never, never>): unknown;
  /** Custom icon content. */
  icon?(props: Record<never, never>): unknown;
  /** Custom graphic inside the named removal action. */
  removeIcon?(props: Record<never, never>): unknown;
}>();

const locale = useWlLocale();
const removeLabel = computed(() => props.removeLabel ?? locale.value.remove);

const paletteColors = new Set(["gray", "blue", "green", "amber", "red"]);
const color = computed(() => paletteColors.has(props.color) ? props.color : "gray");
const rootClass = computed(() => ["wl-tag", `wl-tag--${color.value}`]);
const section = useWlPt("tag", computed(() => props.pt));
function remove(event: MouseEvent): void {
  if (!props.disabled) emit("remove", event);
}
</script>

<template>
  <span
    v-bind="section('root')"
    :class="rootClass"
    data-wl="tag"
    :data-variant="color"
    :data-color="color"
    :data-tone="tone"
    :data-size="size"
    :data-density="density"
    :color="props.color"
    :aria-disabled="disabled || undefined"
  >
    <span
      v-if="icon || $slots.icon"
      v-bind="section('icon')"
      class="wl-tag__icon"
      aria-hidden="true"
    ><slot name="icon"><WlIcon :name="icon!" :size="12" /></slot></span>
    <span v-bind="section('label')" class="wl-tag__text"><slot></slot></span>
    <button
      v-if="removable"
      v-bind="section('removeButton')"
      type="button"
      class="wl-tag__remove"
      :aria-label="removeLabel"
      :disabled="disabled"
      @click.stop="remove"
    >
      <slot name="removeIcon"><WlIcon v-bind="section('removeIcon')" name="x" :size="10" /></slot>
    </button>
  </span>
</template>
