<script
  setup
  lang="ts"
  generic="TOption = unknown,
    TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>> | undefined = undefined,
    TGroupChildren extends WlOptionGroupChildrenResolver<NoInfer<TOption>> | undefined = undefined"
>
/** WlSelect public component contract.
 * @since 0.1.0
 * @slot value - Selected value scope: { option, placeholder }.
 * @slot header - Content before the option list.
 * @slot loading - Content displayed while application work is pending.
 * @slot optiongroup - Custom optiongroup content.
 * @slot option - Option scope: { option, index, selected, active }.
 * @slot empty - Content shown when no options match.
 * @slot footer - Content after the option list.
 */
import { computed, nextTick, ref, type Ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlOptionDisabled, WlOptionGroupChildrenResolver, WlOptionKeyResolver, WlOptionLabel, WlOptionLeaf, WlOptionValue, WlOptionValueResolver, WlSelectionExpose, WlSelectModel } from "../selection-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlResultsAnnouncement } from "../composables/useWlResultsAnnouncement";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { getWlControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { createOptionGroupKey, optionSections } from "../utils/optionGroups";
import { optionDisabled as resolveOptionDisabled, optionKey as resolveOptionKey, optionLabel as resolveOptionLabel, optionValue as resolveOptionValue, useWlListbox } from "../utils/options";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Modifier flags accepted by the component's typed model contract. */
  modelModifiers?: WlNoModelModifiers;
  /**
   * Readonly TOption list; the model type is determined by optionValue.
   * @default []
   */
  options?: readonly TOption[];
  /** Label field name or (option) => string function. */
  optionLabel?: WlOptionLabel<NoInfer<Option>>;
  /** TOption key or (option: TOption) => TValue function; determines model type. */
  optionValue?: TResolver;
  /** Option field or predicate identifying disabled options. */
  optionDisabled?: WlOptionDisabled<NoInfer<Option>>;
  /** Stable option field or key resolver; keeps rendered option state with its data. */
  optionKey?: WlOptionKeyResolver<NoInfer<Option>>;
  /** Resolve the visible label of an option group. */
  optionGroupLabel?: WlOptionLabel<NoInfer<TOption>>;
  /** Resolve the readonly child options of a group descriptor. */
  optionGroupChildren?: TGroupChildren;
  /**
   * Enable local filtering of available options.
   * @default false
   */
  filter?: boolean;
  /**
   * Indicate pending work supplied by the application.
   * @default false
   */
  loading?: boolean;
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
  /** List animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"select">;
}>(), { options: () => [], invalid: false, disabled: false, filter: false, loading: false, size: "md", density: "default", motion: undefined });

// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
/** Selected option or resolved value; null clears the selection.
 * Paired with update:modelValue.
 */
const model: Ref<WlSelectModel<Option, TResolver> | undefined>
  = defineModel<WlSelectModel<NoInfer<Option>, NoInfer<TResolver>>, never>({ default: undefined as never });

defineSlots<{
  /** Option scope: { option, index, selected, active }. */
  option?(props: { option: Option; index: number; selected: boolean; active: boolean }): unknown;
  /** Custom option-group heading; receives the descriptor and resolved label. */
  optiongroup?(props: { group: TOption; label: string }): unknown;
  /** Selected value scope: { option, placeholder }. */
  value?(props: { option: Option | undefined; placeholder: string | undefined }): unknown;
  /** Content displayed while consumer-provided work is pending. */
  loading?(props: Record<never, never>): unknown;
  /** Content shown when no options match. */
  empty?(props: Record<never, never>): unknown;
  /** Content before the option list. */
  header?(props: Record<never, never>): unknown;
  /** Content after the option list. */
  footer?(props: Record<never, never>): unknown;
}>();

type Option = WlOptionLeaf<TOption, TGroupChildren>;

const locale = useWlLocale();

