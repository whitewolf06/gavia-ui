<script setup lang="ts">
/** WlColorPicker public component contract.
 * @since 0.1.0
 */
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import type { WlPt } from "../pt-types";
import type { WlColorPickerSize } from "../types";
import { mergeWlAttrs, useWlLocale, useWlLocaleText, useWlPt } from "../config";
import { normalizePickerColor, pickerHex, pickerHsva, type PickerHsva } from "../utils/colorPicker";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
defineOptions({ inheritAttrs: false });
/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
const props = withDefaults(
  defineProps<{
    /** Normalized lowercase hex; alpha mode includes the final opacity byte. */
    modelValue?: string;
    /** Palette HEX colours. */
    swatches?: readonly string[];
    /**
     * Colour swatch size.
     * @default "md"
     */
    size?: WlColorPickerSize;
    /**
     * Disables the palette and input.
     * @default false
     */
    disabled?: boolean;
    /**
     * External error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Enable an alpha channel in the selected color.
     * @default false
     */
    alpha?: boolean;
    /**
     * Allow entering a custom color beyond the swatch palette.
     * @default false
     */
    custom?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"colorpicker">;
    /**
     * Accessible colour list name.
     * @default "Палитра"
     */
    paletteLabel?: string;
    /**
     * Accessible HEX field name.
     * @default "HEX-код цвета"
     */
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
    alpha: false, custom: false,
    paletteLabel: "Палитра",
    inputLabel: "HEX-код цвета"
  }
);

const emit = defineEmits<{
  /** New normalised #rrggbb colour. */
  "update:modelValue": [value: string];
}>();

const localeText = useWlLocaleText();
const locale = useWlLocale();
const attrs = useAttrs();
const section = useWlPt("colorpicker", computed(() => props.pt));
const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => mergeWlAttrs(attrGroups.value.inputAttrs, section("input")));
const controlProps = computed(() => getWlControlProps(inputAttrs.value));
const readonly = computed(() => {
  const value = inputAttrs.value.readonly ?? inputAttrs.value.readOnly;
  return value !== undefined && value !== null && value !== false;
});
const hexLabel = computed(() => controlProps.value.ariaLabel
  ?? (controlProps.value.ariaLabelledby ? undefined : localeText("inputLabel", props.inputLabel, "colorHex")));
function normalizeHex(value: string): string | null {
  return normalizePickerColor(value, props.alpha);
}

const normalizedValue = computed(() => normalizeHex(props.modelValue));

function isSelected(hex: string): boolean {
  const n = normalizeHex(hex);
  return n !== null && n === normalizedValue.value;
}

function select(hex: string): void {
  if (props.disabled || readonly.value) return;
  const n = normalizeHex(hex);
  if (!n) return;
  draftInvalid.value = false;
  draft.value = n;
  hsva.value = pickerHsva(n);
  emit("update:modelValue", n);
}

/* Hex text input: drafts validate on every keystroke; only valid
   normalized values are emitted, bad input just flags the field. */
const draft = ref(props.modelValue);
const draftInvalid = ref(false);
const isInvalid = computed(() => props.invalid || draftInvalid.value);
const focusedIndex = ref(0);
const hsva = ref<PickerHsva>(pickerHsva(props.modelValue));
const channels = computed(() => [
  ...(props.custom
    ? [
        { key: "h" as const, label: locale.value.colorHue, value: hsva.value.h, max: 360 },
        { key: "s" as const, label: locale.value.colorSaturation, value: hsva.value.s * 100, max: 100 },
        { key: "v" as const, label: locale.value.colorValue, value: hsva.value.v * 100, max: 100 }
      ]
    : []),
  ...(props.alpha ? [{ key: "a" as const, label: locale.value.colorAlpha, value: hsva.value.a * 100, max: 100 }] : [])
]);
function changeChannel(key: keyof PickerHsva, event: Event): void {
  const target = event.target as HTMLInputElement;
  if (props.disabled || readonly.value || target.disabled) return;
  const value = Number(target.value);
  if (!Number.isFinite(value)) return;
  hsva.value = { ...hsva.value, [key]: key === "h" ? Math.max(0, Math.min(360, value)) : Math.max(0, Math.min(100, value)) / 100 };
  const hex = pickerHex(hsva.value, props.alpha);
  draft.value = hex;
  draftInvalid.value = false;
  emit("update:modelValue", hex);
}

watch(
  [() => props.modelValue, () => props.alpha],
  ([value, alpha], previous) => {
    if (!previous || alpha !== previous[1] || normalizeHex(value) !== normalizeHex(draft.value)) hsva.value = pickerHsva(value);
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
  if (props.disabled || readonly.value) return;
  if (draft.value.trim() === "") {
    draftInvalid.value = false;
    return;
  }
  const n = normalizeHex(draft.value);
  if (n) {
    draftInvalid.value = false;
    hsva.value = pickerHsva(n);
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
    v-bind="mergeWlAttrs(section('root'), attrGroups.rootAttrs)"
    class="wl-color-picker"
    :class="{ 'is-disabled': disabled, 'is-invalid': isInvalid }"
    data-wl="color-picker"
    :data-size="size"
    :data-disabled="disabled || undefined"
    :data-invalid="isInvalid || undefined"
  >
    <div
      v-bind="section('grid')"
      class="wl-color-picker__grid"
      role="listbox"
      :aria-label="localeText('paletteLabel', paletteLabel, 'colorPalette')"
      :aria-disabled="disabled || undefined"
    >
      <button
        v-for="(hex, index) in swatches"
        :key="hex"
        v-bind="section('swatch', { selected: isSelected(hex), disabled: disabled })"
        type="button"
        role="option"
        class="wl-color-picker__sw"
        :class="{ 'is-selected': isSelected(hex) }"
        :style="{ background: hex }"
        :aria-selected="isSelected(hex)"
        :disabled="disabled || readonly"
        :tabindex="index === focusedIndex ? 0 : -1"
        :aria-label="hex"
        :title="hex"
        @click="select(hex)"
        @focus="focusedIndex = index"
        @keydown="onSwatchKeydown($event, index)"
      ></button>
    </div>
    <input
      v-bind="inputAttrs"
      v-model="draft"
      class="wl-color-picker__hex"
      :class="{ 'is-invalid': isInvalid }"
      :aria-invalid="isInvalid || undefined"
      :aria-label="hexLabel"
      :disabled="disabled"
      :placeholder="alpha ? '#000000ff' : '#000000'"
      spellcheck="false"
      autocomplete="off"
      @input="onInput"
    />
    <div v-if="channels.length" v-bind="section('controls')" class="wl-color-picker__controls">
      <label
        v-for="channel in channels"
        :key="channel.key"
        v-bind="section('channel')"
        class="wl-color-picker__channel"
      >
        <span v-bind="section('channelLabel')">{{ channel.label }}</span>
        <input
          v-bind="section('channelInput')"
          class="wl-color-picker__channel-input"
          type="range"
          :min="0"
          :max="channel.max"
          :step="0.1"
          :value="channel.value"
          :disabled="disabled || readonly"
          :data-channel="channel.key"
          @input="changeChannel(channel.key, $event)"
        />
      </label>
    </div>
  </div>
</template>
