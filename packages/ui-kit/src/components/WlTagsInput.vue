<script setup lang="ts">
/** WlTagsInput public component contract.
 * @slot tag - Custom tag content.
 */
import { computed, ref, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { splitInputAttrs } from "../utils/inputAttrs";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /** Hint shown when the control has no displayed text. */
  placeholder?: string;
  /** Name used by the component's native form controls. */
  name?: string;
  /**
   * Text delimiters splitting pasted or entered text into tag values.
   * @default [","]
   */
  separators?: readonly string[];
  /** Application validation predicate for a proposed tag value. */
  validator?: (value: string) => boolean;
  /** Maximum number of tag values accepted in the model. */
  max?: number;
  /**
   * Allow repeated tag values in the model.
   * @default false
   */
  allowDuplicates?: boolean;
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /**
   * Keep the current value readable while preventing user edits.
   * @default false
   */
  readonly?: boolean;
  /**
   * Expose a validation error state on the control.
   * @default false
   */
  invalid?: boolean;
  /**
   * Indicate pending work supplied by the application.
   * @default false
   */
  loading?: boolean;
  /**
   * Visual treatment within this component family.
   * @default "default"
   */
  variant?: "default";
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
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"tagsinput">;
}>(), { separators: () => [","], allowDuplicates: false, disabled: false, readonly: false, invalid: false, loading: false, variant: "default", size: "md", density: "default" });
const emit = defineEmits<{
  /** Emitted when a valid tag value is added. */
  add: [value: string];
  /** Emitted when the removal action is activated. */
  remove: [value: string, index: number];
  /** Emitted when a proposed value is rejected, with its reason. */
  reject: [value: string, reason: "invalid" | "duplicate" | "max"];
}>();
/** Ordered list of tag strings.
 * Paired with update:modelValue.
 * @default []
 */
const model = defineModel<string[], never>({ default: () => [] });
defineSlots<{
  /** Custom tag content with its value, index and removal callback. */
  tag?(props: { value: string; index: number; remove: () => void }): unknown; }>();
const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const form = computed(() => typeof attrGroups.value.inputAttrs.form === "string" ? attrGroups.value.inputAttrs.form : undefined);
const section = useWlPt("tagsinput", computed(() => props.pt));
const locale = useWlLocale();
const input = ref<HTMLInputElement | null>(null);
const draft = ref("");
const composing = ref<boolean>(false);
const locked = computed(() => props.disabled || props.readonly || props.loading);
const maximum = computed(() => props.max !== undefined && Number.isFinite(props.max) ? Math.max(0, Math.floor(props.max)) : Infinity);
function remove(index: number): void {
  if (locked.value || index < 0 || index >= model.value.length) return;
  const next = [...model.value];
  const value = next.splice(index, 1)[0]!;
  model.value = next;
  emit("remove", value, index);
  input.value?.focus();
}
function add(values: readonly string[]): void {
  if (locked.value) return;
  const next = [...model.value];
  for (const text of values) {
    const value = text.trim();
    if (!value) continue;
    if (!props.allowDuplicates && next.includes(value)) emit("reject", value, "duplicate");
    else if (props.validator && !props.validator(value)) emit("reject", value, "invalid");
    else if (next.length >= maximum.value) emit("reject", value, "max");
    else {
      next.push(value);
      emit("add", value);
    }
  }
  if (next.length !== model.value.length) model.value = next;
}
function parts(text: string): string[] {
  let result = [text];
  for (const separator of props.separators.filter(Boolean)) result = result.flatMap((part) => part.split(separator));
  return result;
}
function commit(): void {
  if (locked.value || composing.value) return;
  add([draft.value]);
  draft.value = "";
}
function onKeydown(event: KeyboardEvent): void {
  if (locked.value || composing.value || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return;
  if (event.key === "Enter" || props.separators.includes(event.key)) {
    event.preventDefault();
    commit();
  } else if (event.key === "Backspace" && !draft.value) {
    event.preventDefault();
    remove(model.value.length - 1);
  }
}
function onInput(event: Event): void {
  draft.value = (event.target as HTMLInputElement).value;
  if (locked.value || composing.value || (event as InputEvent).isComposing) return;
  const values = parts(draft.value);
  if (values.length > 1) {
    draft.value = values.pop() ?? "";
    add(values);
  }
}
function onPaste(event: ClipboardEvent): void {
  if (locked.value || composing.value) return;
  const text = event.clipboardData?.getData("text") ?? "";
  if (parts(text).length <= 1) return;
  event.preventDefault();
  const start = input.value?.selectionStart ?? draft.value.length;
  const end = input.value?.selectionEnd ?? start;
  add(parts(draft.value.slice(0, start) + text + draft.value.slice(end)));
  draft.value = "";
}
function removeLabel(value: string): string {
  return locale.value.removeItem.replace("{label}", value);
}
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-tags-input"
    :class="{ 'is-disabled': disabled || loading, 'is-invalid': invalid }"
    data-wl="tags-input"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :aria-busy="loading || undefined"
  >
    <span
      v-for="(value, index) in model"
      :key="index"
      v-bind="section('tag')"
      class="wl-tags-input__tag"
    >
      <slot
        name="tag"
        :value="value"
        :index="index"
        :remove="() => remove(index)"
      >
        <span v-bind="section('label')" class="wl-tags-input__label">{{ value }}</span>
        <button
          v-if="!readonly"
          v-bind="section('removeButton')"
          type="button"
          class="wl-tags-input__remove"
          :aria-label="removeLabel(value)"
          :disabled="locked"
          @click="remove(index)"
        ><WlIcon name="x" :size="12" aria-hidden="true" /></button>
      </slot>
    </span>
    <input
      ref="input"
      v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'))"
      :value="draft"
      class="wl-tags-input__input"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :aria-invalid="invalid || undefined"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @compositionstart="composing = true"
      @compositionend="composing = false"
    />
    <input
      v-for="(value, index) in name ? model : []"
      :key="`hidden-${index}`"
      type="hidden"
      :name="name"
      :value="value"
      :form="form"
      :disabled="disabled || loading"
    />
  </div>
</template>
