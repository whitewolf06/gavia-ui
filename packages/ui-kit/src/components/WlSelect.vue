<script setup lang="ts">
import { computed, nextTick, ref, useAttrs } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { optionLabel as resolveOptionLabel, optionValue as resolveOptionValue, useListNavigation } from "../utils/options";

import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  options?: unknown[];
  optionLabel?: string | ((option: any) => string);
  optionValue?: string | ((option: any) => any);
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: WlSizeSm;
  density?: WlDensity;
  motion?: boolean;
  pt?: Record<string, unknown>;
}>(), { options: () => [], invalid: false, disabled: false, size: "md", density: "default", motion: undefined });
const model = defineModel<unknown>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const root = ref<HTMLElement | null>(null);
const section = useWlPt("select", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const { visible, panel, style, show, hide } = useAnchoredOverlay();
const selected = computed(() => props.options.find((option) => Object.is(resolveOptionValue(option, props.optionValue), model.value)));
const display = computed(() => selected.value === undefined ? props.placeholder ?? "" : resolveOptionLabel(selected.value, props.optionLabel));
function choose(index: number): void {
  if (index < 0 || index >= props.options.length) return;
  model.value = resolveOptionValue(props.options[index], props.optionValue);
  hide();
  nextTick(() => root.value?.focus());
}
const { active, onKeydown: navigate } = useListNavigation(() => props.options.length, choose, hide);
function open(event: Event): void {
  if (props.disabled) return;
  active.value = Math.max(0, props.options.findIndex((option) => Object.is(resolveOptionValue(option, props.optionValue), model.value)));
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
    :aria-invalid="invalid || undefined" :aria-disabled="disabled || undefined"
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
        <div v-bind="section('list')" class="wl-select__list" role="listbox">
          <div v-for="(option, index) in options" :key="index" v-bind="section('option', { focused: active === index, selected: Object.is(resolveOptionValue(option, props.optionValue), model) })"
            class="wl-select__option" role="option" :aria-selected="Object.is(resolveOptionValue(option, props.optionValue), model)"
            :data-active="active === index" :data-selected="Object.is(resolveOptionValue(option, props.optionValue), model)"
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
