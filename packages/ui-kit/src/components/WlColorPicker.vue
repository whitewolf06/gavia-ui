<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { WlColorPickerSize } from "../types";

/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
const props = withDefaults(
  defineProps<{
    /** v-model — hex color, always emitted normalized as lowercase #rrggbb. */
    modelValue?: string;
    swatches?: string[];
    size?: WlColorPickerSize;
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
    size: "md"
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
  const n = normalizeHex(hex);
  if (!n) return;
  invalid.value = false;
  draft.value = n;
  emit("update:modelValue", n);
}

/* Hex text input: drafts validate on every keystroke; only valid
   normalized values are emitted, bad input just flags the field. */
const draft = ref(props.modelValue);
const invalid = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value;
    invalid.value = false;
  }
);

function onInput(): void {
  if (draft.value.trim() === "") {
    invalid.value = false;
    return;
  }
  const n = normalizeHex(draft.value);
  if (n) {
    invalid.value = false;
    emit("update:modelValue", n);
  } else {
    invalid.value = true;
  }
}
</script>

<template>
  <div class="wl-color-picker" data-wl="color-picker" :data-size="size">
    <div class="wl-color-picker__grid" role="listbox" aria-label="Палитра">
      <button
        v-for="hex in swatches"
        :key="hex"
        type="button"
        role="option"
        class="wl-color-picker__sw"
        :class="{ 'is-selected': isSelected(hex) }"
        :style="{ background: hex }"
        :aria-selected="isSelected(hex)"
        :aria-label="hex"
        :title="hex"
        @click="select(hex)"
      />
    </div>
    <input
      v-model="draft"
      class="wl-color-picker__hex"
      :class="{ 'is-invalid': invalid }"
      :aria-invalid="invalid || undefined"
      aria-label="HEX-код цвета"
      placeholder="#000000"
      spellcheck="false"
      autocomplete="off"
      @input="onInput"
    />
  </div>
</template>
