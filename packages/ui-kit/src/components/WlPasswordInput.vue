<script setup lang="ts">
/** WlPasswordInput public component contract.
 * @since 0.1.0
 */
import { computed, ref, useAttrs } from "vue";
import type { WlTextModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlLocale, useWlLocaleText, useWlPt } from "../config";
import { splitInputAttrs } from "../utils/inputAttrs";
import { clamp, finiteOr } from "../utils/number";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlTextModelModifiers;
    /**
     * Field size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Density.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Disables the field.
     * @default false
     */
    disabled?: boolean;
    /**
     * Placeholder.
     * @default "Пароль"
     */
    placeholder?: string;
    /** Input aria-label. */
    ariaLabel?: string;
    /** Consumer-provided password-strength status. */
    strength?: number;
    /** Readable description of the password-strength status. */
    strengthLabel?: string;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"password">;
  }>(),
  {
    size: "md",
    density: "default",
    invalid: false,
    disabled: false,
    placeholder: "Пароль"
  }
);
/** Password text value; supports the trim model modifier.
 * Paired with update:modelValue.
 * @default ""
 */
const model = defineModel<string, "trim">({ default: "" });
const localeText = useWlLocaleText();
const locale = useWlLocale();

const visible = ref(false);
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const innerAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const section = useWlPt("password", computed(() => props.pt));
const controlAttrs = computed(() => mergeWlAttrs(innerAttrs.value, section("input")));
const strengthValue = computed(() => clamp(finiteOr(props.strength, 0), 0, 100));
</script>

<template>
  <div
    class="wl-input-wrap wl-input-wrap--has-btn"
    :class="{ 'is-disabled': disabled }"
    v-bind="mergeWlAttrs(rootAttrs, section('root'))"
    data-wl="password-input"
    :data-size="size"
    :data-density="density"
  >
    <input
      v-model="model"
      class="wl-input"
      :class="[
        `wl-input--${size}`,
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        density === 'compact' && 'is-compact'
      ]"
      v-bind="controlAttrs"
      :autocomplete="controlAttrs.autocomplete === undefined ? 'current-password' : String(controlAttrs.autocomplete)"
      :type="visible ? 'text' : 'password'"
      :placeholder="localeText('placeholder', placeholder, 'password')"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
    />
    <button
      v-bind="section('toggleButton')"
      type="button"
      class="wl-input-wrap__btn"
      :disabled="disabled"
      :aria-label="visible ? locale.hidePassword : locale.showPassword"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <WlIcon v-bind="section('toggleIcon')" :name="visible ? 'eye-off' : 'eye'" :size="13" />
    </button>
    <meter
      v-if="strength !== undefined"
      v-bind="section('strength')"
      class="wl-password-strength"
      min="0"
      max="100"
      :value="strengthValue"
      :aria-label="strengthLabel ?? locale.passwordStrength"
    ></meter>
  </div>
</template>
