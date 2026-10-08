<script setup lang="ts" generic="TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined">
import { useWlId } from "../utils/useWlId";
import { computed, nextTick, ref, useAttrs, watch, type Ref } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import type { WlOptionLabel, WlOptionValue, WlOptionValueResolver, WlSelectModel } from "../selection-types";
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
  motion?: boolean;
  pt?: WlPt<"select">;
}>(), { options: () => [], invalid: false, disabled: false, size: "md", density: "default", motion: undefined });
// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
const model: Ref<WlSelectModel<TOption, TResolver> | undefined> = defineModel<WlSelectModel<NoInfer<TOption>, NoInfer<TResolver>>, never>({ default: undefined as never });
// These controls render their own labels and options; user slots are not implemented.
defineSlots<{}>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const root = ref<HTMLElement | null>(null);
const section = useWlPt("select", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-select-list-${useWlId()}`;
const listAttrs = computed(() => {
  const control = getWlControlProps(mergeWlAttrs(attrGroups.value.inputAttrs, section("root")));
  return mergeWlAttrs({ id: generatedListId, "aria-label": control.ariaLabel ?? props.placeholder ?? "Варианты", "aria-labelledby": control.ariaLabelledby }, section("list"));
});
const { visible, panel, style, show, hide } = useAnchoredOverlay();
watch(() => props.disabled, (disabled) => { if (disabled) hide(); });
function valueOf(option: TOption): WlOptionValue<TOption, TResolver> {
  return resolveOptionValue(option, props.optionValue as TResolver);
}
const selected = computed(() => props.options.find((option) => Object.is(valueOf(option), model.value)));
const display = computed(() => selected.value === undefined ? props.placeholder ?? "" : resolveOptionLabel(selected.value, props.optionLabel));
function choose(index: number): void {
  if (props.disabled || index < 0 || index >= props.options.length) return;
  model.value = valueOf(props.options[index] as TOption);
  hide();
  nextTick(() => root.value?.focus());
}
const { active, onKeydown: navigate } = useListNavigation(() => props.options.length, choose, hide);
function open(event: Event): void {
  if (props.disabled) return;
  active.value = Math.max(0, props.options.findIndex((option) => Object.is(valueOf(option), model.value)));
  show(event);
}
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    open(event);
    return;
  }
  navigate(event);
}
</script>

<template>
  <div ref="root" v-bind="mergeWlAttrs(attrGroups.rootAttrs, attrGroups.inputAttrs, section('root'))"
    class="wl-select" :class="[`wl-select--${size}`, { 'is-invalid': invalid, 'is-disabled': disabled, 'is-compact': density === 'compact' }]"
    role="combobox" :tabindex="disabled ? -1 : 0" :aria-expanded="visible" aria-haspopup="listbox"
    :aria-invalid="invalid || undefined" :aria-disabled="disabled || undefined" :aria-controls="visible ? String(listAttrs.id) : undefined"
    data-wl="select" :data-size="size" :data-density="density"
    @click="open" @keydown="onKeydown">
    <span v-bind="section('label')" class="wl-select__label" :data-placeholder="selected === undefined || undefined">{{ display }}</span>
    <span v-bind="section('dropdown')" class="wl-select__dropdown" aria-hidden="true">
      <WlIcon v-bind="section('dropdownIcon')" class="wl-select__dropdown-icon" name="chevron-down" :size="14" />
    </span>
    <input v-if="attrGroups.inputAttrs.name" type="hidden" :name="String(attrGroups.inputAttrs.name)" :value="model == null ? '' : String(model)" />
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="section('overlay')" class="wl-overlay wl-select-overlay" :style="style">
      <div v-bind="section('listContainer')" class="wl-select__list-container">
        <div v-bind="listAttrs" class="wl-select__list" role="listbox">
          <div v-for="(option, index) in options" :key="index" v-bind="section('option', { focused: active === index, selected: Object.is(valueOf(option), model) })"
            class="wl-select__option" role="option" :aria-selected="Object.is(valueOf(option), model)"
            :data-active="active === index" :data-selected="Object.is(valueOf(option), model)"
            @mousedown.prevent="choose(index)" @click="choose(index)">
            <span v-bind="section('optionLabel')" class="wl-select__option-label">{{ resolveOptionLabel(option, props.optionLabel) }}</span>
          </div>
          <div v-if="options.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">Нет вариантов</div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
