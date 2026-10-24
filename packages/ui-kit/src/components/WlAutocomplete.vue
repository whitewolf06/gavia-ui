<script setup lang="ts" generic="TOption = unknown, TMultiple extends boolean = false">
/** WlAutocomplete public component contract.
 * @since 0.2.0
 * @slot chip - Selected chip scope: { option, remove }.
 * @slot loading - Content displayed while application work is pending.
 * @slot option - Option scope: { option, index, selected, active }.
 * @slot empty - Content shown when no options match.
 */
import { computed, nextTick, onBeforeUnmount, ref, type Ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlAutocompleteCompleteEvent, WlAutocompleteModel, WlAutocompleteOptionLabel, WlOptionDisabled, WlOptionKeyResolver } from "../selection-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlResultsAnnouncement } from "../composables/useWlResultsAnnouncement";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { optionDisabled as resolveOptionDisabled, optionKey as resolveOptionKey, optionLabel as resolveOptionLabel, useWlListbox } from "../utils/options";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import Teleport from "../utils/templateTeleport.vue";
import Transition from "../utils/templateTransition.vue";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
// Read props.* in the template; Volar 2.x cannot reliably project this generic Boolean default into its generated instance.
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /**
   * Readonly TOption list; determines the selected suggestion type.
   * @default []
   */
  suggestions?: readonly TOption[];
  /** Label field name or (option) => string function. */
  optionLabel?: WlAutocompleteOptionLabel<NoInfer<TOption>, NoInfer<TMultiple>>;
  /** Option field or predicate identifying disabled options. */
  optionDisabled?: WlOptionDisabled<NoInfer<TOption>>;
  /** Stable option field or key resolver; keeps rendered option state with its data. */
  optionKey?: WlOptionKeyResolver<NoInfer<TOption>>;
  /** Show a named clear button; clears a single model to null. */
  clearable?: boolean;
  /** Placeholder. */
  placeholder?: string;
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
   * Field size.
   * @default "md"
   */
  size?: WlSizeSm;
  /**
   * Density.
   * @default "default"
   */
  density?: WlDensity;
  // The boolean intersection also preserves Vue's runtime casting of `multiple`.
  /** Multiple selection (chips). */
  multiple?: TMultiple & boolean;
  /**
   * List expansion button.
   * @default false
   */
  dropdown?: boolean;
  /**
   * Accessible list expansion button name.
   * Defaults to WlConfig.locale.showOptions (English when unconfigured).
   * @default undefined
   */
  dropdownLabel?: string;
  /**
   * Minimum characters to start a search.
   * @default 1
   */
  minLength?: number;
  /**
   * Delay in milliseconds before requesting completion for changed text.
   * @default 300
   */
  debounce?: number;
  /**
   * Indicate pending work supplied by the application.
   * @default false
   */
  loading?: boolean;
  /** Suggestion animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"autocomplete">;
}>(), {
  suggestions: () => [], invalid: false, disabled: false, size: "md", density: "default",
  multiple: () => false as TMultiple, dropdown: false, minLength: 1,
  debounce: 300, loading: false, motion: undefined
});
const emit = defineEmits<{
  /** Start search: { originalEvent, query } — update suggestions. */
  complete: [event: WlAutocompleteCompleteEvent]; }>();
// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
/** Single mode accepts an option, free text or null; multiple mode accepts an option array or null.
 * Paired with update:modelValue.
 */
const model: Ref<WlAutocompleteModel<TOption, TMultiple> | undefined>
  = defineModel<WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>, never>({ default: undefined as never });
defineSlots<{
  /** Option scope: { option, index, selected, active }. */
  option?(props: { option: TOption; index: number; selected: boolean; active: boolean }): unknown;
  /** Selected chip scope: { option, remove }. */
  chip?(props: { option: TOption; remove: () => void }): unknown;
  /** Content shown when no options match. */
  empty?(props: Record<never, never>): unknown;
  /** Content displayed while consumer-provided work is pending. */
  loading?(props: Record<never, never>): unknown;
}>();
const locale = useWlLocale();

