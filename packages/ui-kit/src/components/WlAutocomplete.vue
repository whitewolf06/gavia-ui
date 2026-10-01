<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import { splitInputAttrs } from "../utils/inputAttrs";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { optionLabel as resolveOptionLabel, useListNavigation } from "../utils/options";

defineOptions({ inheritAttrs: false });
export interface WlAutocompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
const props = withDefaults(defineProps<{
  suggestions?: unknown[];
  optionLabel?: string | ((option: any) => string);
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: WlSizeSm;
  density?: WlDensity;
  multiple?: boolean;
  dropdown?: boolean;
  dropdownLabel?: string;
  minLength?: number;
  motion?: boolean;
  pt?: Record<string, unknown>;
}>(), {
  suggestions: () => [], invalid: false, disabled: false, size: "md", density: "default",
  multiple: false, dropdown: false, dropdownLabel: "Показать варианты", minLength: 1,
  motion: undefined
});
const emit = defineEmits<{ complete: [event: WlAutocompleteCompleteEvent] }>();
const model = defineModel<unknown>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("autocomplete", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const control = ref<HTMLInputElement | null>(null);
const query = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;
const { visible, panel, style, show, hide } = useAnchoredOverlay();
const selected = computed<unknown[]>(() => Array.isArray(model.value) ? model.value : []);
watch(() => model.value, (value) => {
  if (!props.multiple && value !== undefined && value !== null) query.value = resolveOptionLabel(value, props.optionLabel);
}, { immediate: true });
function complete(event: Event): void {
  if (timer) clearTimeout(timer);
  if (query.value.length < props.minLength) { hide(); return; }
  timer = setTimeout(() => emit("complete", { originalEvent: event, query: query.value }), 300);
  if (control.value) show(event);
}
function choose(index: number): void {
  const option = props.suggestions[index];
  if (option === undefined) return;
  if (props.multiple) {
    model.value = [...selected.value, option];
    query.value = "";
  } else {
    model.value = option;
    query.value = resolveOptionLabel(option, props.optionLabel);
  }
  hide();
  nextTick(() => control.value?.focus());
}
function remove(index: number): void {
  model.value = selected.value.filter((_, itemIndex) => itemIndex !== index);
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
    :class="[`wl-autocomplete--${size}`, { 'is-invalid': invalid, 'is-disabled': disabled, 'is-compact': density === 'compact' }]"
    data-wl="autocomplete" :data-size="size" :data-density="density">
    <div v-if="multiple" v-bind="section('inputMultiple')" class="wl-autocomplete__multiple">
      <span v-for="(item, index) in selected" :key="index"
        v-bind="mergeWlAttrs(section('chipItem'), section('pcChip.root'))" class="wl-multiselect__chip">
        <span v-bind="section('pcChip.label')" class="wl-multiselect__chip-label">{{ resolveOptionLabel(item, props.optionLabel) }}</span>
        <button v-bind="section('pcChip.removeIcon')" type="button" class="wl-multiselect__chip-remove" :aria-label="`Удалить ${resolveOptionLabel(item, props.optionLabel)}`"
          @click="remove(index)">×</button>
      </span>
      <input ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'), section('inputChip'))" v-model="query"
        class="wl-autocomplete__inner-input" :placeholder="placeholder" :disabled="disabled"
        :aria-invalid="invalid || undefined" role="combobox" :aria-expanded="visible"
        @input="complete($event)" @keydown="onKeydown" />
    </div>
    <input v-else ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('pcInputText.root'))" v-model="query"
      class="wl-input" :class="[`wl-input--${size}`, { 'is-invalid': invalid }]" :placeholder="placeholder" :disabled="disabled"
      :aria-invalid="invalid || undefined" role="combobox" :aria-expanded="visible"
      @input="model = query; complete($event)" @keydown="onKeydown" />
    <button v-if="dropdown" v-bind="section('dropdown')" type="button"
      class="wl-autocomplete__dropdown" :aria-label="dropdownLabel" :disabled="disabled" @click="open">
      <span v-bind="section('dropdownIcon')" class="wl-autocomplete__dropdown-icon">⌄</span>
    </button>
  </div>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="section('overlay')" class="wl-overlay wl-autocomplete-overlay" :style="style">
      <div v-bind="section('listContainer')" class="wl-select__list-container">
        <div v-bind="section('list')" class="wl-select__list" role="listbox">
          <div v-for="(option, index) in suggestions" :key="index" v-bind="section('option', { focused: active === index })"
            class="wl-select__option" :data-active="active === index" role="option" @pointerdown.prevent @click="choose(index)">
            {{ resolveOptionLabel(option, props.optionLabel) }}
          </div>
          <div v-if="suggestions.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">Нет вариантов</div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
