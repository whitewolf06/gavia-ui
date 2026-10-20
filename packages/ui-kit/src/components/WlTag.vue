<script setup lang="ts">
/** WlTag public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot default - Tag text.
 * @slot removeIcon - Custom removeIcon content.
 */
import { computed, getCurrentInstance, watchEffect } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlIconInput, WlSizeSm, WlTagVariant, WlTone } from "../types";
import { useWlLocaleText, useWlPt } from "../config";
import { isWlDevelopment } from "../utils/development";
import WlIcon from "./WlIcon.vue";

/** Consumer bundlers replace this literal; no Node type dependency is required. */
declare const process: { env: { NODE_ENV?: string } };
const props = withDefaults(
  defineProps<{
    /**
     * Colour variant.
     * @default "gray"
     */
    variant?: WlTagVariant;
    /** Palette color; other strings preserve the legacy native color attribute. */
    color?: string;
    /** Semantic color role; takes precedence over supported legacy color aliases. */
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
     * Remove button aria-label.
     * @default "Удалить"
     */
    removeLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"tag">;
  }>(),
  {
    variant: "gray",
    removable: false,
    size: "md", density: "default", disabled: false,
    removeLabel: "Удалить"
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

const localeText = useWlLocaleText();

const paletteColors = new Set(["gray", "blue", "green", "amber", "red"]);
const color = computed(() => props.color && paletteColors.has(props.color) ? props.color : props.variant);
const rootClass = computed(() => ["wl-tag", `wl-tag--${color.value}`]);
const section = useWlPt("tag", computed(() => props.pt));
if (isWlDevelopment() && process.env.NODE_ENV !== "production") {
  const instance = getCurrentInstance();
  const warned = new Set<string>();
  watchEffect(() => {
    if (instance?.vnode.props?.variant === undefined || warned.has(props.variant)) return;
    warned.add(props.variant);
    console.warn(`[Gavia UI] WlTag: variant="${props.variant}" is deprecated; use color="${props.variant}" instead.`);
  });
}
function remove(event: MouseEvent): void {
  if (!props.disabled) emit("remove", event);
}
</script>

<template>
  <span
    v-bind="section('root')"
    :class="rootClass"
    data-wl="tag"
    :data-variant="variant"
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
      :aria-label="localeText('removeLabel', removeLabel, 'remove')"
      :disabled="disabled"
      @click.stop="remove"
    >
      <slot name="removeIcon"><WlIcon v-bind="section('removeIcon')" name="x" :size="10" /></slot>
    </button>
  </span>
</template>