const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const section = useWlPt("autocomplete", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-autocomplete-list-${useWlId()}`;
const listAttrs = computed(() => {
  const inputAttrs = props.multiple
    ? mergeWlAttrs(attrGroups.value.inputAttrs, section("input"), section("inputChip"))
    : mergeWlAttrs(attrGroups.value.inputAttrs, section("inputText.root"));
  const control = getWlControlProps(inputAttrs);
  return mergeWlAttrs({ id: generatedListId, "aria-label": control.ariaLabel ?? props.placeholder ?? locale.value.options, "aria-labelledby": control.ariaLabelledby }, section("list"));
});
const control = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);
const query = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;
const { visible, panel, style, show, hide } = useAnchoredOverlay();
watch(() => props.disabled, (disabled) => {
  if (!disabled) return;
  hide();
  if (timer) clearTimeout(timer);
});
const selected = computed<TOption[]>(() => Array.isArray(model.value) ? model.value as TOption[] : []);
function isDisabled(option: TOption): boolean {
  return resolveOptionDisabled(option, props.optionDisabled);
}
function keyOf(option: TOption, index: number): PropertyKey {
  return resolveOptionKey(option, props.optionKey, index);
}
function isSelected(option: TOption): boolean {
  return props.multiple ? selected.value.some((item) => Object.is(item, option)) : Object.is(model.value, option);
}
watch(() => model.value, (value) => {
  if (props.multiple) return;
  if (value === undefined || value === null) {
    query.value = "";
    return;
  }
  // A runtime mode check cannot narrow a conditional generic. In single mode
  // both the model and its label callback include user-entered strings.
  query.value = typeof value === "string" && typeof props.optionLabel === "string"
    ? value
    : resolveOptionLabel(value as TOption | string,
        props.optionLabel as string | ((option: TOption | string) => string) | undefined);
}, { immediate: true });
function complete(event: Event): void {
  if (props.disabled) return;
  if (timer) clearTimeout(timer);
  if (query.value.length < props.minLength) {
    hide();
    return;
  }
  const delay = Number.isFinite(props.debounce) ? Math.max(0, props.debounce) : 300;
  timer = setTimeout(() => {
    timer = undefined;
    emit("complete", { originalEvent: event, query: query.value });
  }, delay);
  if (control.value) show(event);
}
function choose(index: number): void {
  if (props.disabled || props.loading) return;
  const option = props.suggestions[index];
  if (option === undefined || isDisabled(option)) return;
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (props.multiple) {
    model.value = [...selected.value, option] as WlAutocompleteModel<TOption, TMultiple>;
    query.value = "";
  } else {
    model.value = option as WlAutocompleteModel<TOption, TMultiple>;
    query.value = resolveOptionLabel(option, props.optionLabel);
  }
  hide();
  nextTick(() => control.value?.focus());
}
function remove(index: number): void {
  if (props.disabled) return;
  model.value = selected.value.filter((_, itemIndex) => itemIndex !== index) as WlAutocompleteModel<TOption, TMultiple>;
}
function clear(): void {
  if (props.disabled || props.multiple) return;
  if (timer) clearTimeout(timer);
  query.value = "";
  model.value = null;
  hide();
  nextTick(() => control.value?.focus());
}
function onInput(event: Event): void {
  if (props.disabled) return;
  model.value = query.value as WlAutocompleteModel<TOption, TMultiple>;
  complete(event);
}
const { active, optionId, activeDescendant, onKeydown: navigate } = useWlListbox({
  listId: () => String(listAttrs.value.id), count: () => props.suggestions.length,
  isDisabled: (index) => props.loading || isDisabled(props.suggestions[index] as TOption),
  label: (index) => resolveOptionLabel(props.suggestions[index] as TOption, props.optionLabel),
  onSelect: choose, onClose: hide, list
});
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && event.key === "ArrowDown") {
    event.preventDefault();
    active.value = 0;
    show(event);
    return;
  }
  if (visible.value) navigate(event);
}
function open(event: Event): void {
  if (!props.disabled) show(event);
}
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
useWlResultsAnnouncement({
  query: () => query.value,
  count: () => props.suggestions.length,
  visible: () => visible.value,
  loading: () => props.loading
});
</script>

<template>
  <div
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-autocomplete"
    :class="[
      `wl-autocomplete--${props.size}`,
      { 'is-invalid': props.invalid, 'is-disabled': props.disabled, 'is-compact': props.density === 'compact' }
    ]"
    data-wl="autocomplete"
    :data-size="props.size"
    :data-density="props.density"
    :aria-busy="props.loading || undefined"
  >
    <div v-if="props.multiple" v-bind="section('inputMultiple')" class="wl-autocomplete__multiple">
      <span
        v-for="(item, index) in selected"
        :key="keyOf(item, index)"
        v-bind="mergeWlAttrs(section('chipItem'), section('chip.root'))"
        class="wl-multiselect__chip"
      >
        <slot name="chip" :option="item" :remove="() => remove(index)">
          <span v-bind="section('chip.label')" class="wl-multiselect__chip-label">{{ resolveOptionLabel(item, props.optionLabel) }}</span>
          <button
            v-bind="section('chip.removeIcon')"
            type="button"
            class="wl-multiselect__chip-remove"
            :aria-label="formatWlLocaleText(locale.removeItem, { label: resolveOptionLabel(item, props.optionLabel) })"
            :disabled="props.disabled"
            @click="remove(index)"
          >×</button>
        </slot>
      </span>
      <input
        ref="control"
        v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('input'), section('inputChip'))"
        v-model="query"
        class="wl-autocomplete__inner-input"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :aria-invalid="props.invalid || undefined"
        :aria-busy="props.loading || undefined"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="visible"
        :aria-controls="visible ? String(listAttrs.id) : undefined"
        :aria-activedescendant="visible ? activeDescendant : undefined"
        @input="complete($event)"
        @keydown="onKeydown"
      />
    </div>
    <input
      v-else
      ref="control"
      v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('inputText.root'))"
      v-model="query"
      class="wl-input"
      :class="[`wl-input--${props.size}`, { 'is-invalid': props.invalid }]"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-invalid="props.invalid || undefined"
      :aria-busy="props.loading || undefined"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="visible"
      :aria-controls="visible ? String(listAttrs.id) : undefined"
      :aria-activedescendant="visible ? activeDescendant : undefined"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      v-if="props.clearable && !props.multiple && model !== null && model !== undefined && model !== ''"
      v-bind="section('clearButton')"
      type="button"
      class="wl-autocomplete__clear"
      :aria-label="locale.clear"
      :disabled="props.disabled"
      @click="clear"
    >×</button>
    <button
      v-if="props.dropdown"
      v-bind="section('dropdown')"
      type="button"
      class="wl-autocomplete__dropdown"
      :aria-label="props.dropdownLabel ?? locale.showOptions"
      :disabled="props.disabled"
      @click="open"
    >
      <WlIcon
        v-bind="section('dropdownIcon')"
        class="wl-autocomplete__dropdown-icon"
        :name="props.loading ? 'refresh' : 'chevron-down'"
        :size="14"
      />
    </button>
  </div>
  <Teleport to="body">
    <Transition
      name="wl-pop-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <div
        v-if="visible"
        ref="panel"
        v-bind="section('overlay')"
        class="wl-overlay wl-autocomplete-overlay"
        :style="style"
      >
        <div v-bind="section('listContainer')" class="wl-select__list-container">
          <div
            ref="list"
            v-bind="listAttrs"
            class="wl-select__list"
            role="listbox"
            :aria-busy="props.loading || undefined"
          >
            <div v-if="props.loading" v-bind="section('loadingMessage')" class="wl-select__empty">
              <slot name="loading">{{ locale.loading }}</slot>
            </div>
            <!-- The focused combobox selects this active descendant through its keyboard handler. -->
            <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
            <div
              v-for="(option, index) in props.loading ? [] : props.suggestions"
              v-bind="section('option', { focused: active === index })"
              :id="optionId(index)"
              :key="keyOf(option, index)"
              class="wl-select__option"
              :data-active="active === index"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="isDisabled(option) || undefined"
              tabindex="-1"
              @pointerdown.prevent
              @click="choose(index)"
            >
              <slot
                name="option"
                :option="option"
                :index="index"
                :selected="isSelected(option)"
                :active="active === index"
              >
                {{ resolveOptionLabel(option, props.optionLabel) }}
              </slot>
            </div>
            <div v-if="!props.loading && props.suggestions.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">
              <slot name="empty">{{ locale.noOptions }}</slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
