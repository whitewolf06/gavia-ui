<script setup lang="ts">
/** WlField public component contract.
 * @since 0.1.0
 * @slot label - Custom visible label.
 * @slot default - Default component content.
 */
import { computed } from "vue";
import type { WlFieldSlotProps } from "../field-types";
import type { WlPt } from "../pt-types";
import { useWlLocale, useWlPt } from "../config";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    /** Visible label associated with the control ID. */
    label?: string;
    /** Mark the field as required and expose required to the control slot.
     * @default false
     */
    required?: boolean;
    /** Show the localized optional marker when required is false.
     * @default false
     */
    optional?: boolean;
    /** Arrange the label above or beside the control.
     * @default "vertical"
     */
    orientation?: "vertical" | "horizontal";
    /** Help text, retained in aria-describedby when an error is present. */
    hint?: string;
    /** Validation message; also marks the control slot as invalid. */
    error?: string;
    /** Control ID; otherwise a stable application-scoped ID is generated. */
    id?: string;
    /** Opt in to live validation announcements through role=alert.
     * @default false
     */
    announceError?: boolean;
    /** Attributes for the root, label, required, hint and error sections. */
    pt?: WlPt<"field">;
  }>(),
  {
    required: false
  }
);

const slots = defineSlots<{
  /** Control content; bind the supplied IDs, descriptions and validation state to the actual control. */
  default?(props: WlFieldSlotProps): unknown;
  /** Custom field label; receives the label text and required state. */
  label?(props: { label: string | undefined; required: boolean }): unknown; }>();

const uid = useWlId();
const locale = useWlLocale();
const section = useWlPt("field", computed(() => props.pt));
const controlId = computed(() => props.id ?? `wl-field-${uid}`);
const descId = computed(() => `${controlId.value}-desc`);
const labelId = computed(() => props.label || slots.label ? `${controlId.value}-label` : undefined);
const errorId = computed(() => props.hint ? `${controlId.value}-error` : descId.value);
const describedBy = computed(() => [props.hint && descId.value, props.error && errorId.value].filter(Boolean).join(" ") || undefined);
</script>

<template>
  <div
    v-bind="section('root')"
    class="wl-field"
    :class="{ 'is-invalid': Boolean(error) }"
    data-wl="field"
    :data-orientation="orientation ?? 'vertical'"
  >
    <label
      v-if="label || $slots.label"
      :id="labelId"
      v-bind="section('label')"
      class="wl-field__label"
      :for="controlId"
    >
      <slot name="label" :label="label" :required="required">{{ label }}</slot>
      <span v-if="optional && !required" class="wl-field__optional">{{ locale.optional }}</span>
      <span
        v-if="required"
        v-bind="section('required')"
        class="wl-field__req"
        aria-hidden="true"
      >*</span>
    </label>
    <slot
      v-bind="{
        id: controlId,
        inputId: controlId,
        labelId,
        ariaDescribedby: describedBy,
        ariaInvalid: error ? true : undefined,
        invalid: Boolean(error),
        required
      }"
    ></slot>
    <span
      v-if="hint"
      :id="descId"
      v-bind="section('hint')"
      class="wl-field__hint"
    >{{ hint }}</span>
    <span
      v-if="error"
      :id="errorId"
      v-bind="section('error')"
      class="wl-field__err"
      :role="announceError ? 'alert' : undefined"
    >
      <WlIcon name="warn" :size="12" />
      {{ error }}
    </span>
  </div>
</template>
