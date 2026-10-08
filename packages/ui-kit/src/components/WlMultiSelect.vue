<script setup lang="ts" generic="TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined">
import { useWlId } from "../utils/useWlId";
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import type { WlDensity, WlMultiSelectDisplay, WlSizeSm } from "../types";
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import type { WlMultiSelectModel, WlOptionLabel, WlOptionValue, WlOptionValueResolver } from "../selection-types";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { optionLabel as resolveOptionLabel, optionValue as resolveOptionValue, useListNavigation } from "../utils/options";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  modelModifiers?: WlNoModelModifiers;
  options?: readonly TOption[];
  optionLabel?: WlOptionLabel<NoInfer<TOption>>;
  optionValue?: TResolver;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: WlSizeSm;
  density?: WlDensity;
  filter?: boolean;
  display?: WlMultiSelectDisplay;
  maxSelectedLabels?: number;
  motion?: boolean;
  pt?: WlPt<"multiselect">;
}>(), {
  options: () => [], invalid: false, disabled: false, size: "md", density: "default",
    filter: false, display: "comma", motion: undefined
});
const model = defineModel<WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>, never>({ default: () => [] });
defineSlots<{}>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const control = ref<HTMLInputElement | null>(null);
const filterInput = ref<HTMLInputElement | null>(null);
const query = ref("");
const section = useWlPt("multiselect", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-multiselect-list-${useWlId()}`;
const listAttrs = computed(() => {
  const control = getWlControlProps(mergeWlAttrs(attrGroups.value.inputAttrs, section("hiddenInput")));
  return mergeWlAttrs({ id: generatedListId, "aria-label": control.ariaLabel ?? props.placeholder ?? "Варианты", "aria-labelledby": control.ariaLabelledby }, section("list"));
});
const { visible, panel, style, show, hide } = useAnchoredOverlay();
watch(() => props.disabled, (disabled) => { if (disabled) hide(); });
function valueOf(option: TOption): WlOptionValue<TOption, TResolver> {
  return resolveOptionValue(option, props.optionValue as TResolver);
}
const selectedOptions = computed(() => props.options.filter((option) => model.value.some((value) => Object.is(valueOf(option), value))));
const filtered = computed(() => props.options.filter((option) => !query.value || resolveOptionLabel(option, props.optionLabel).toLocaleLowerCase().includes(query.value.toLocaleLowerCase())));
const labels = computed(() => selectedOptions.value.map((option) => resolveOptionLabel(option, props.optionLabel)));
const label = computed(() => {
  if (!labels.value.length) return props.placeholder ?? "";
  if (props.maxSelectedLabels !== undefined && labels.value.length > props.maxSelectedLabels) return `${labels.value.length} выбрано`;
  return labels.value.join(", ");
});
function choose(index: number): void {
  if (props.disabled) return;
  const option = filtered.value[index];
  if (option === undefined) return;
  const value = valueOf(option);
  model.value = model.value.some((current) => Object.is(current, value))
    ? model.value.filter((current) => !Object.is(current, value))
    : [...model.value, value];
  nextTick(() => control.value?.focus());
}
function remove(value: WlOptionValue<TOption, TResolver>): void {
  if (props.disabled) return;
  model.value = model.value.filter((current) => !Object.is(current, value));
}
const { active, onKeydown: navigate } = useListNavigation(() => filtered.value.length, choose, hide);
function open(event: Event): void {
  if (props.disabled) return;
  show(event);
  active.value = 0;
  if (props.filter) nextTick(() => filterInput.value?.focus());
}
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && ["ArrowDown", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    open(event);
  } else navigate(event);
}
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-multiselect" :class="[`wl-multiselect--${size}`, { 'is-invalid': invalid, 'is-disabled': disabled, 'is-compact': density === 'compact' }]"
    data-wl="multiselect" :data-size="size" :data-density="density" @click="open">
    <div v-bind="section('labelContainer')" class="wl-multiselect__label-container">
      <div v-if="display === 'chip' && selectedOptions.length" class="wl-multiselect__label">
        <span v-for="option in selectedOptions" :key="String(valueOf(option))"
          v-bind="mergeWlAttrs(section('chipItem'), section('pcChip.root'))" class="wl-multiselect__chip">
          <span v-bind="section('pcChip.label')" class="wl-multiselect__chip-label">{{ resolveOptionLabel(option, props.optionLabel) }}</span>
          <button v-bind="section('pcChip.removeIcon')" type="button" class="wl-multiselect__chip-remove"
            :disabled="disabled"
            :aria-label="`Удалить ${resolveOptionLabel(option, props.optionLabel)}`"
            @click.stop="remove(valueOf(option))">×</button>
        </span>
      </div>
      <span v-else v-bind="section('label')" class="wl-multiselect__label" :data-placeholder="!labels.length || undefined">{{ label }}</span>
      <input ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('hiddenInput'))"
        class="wl-multiselect__focus" type="text" readonly role="combobox"
        :aria-expanded="visible" aria-haspopup="listbox" :aria-invalid="invalid || undefined" :aria-controls="visible ? String(listAttrs.id) : undefined"
        :disabled="disabled" :value="label" @keydown="onKeydown" />
    </div>
    <span v-bind="section('dropdown')" class="wl-multiselect__dropdown" aria-hidden="true">
      <WlIcon v-bind="section('dropdownIcon')" class="wl-multiselect__dropdown-icon" name="chevron-down" :size="14" />
    </span>
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="section('overlay')" class="wl-overlay wl-multiselect-overlay" :style="style">
      <div v-if="filter" v-bind="section('header')" class="wl-multiselect__header">
        <WlIcon v-bind="section('filterIcon')" name="search" :size="14" />
        <input ref="filterInput" v-bind="section('pcFilter.root')" v-model="query"
          class="wl-input wl-input--sm wl-multiselect__filter" type="search" aria-label="Фильтр"
          @keydown="navigate" />
      </div>
      <div v-bind="section('listContainer')" class="wl-select__list-container">
        <div v-bind="listAttrs" class="wl-select__list" role="listbox" aria-multiselectable="true">
          <div v-for="(option, index) in filtered" :key="index" v-bind="section('option', { focused: active === index, selected: model.some((value) => Object.is(value, valueOf(option))) })"
            class="wl-select__option" role="option" :data-active="active === index"
            :aria-selected="model.some((value) => Object.is(value, valueOf(option)))"
            @pointerdown.prevent @click="choose(index)"><span v-bind="section('optionLabel')">{{ resolveOptionLabel(option, props.optionLabel) }}</span></div>
          <div v-if="filtered.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">Нет вариантов</div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
