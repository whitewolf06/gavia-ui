<script setup lang="ts" generic="TOption = unknown, TMultiple extends boolean = false">
import { formatWlLocaleText } from "../locale";
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { useWlId } from "../utils/useWlId";
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch, type Ref } from "vue";
import Teleport from "../utils/templateTeleport.vue";
import Transition from "../utils/templateTransition.vue";
import { mergeWlAttrs, useWlMotion, useWlPt, useWlLocale, useWlLocaleText } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import type { WlAutocompleteCompleteEvent, WlAutocompleteModel, WlAutocompleteOptionLabel } from "../selection-types";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { optionLabel as resolveOptionLabel, useListNavigation } from "../utils/options";

import WlIcon from "./WlIcon.vue";
const localeText = useWlLocaleText();
const locale = useWlLocale();

defineOptions({ inheritAttrs: false });
// Read props.* in the template; Volar 2.x cannot reliably project this generic Boolean default into its generated instance.
const props = withDefaults(defineProps<{
  modelModifiers?: WlNoModelModifiers;
  suggestions?: readonly TOption[];
  optionLabel?: WlAutocompleteOptionLabel<NoInfer<TOption>, NoInfer<TMultiple>>;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: WlSizeSm;
  density?: WlDensity;
  // The boolean intersection also preserves Vue's runtime casting of `multiple`.
  multiple?: TMultiple & boolean;
  dropdown?: boolean;
  dropdownLabel?: string;
  minLength?: number;
  motion?: boolean;
  pt?: WlPt<"autocomplete">;
}>(), {
  suggestions: () => [], invalid: false, disabled: false, size: "md", density: "default",
  multiple: () => false as TMultiple, dropdown: false, dropdownLabel: "Показать варианты", minLength: 1,
  motion: undefined
});
const emit = defineEmits<{ complete: [event: WlAutocompleteCompleteEvent] }>();
// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
const model: Ref<WlAutocompleteModel<TOption, TMultiple> | undefined> = defineModel<WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>, never>({ default: undefined as never });
defineSlots<{}>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("autocomplete", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-autocomplete-list-${useWlId()}`;
const listAttrs = computed(() => {
  const inputAttrs = props.multiple
    ? mergeWlAttrs(attrGroups.value.inputAttrs, section("input"), section("inputChip"))
    : mergeWlAttrs(attrGroups.value.inputAttrs, section("pcInputText.root"));
  const control = getWlControlProps(inputAttrs);
  return mergeWlAttrs({ id: generatedListId, "aria-label": control.ariaLabel ?? props.placeholder ?? locale.value.options, "aria-labelledby": control.ariaLabelledby }, section("list"));
});
const control = ref<HTMLInputElement | null>(null);
const query = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;
const { visible, panel, style, show, hide } = useAnchoredOverlay();
watch(() => props.disabled, (disabled) => {
  if (!disabled) return;
  hide();
  if (timer) clearTimeout(timer);
});
const selected = computed<TOption[]>(() => Array.isArray(model.value) ? model.value as TOption[] : []);
watch(() => model.value, (value) => {
  if (props.multiple) return;
  if (value === undefined || value === null) {
    query.value = "";
    return;
  }
  // A runtime mode check cannot narrow a conditional generic. In single mode
  // both the model and its label callback include user-entered strings.
  query.value = typeof value === "string" && typeof props.optionLabel === "string" ? value
    : resolveOptionLabel(value as TOption | string,
      props.optionLabel as string | ((option: TOption | string) => string) | undefined);
}, { immediate: true });
function complete(event: Event): void {
  if (props.disabled) return;
  if (timer) clearTimeout(timer);
  if (query.value.length < props.minLength) { hide(); return; }
  timer = setTimeout(() => emit("complete", { originalEvent: event, query: query.value }), 300);
  if (control.value) show(event);
}
function choose(index: number): void {
  if (props.disabled) return;
  const option = props.suggestions[index];
  if (option === undefined) return;
  if (props.multiple) {
    model.value = [...selected.value, option] as WlAutocompleteModel<TOption, TMultiple>;
    query.value = "";
  } else {
    model.value = option as WlAutocompleteModel<TOption, TMultiple>;
    query.value = resolveOptionLabel(option, props.optionLabel);
  }
  hide();
  nextTick(() => control.value?.focus());
}
function remove(index: number): void {
  if (props.disabled) return;
  model.value = selected.value.filter((_, itemIndex) => itemIndex !== index) as WlAutocompleteModel<TOption, TMultiple>;
}
function onInput(event: Event): void {
  if (props.disabled) return;
  model.value = query.value as WlAutocompleteModel<TOption, TMultiple>;
  complete(event);
}
const { active, onKeydown: navigate } = useListNavigation(() => props.suggestions.length, choose, hide);
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && event.key === "ArrowDown") { show(event); return; }
  navigate(event);
}
function open(event: Event): void {
  if (!props.disabled) show(event);
}
onBeforeUnmount(() => { if (timer) clearTimeout(timer); });
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))" class="wl-autocomplete"
    :class="[`wl-autocomplete--${props.size}`, { 'is-invalid': props.invalid, 'is-disabled': props.disabled, 'is-compact': props.density === 'compact' }]"
    data-wl="autocomplete" :data-size="props.size" :data-density="props.density">
    <div v-if="props.multiple" v-bind="section('inputMultiple')" class="wl-autocomplete__multiple">
      <span v-for="(item, index) in selected" :key="index"
        v-bind="mergeWlAttrs(section('chipItem'), section('pcChip.root'))" class="wl-multiselect__chip">
        <span v-bind="section('pcChip.label')" class="wl-multiselect__chip-label">{{ resolveOptionLabel(item, props.optionLabel) }}</span>
        <button v-bind="section('pcChip.removeIcon')" type="button" class="wl-multiselect__chip-remove" :aria-label="formatWlLocaleText(locale.removeItem, { label: resolveOptionLabel(item, props.optionLabel) })"
          :disabled="props.disabled"
          @click="remove(index)">×</button>
      </span>
      <input ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'), section('inputChip'))" v-model="query"
        class="wl-autocomplete__inner-input" :placeholder="props.placeholder" :disabled="props.disabled"
        :aria-invalid="props.invalid || undefined" role="combobox" :aria-expanded="visible" :aria-controls="visible ? String(listAttrs.id) : undefined"
        @input="complete($event)" @keydown="onKeydown" />
    </div>
    <input v-else ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('pcInputText.root'))" v-model="query"
      class="wl-input" :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid }]" :placeholder="props.placeholder" :disabled="props.disabled"
      :aria-invalid="props.invalid || undefined" role="combobox" :aria-expanded="visible" :aria-controls="visible ? String(listAttrs.id) : undefined"
      @input="onInput" @keydown="onKeydown" />
    <button v-if="props.dropdown" v-bind="section('dropdown')" type="button"
      class="wl-autocomplete__dropdown" :aria-label="localeText('dropdownLabel', props.dropdownLabel, 'showOptions')" :disabled="props.disabled" @click="open">
      <WlIcon v-bind="section('dropdownIcon')" class="wl-autocomplete__dropdown-icon" name="chevron-down" :size="14" />
    </button>
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="section('overlay')" class="wl-overlay wl-autocomplete-overlay" :style="style">
      <div v-bind="section('listContainer')" class="wl-select__list-container">
        <div v-bind="listAttrs" class="wl-select__list" role="listbox">
          <div v-for="(option, index) in props.suggestions" :key="index" v-bind="section('option', { focused: active === index })"
            class="wl-select__option" :data-active="active === index" role="option" @pointerdown.prevent @click="choose(index)">
            {{ resolveOptionLabel(option, props.optionLabel) }}
          </div>
          <div v-if="props.suggestions.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">{{ locale.noOptions }}</div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
