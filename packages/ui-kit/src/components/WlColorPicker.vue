<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { WlColorPickerSize } from "../types";

/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
const props = withDefaults(
  defineProps<{
    /** v-model — hex color, always emitted normalized as lowercase #rrggbb. */
    modelValue?: string;
    swatches?: readonly string[];
    size?: WlColorPickerSize;
    disabled?: boolean;
    invalid?: boolean;
    paletteLabel?: string;
    inputLabel?: string;
  }>(),
  {
    modelValue: "",
    swatches: () => [
      "#2563eb",
      "#2e9e68",
      "#bf8615",
      "#d2494f",
      "#f7f7f8",
      "#e7e7ea",
      "#dcdce1",
      "#b9bdc6",
      "#9aa0aa",
      "#5d626c",
      "#43474f",
      "#22252b"
    ],
    size: "md",
    disabled: false,
    invalid: false,
    paletteLabel: "Палитра",
    inputLabel: "HEX-код цвета"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

/** "#rgb" / "#rrggbb" (any case) → lowercase "#rrggbb", or null when invalid. */
function normalizeHex(raw: string): string | null {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(raw.trim());
  if (!m) return null;
  let h = m[1]!.toLowerCase();
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  return `#${h}`;
}

const normalizedValue = computed(() => normalizeHex(props.modelValue));

function isSelected(hex: string): boolean {
  const n = normalizeHex(hex);
  return n !== null && n === normalizedValue.value;
}

function select(hex: string): void {
  if (props.disabled) return;
  const n = normalizeHex(hex);
  if (!n) return;
  draftInvalid.value = false;
  draft.value = n;
  emit("update:modelValue", n);
}

/* Hex text input: drafts validate on every keystroke; only valid
   normalized values are emitted, bad input just flags the field. */
const draft = ref(props.modelValue);
const draftInvalid = ref(false);
const isInvalid = computed(() => props.invalid || draftInvalid.value);
const focusedIndex = ref(0);

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value;
    draftInvalid.value = false;
    const selected = props.swatches.findIndex((swatch) => isSelected(swatch));
    if (selected >= 0) focusedIndex.value = selected;
  },
  { immediate: true }
);

watch(
  () => props.swatches.length,
  (length) => {
    focusedIndex.value = Math.min(focusedIndex.value, Math.max(0, length - 1));
  }
);

function onInput(): void {
  if (props.disabled) return;
  if (draft.value.trim() === "") {
    draftInvalid.value = false;
    return;
  }
  const n = normalizeHex(draft.value);
  if (n) {
    draftInvalid.value = false;
    emit("update:modelValue", n);
  } else {
    draftInvalid.value = true;
  }
}

async function onSwatchKeydown(event: KeyboardEvent, index: number): Promise<void> {
  if (!props.swatches.length) return;
  let nextIndex: number | undefined;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    nextIndex = (index + 1) % props.swatches.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    nextIndex = (index - 1 + props.swatches.length) % props.swatches.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = props.swatches.length - 1;
  }
  if (nextIndex === undefined) return;

  event.preventDefault();
  const grid = (event.currentTarget as HTMLElement).parentElement;
  focusedIndex.value = nextIndex;
  await nextTick();
  const buttons = grid?.querySelectorAll<HTMLElement>(".wl-color-picker__sw");
  buttons?.[nextIndex]?.focus();
}
</script>

<template>
  <div
    class="wl-color-picker"
    :class="{ 'is-disabled': disabled, 'is-invalid': isInvalid }"
    data-wl="color-picker"
    :data-size="size"
    :data-disabled="disabled || undefined"
    :data-invalid="isInvalid || undefined"
  >
    <div
      class="wl-color-picker__grid"
      role="listbox"
      :aria-label="paletteLabel"
      :aria-disabled="disabled || undefined"
    >
      <button
        v-for="(hex, index) in swatches"
        :key="hex"
        type="button"
        role="option"
        class="wl-color-picker__sw"
        :class="{ 'is-selected': isSelected(hex) }"
        :style="{ background: hex }"
        :aria-selected="isSelected(hex)"
        :disabled="disabled"
        :tabindex="index === focusedIndex ? 0 : -1"
        :aria-label="hex"
        :title="hex"
        @click="select(hex)"
        @focus="focusedIndex = index"
        @keydown="onSwatchKeydown($event, index)"
      />
    </div>
    <input
      v-model="draft"
      class="wl-color-picker__hex"
      :class="{ 'is-invalid': isInvalid }"
      :aria-invalid="isInvalid || undefined"
      :aria-label="inputLabel"
      :disabled="disabled"
      placeholder="#000000"
      spellcheck="false"
      autocomplete="off"
      @input="onInput"
    />
  </div>
</template>