const attrs = useAttrs();
const attrGroups = computed(() => splitInputAttrs(attrs));
const root = ref<HTMLElement | null>(null);
const list = ref<HTMLElement | null>(null);
const filterInput = ref<HTMLInputElement | null>(null);
const query = ref("");
const groupKey = createOptionGroupKey();
const allOptions = computed(() => optionSections(props.options, props.optionGroupChildren as TGroupChildren, props.optionGroupLabel, props.optionLabel, "").flatMap((group) => group.options.map((item) => item.option)));
const groups = computed(() => optionSections(props.options, props.optionGroupChildren as TGroupChildren, props.optionGroupLabel, props.optionLabel, props.filter ? query.value : ""));
const filtered = computed(() => groups.value.flatMap((group) => group.options.map((item) => item.option)));
const section = useWlPt("select", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-select-list-${useWlId()}`;
const listAttrs = computed(() => {
  const control = getWlControlProps(mergeWlAttrs(attrGroups.value.inputAttrs, section("root")));
  return mergeWlAttrs({ id: generatedListId, "aria-label": control.ariaLabel ?? props.placeholder ?? locale.value.options, "aria-labelledby": control.ariaLabelledby }, section("list"));
});
const { visible, anchor, panel, style, show, hide } = useAnchoredOverlay();
watch(() => props.disabled, (disabled) => {
  if (disabled) hide();
});
function valueOf(option: Option): WlOptionValue<Option, TResolver> {
  return resolveOptionValue(option, props.optionValue as TResolver);
}
function isDisabled(option: Option): boolean {
  return resolveOptionDisabled(option, props.optionDisabled);
}
function keyOf(option: Option, index: number): PropertyKey {
  return resolveOptionKey(option, props.optionKey, index, valueOf(option));
}
const selected = computed(() => allOptions.value.find((option) => Object.is(valueOf(option), model.value)));
const display = computed(() => selected.value === undefined ? props.placeholder ?? "" : resolveOptionLabel(selected.value, props.optionLabel));
function choose(index: number): void {
  if (props.disabled || props.loading || index < 0 || index >= filtered.value.length) return;
  const option = filtered.value[index] as Option;
  if (isDisabled(option)) return;
  model.value = valueOf(option);
  hide();
  nextTick(() => root.value?.focus());
}
const { active, optionId, activeDescendant, onKeydown: navigate } = useWlListbox({
  listId: () => String(listAttrs.value.id), count: () => filtered.value.length,
  isDisabled: (index) => props.loading || isDisabled(filtered.value[index] as Option),
  label: (index) => resolveOptionLabel(filtered.value[index] as Option, props.optionLabel),
  onSelect: choose, onClose: hide, list
});
function clear(): void {
  if (props.disabled) return;
  model.value = null;
  hide();
  nextTick(() => root.value?.focus());
}
function open(_event?: Event): void {
  if (props.disabled) return;
  active.value = Math.max(0, filtered.value.findIndex((option) => Object.is(valueOf(option), model.value)));
  anchor.value = root.value;
  show();
  if (props.filter) nextTick(() => filterInput.value?.focus());
}
defineExpose<WlSelectionExpose>({ open, close: hide, focus: () => root.value?.focus() });
useWlResultsAnnouncement({
  query: () => query.value,
  count: () => filtered.value.length,
  visible: () => visible.value && props.filter,
  loading: () => props.loading
});
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    open(event);
    return;
  }
  if (!visible.value && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) open(event);
  if (visible.value) navigate(event);
}
</script>

<template>
  <!-- Dynamic tabindex removes only disabled controls from the tab order. -->
  <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -->
  <div
    ref="root"
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, attrGroups.inputAttrs, section('root'))"
    class="wl-select"
    :class="[`wl-select--${size}`, { 'is-invalid': invalid, 'is-disabled': disabled, 'is-compact': density === 'compact' }]"
    role="combobox"
    :tabindex="disabled ? -1 : 0"
    :aria-expanded="visible"
    aria-haspopup="listbox"
    :aria-invalid="invalid || undefined"
    :aria-disabled="disabled || undefined"
    :aria-busy="loading || undefined"
    :aria-controls="visible ? String(listAttrs.id) : undefined"
    :aria-activedescendant="visible ? activeDescendant : undefined"
    data-wl="select"
    :data-size="size"
    :data-density="density"
    @click="open"
    @keydown="onKeydown"
  >
    <span v-bind="section('label')" class="wl-select__label" :data-placeholder="selected === undefined || undefined">
      <slot name="value" :option="selected" :placeholder="placeholder">{{ display }}</slot>
    </span>
    <button
      v-if="clearable && model !== null && model !== undefined"
      v-bind="section('clearButton')"
      type="button"
      class="wl-select__clear"
      :aria-label="locale.clear"
      :disabled="disabled"
      @click.stop="clear"
      @keydown.stop
    >×</button>
    <span v-bind="section('dropdown')" class="wl-select__dropdown" aria-hidden="true">
      <WlIcon
        v-bind="section('dropdownIcon')"
        class="wl-select__dropdown-icon"
        :name="loading ? 'refresh' : 'chevron-down'"
        :size="14"
      />
    </span>
    <input
      v-if="attrGroups.inputAttrs.name"
      type="hidden"
      :name="String(attrGroups.inputAttrs.name)"
      :value="model == null ? '' : String(model)"
    />
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
        class="wl-overlay wl-select-overlay"
        :style="style"
      >
        <div v-if="filter || $slots.header" v-bind="section('header')" class="wl-select__header">
          <slot name="header"></slot>
          <input
            v-if="filter"
            ref="filterInput"
            v-bind="section('filterInput')"
            v-model="query"
            class="wl-input wl-input--sm"
            type="search"
            :aria-label="locale.filter"
            role="combobox"
            :aria-expanded="visible"
            :aria-controls="String(listAttrs.id)"
            :aria-activedescendant="activeDescendant"
            @keydown="navigate"
          />
        </div>
        <div v-bind="section('listContainer')" class="wl-select__list-container">
          <div
            ref="list"
            v-bind="listAttrs"
            class="wl-select__list"
            role="listbox"
            :aria-busy="loading || undefined"
          >
            <div v-if="loading" v-bind="section('loadingMessage')" class="wl-select__empty">
              <slot name="loading">{{ locale.loading }}</slot>
            </div>
            <div
              v-for="(group, groupIndex) in groups"
              v-else
              :key="groupKey(group.group, groupIndex)"
              :role="group.group !== undefined ? 'group' : undefined"
              :aria-label="group.group !== undefined ? group.label : undefined"
            >
              <div
                v-if="group.group !== undefined"
                v-bind="section('optionGroup')"
                class="wl-select__group-label"
                role="presentation"
              >
                <slot name="optiongroup" :group="group.group" :label="group.label">{{ group.label }}</slot>
              </div>
              <!-- The focused combobox selects this active descendant through its keyboard handler. -->
              <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
              <div
                v-for="({ option, index }) in group.options"
                v-bind="section('option', { focused: active === index, selected: Object.is(valueOf(option), model) })"
                :id="optionId(index)"
                :key="keyOf(option, index)"
                class="wl-select__option"
                role="option"
                :aria-selected="Object.is(valueOf(option), model)"
                :aria-disabled="isDisabled(option) || undefined"
                tabindex="-1"
                :data-active="active === index"
                :data-selected="Object.is(valueOf(option), model)"
                @mousedown.prevent
                @click="choose(index)"
              >
                <slot
                  name="option"
                  :option="option"
                  :index="index"
                  :selected="Object.is(valueOf(option), model)"
                  :active="active === index"
                >
                  <span
                    v-bind="section('optionLabel')"
                    class="wl-select__option-label"
                  >{{ resolveOptionLabel(option, props.optionLabel) }}</span>
                </slot>
              </div>
            </div>
            <div v-if="!loading && filtered.length === 0" v-bind="section('emptyMessage')" class="wl-select__empty">
              <slot name="empty">{{ locale.noOptions }}</slot>
            </div>
          </div>
        </div>
        <div v-if="$slots.footer" v-bind="section('footer')">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
