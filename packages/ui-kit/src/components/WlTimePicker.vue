<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import { mergeWlAttrs, useWlPt } from "../config";
import { splitInputAttrs } from "../utils/inputAttrs";
import type { WlDensity, WlSizeSm } from "../types";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  minTime?: string;
  maxTime?: string;
  size?: WlSizeSm;
  density?: WlDensity;
  disabled?: boolean;
  invalid?: boolean;
  pt?: Record<string, unknown>;
}>(), { size: "md", density: "default", disabled: false, invalid: false });
/** A local wall-clock time, without a date, seconds or timezone. */
const model = defineModel<string | null>({ default: null });
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("timepicker", computed(() => props.pt));
const min = computed(() => props.minTime ?? (typeof attrGroups.value.inputAttrs.min === "string" ? attrGroups.value.inputAttrs.min : undefined));
const max = computed(() => props.maxTime ?? (typeof attrGroups.value.inputAttrs.max === "string" ? attrGroups.value.inputAttrs.max : undefined));
const control = ref<HTMLInputElement | null>(null);
const draft = ref("");
function isTime(value: string): boolean { return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value); }
function allowed(value: string): boolean {
  if (!isTime(value)) return false;
  const lower = min.value;
  const upper = max.value;
  // Match the native time input's wrap-around range (for example 22:00–02:00).
  if (lower && upper && lower > upper) return value >= lower || value <= upper;
  return (!lower || value >= lower) && (!upper || value <= upper);
}
watch(model, (value) => { draft.value = value && isTime(value) ? value : ""; }, { immediate: true });
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (props.disabled || target.readOnly) return;
  draft.value = target.value;
  if (draft.value === "") model.value = null;
  else if (allowed(draft.value)) model.value = draft.value;
}
function commit(): void {
  if (draft.value && !allowed(draft.value)) {
    draft.value = model.value ?? "";
    if (control.value) control.value.value = draft.value;
  }
}
</script>

<template>
  <div v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))" class="wl-time-picker wl-input-wrap"
    data-wl="time-picker" :data-size="size" :data-density="density">
    <input ref="control" v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'))"
      type="time" :value="draft" :min="min" :max="max" :step="60" :disabled="disabled"
      class="wl-input" :class="[`wl-input--${size}`, { 'is-invalid': invalid, 'is-compact': density === 'compact' }]"
      :aria-invalid="invalid || undefined" @input="onInput" @blur="commit" @keydown.enter="commit" />
  </div>
</template>
