<script setup lang="ts" generic="Value extends string = string">
/** WlSegmented public component contract.
 * @since 0.1.0
 */
import { computed, type PropType, ref, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSegmentedOption, WlSizeSm } from "../types";
import { useWlPt } from "../config";
import { useWlRovingFocus } from "../utils/rovingFocus";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * WlSegmentedOption[] options: { label, value, icon?, disabled? }.
     * @default []
     */
    options?: readonly WlSegmentedOption<Value>[];
    /**
     * Disables the entire control.
     * @default false
     */
    disabled?: boolean;
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
     * Fill the available inline width.
     * @default false
     */
    block?: boolean;
    /**
     * Layout direction and applicable arrow-key navigation direction.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"selectbutton">;
  }>(),
  {
    options: () => [],
    disabled: false,
    size: "md", density: "default", block: false, orientation: "horizontal"
  }
);

// Vue validates the string runtime category; options retain the narrower key union in TypeScript.
/** Selected option value, or null when no option is selected.
 * Paired with update:modelValue.
 * @default null
 */
const model = defineModel<NoInfer<Value> | null, never>({ type: String as unknown as PropType<Value | null>, default: null });
const section = useWlPt("selectbutton", computed(() => props.pt));
const root = ref<HTMLElement | null>(null);
const roving = useWlRovingFocus({
  count: () => props.options.length,
  isDisabled: (index) => index < 0 || index >= props.options.length || props.disabled || !!props.options[index]?.disabled,
  orientation: () => props.orientation,
  focus: (index) => root.value?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus()
});
watch(() => [model.value, props.options], () => {
  const index = props.options.findIndex((option) => option.value === model.value && !option.disabled);
  if (index >= 0) roving.active.value = index;
}, { immediate: true });
function choose(option: WlSegmentedOption<Value>): void {
  if (!props.disabled && !option.disabled && model.value !== option.value) model.value = option.value;
}
function onKeydown(event: KeyboardEvent, index: number): void {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  roving.active.value = index;
  roving.onKeydown(event);
  if (event.defaultPrevented && roving.active.value >= 0) choose(props.options[roving.active.value]!);
}
</script>

<template>
  <div
    ref="root"
    v-bind="section('root')"
    class="wl-segmented"
    role="group"
    data-wl="segmented"
    :data-size="size"
    :data-density="density"
    :data-block="block || undefined"
    :data-orientation="orientation"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      v-bind="section('pcToggleButton.root', { active: model === option.value, disabled: Boolean(disabled || option.disabled) })"
      type="button"
      class="wl-segmented__item"
      :class="{ 'is-active': model === option.value }"
      :disabled="disabled || option.disabled"
      :aria-pressed="model === option.value"
      :tabindex="roving.tabIndex(index)"
      @focus="roving.active.value = index"
      @keydown="onKeydown($event, index)"
      @click="choose(option)"
    >
      <span v-bind="section('pcToggleButton.content')" class="wl-segmented__item-content">
        <WlIcon
          v-if="option.icon"
          :name="option.icon"
          :size="15"
          class="wl-segmented__item-icon"
        />
        <span class="wl-segmented__item-label">{{ option.label }}</span>
      </span>
    </button>
  </div>
</template>
