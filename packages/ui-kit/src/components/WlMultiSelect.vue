<script
  setup
  lang="ts"
  generic="TOption = unknown,
    TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>> | undefined = undefined,
    TGroupChildren extends WlOptionGroupChildrenResolver<NoInfer<TOption>> | undefined = undefined"
>
/** WlMultiSelect public component contract.
 * @since 0.2.0
 * @slot chip - Selected chip scope: { option, remove }.
 * @slot value - Selected values scope: { options, placeholder }.
 * @slot header - Content before the option list.
 * @slot selectall - Custom selectall content.
 * @slot loading - Content displayed while application work is pending.
 * @slot optiongroup - Custom optiongroup content.
 * @slot option - Option scope: { option, index, selected, active }.
 * @slot empty - Content shown when no options match.
 * @slot footer - Content after the option list.
 */
import { computed, nextTick, ref, useAttrs, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlMultiSelectModel, WlOptionDisabled, WlOptionGroupChildrenResolver, WlOptionKeyResolver, WlOptionLabel, WlOptionLeaf, WlOptionValue, WlOptionValueResolver, WlSelectionExpose } from "../selection-types";
import type { WlDensity, WlMultiSelectDisplay, WlSizeSm } from "../types";
import { useWlResultsAnnouncement } from "../composables/useWlResultsAnnouncement";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { wlPlural } from "../utils/format";
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
   * Readonly TOption list; selected value type is determined by optionValue.
   * @default []
   */
  options?: readonly TOption[];
  /** Label field name or (option) => string function. */
  optionLabel?: WlOptionLabel<NoInfer<Option>>;
  /** TOption key or (option: TOption) => TValue function; determines model array type. */
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
   * Show the action for toggling all eligible filtered options.
   * @default false
   */
  showSelectAll?: boolean;
  /**
   * Indicate pending work supplied by the application.
   * @default false
   */
  loading?: boolean;
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
  /**
   * Filter field inside the list.
   * @default false
   */
  filter?: boolean;
  /**
   * comma — comma-separated labels; chip — individual chips.
   * @default "comma"
   */
  display?: WlMultiSelectDisplay;
  /** Number of labels shown before a count replaces them. Only for display="comma". */
  maxSelectedLabels?: number;
  /** List animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"multiselect">;
}>(), {
  options: () => [], invalid: false, disabled: false, size: "md", density: "default",
  filter: false, loading: false, showSelectAll: false, display: "comma", motion: undefined
});

/** Selected options or resolved values; an empty array clears the selection.
 * Paired with update:modelValue.
 * @default []
 */
const model = defineModel<WlMultiSelectModel<NoInfer<Option>, NoInfer<TResolver>>, never>({ default: () => [] });

defineSlots<{
  /** Option scope: { option, index, selected, active }. */
  option?(props: { option: Option; index: number; selected: boolean; active: boolean }): unknown;
  /** Custom option-group heading; receives the descriptor and resolved label. */
  optiongroup?(props: { group: TOption; label: string }): unknown;
  /** Selected values scope: { options, placeholder }. */
  value?(props: { options: Option[]; placeholder: string | undefined }): unknown;
  /** Selected chip scope: { option, remove }. */
  chip?(props: { option: Option; remove: () => void }): unknown;
  /** Content displayed while consumer-provided work is pending. */
  loading?(props: Record<never, never>): unknown;
  /** Custom select-all content with aggregate selection state and a toggle action. */
  selectall?(props: { checked: boolean; indeterminate: boolean; toggle: () => void; disabled: boolean }): unknown;
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
const control = ref<HTMLInputElement | null>(null);
const filterInput = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);
const query = ref("");
const groupKey = createOptionGroupKey();
const section = useWlPt("multiselect", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedListId = `wl-multiselect-list-${useWlId()}`;
const listAttrs = computed(() => {
  const control = getWlControlProps(mergeWlAttrs(attrGroups.value.inputAttrs, section("hiddenInput")));
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
const allOptions = computed(() => optionSections(props.options, props.optionGroupChildren as TGroupChildren, props.optionGroupLabel, props.optionLabel, "").flatMap((group) => group.options.map((item) => item.option)));
const groups = computed(() => optionSections(props.options, props.optionGroupChildren as TGroupChildren, props.optionGroupLabel, props.optionLabel, props.filter ? query.value : ""));
const filtered = computed(() => groups.value.flatMap((group) => group.options.map((item) => item.option)));
const selectedOptions = computed(() => allOptions.value.filter((option) => model.value.some((value) => Object.is(valueOf(option), value))));
const selectable = computed(() => filtered.value.filter((option) => !isDisabled(option)).map(valueOf)
  .filter((value, index, values) => values.findIndex((current) => Object.is(current, value)) === index));
const selectedCount = computed(() => selectable.value.filter((value) => model.value.some((current) => Object.is(current, value))).length);
const allSelected = computed(() => selectable.value.length > 0 && selectedCount.value === selectable.value.length);
const partiallySelected = computed(() => selectedCount.value > 0 && !allSelected.value);
function toggleAll(): void {
  if (props.disabled || props.loading || !selectable.value.length) return;
  model.value = allSelected.value
    ? model.value.filter((value) => !selectable.value.some((current) => Object.is(current, value)))
    : [...model.value, ...selectable.value.filter((value) => !model.value.some((current) => Object.is(current, value)))];
}
const labels = computed(() => selectedOptions.value.map((option) => resolveOptionLabel(option, props.optionLabel)));
const label = computed(() => {
  if (!labels.value.length) return props.placeholder ?? "";
  if (props.maxSelectedLabels !== undefined && labels.value.length > props.maxSelectedLabels) return typeof locale.value.selectedItems === "string"
    ? formatWlLocaleText(locale.value.selectedItems, { count: labels.value.length })
    : wlPlural(locale.value.localeCode, labels.value.length, locale.value.selectedItems);
  return labels.value.join(", ");
});
function choose(index: number): void {
  if (props.disabled || props.loading) return;
  const option = filtered.value[index];
  if (option === undefined || isDisabled(option)) return;
  const value = valueOf(option);
  model.value = model.value.some((current) => Object.is(current, value))
    ? model.value.filter((current) => !Object.is(current, value))
    : [...model.value, value];
  nextTick(() => control.value?.focus());
}
function remove(value: WlOptionValue<Option, TResolver>): void {
  if (props.disabled) return;
  model.value = model.value.filter((current) => !Object.is(current, value));
}
const { active, optionId, activeDescendant, onKeydown: navigate } = useWlListbox({
  listId: () => String(listAttrs.value.id), count: () => filtered.value.length,
  isDisabled: (index) => props.loading || isDisabled(filtered.value[index] as Option),
  label: (index) => resolveOptionLabel(filtered.value[index] as Option, props.optionLabel),
  onSelect: choose, onClose: hide, list
});
function open(_event?: Event): void {
  if (props.disabled) return;
  anchor.value = root.value;
  show();
  active.value = 0;
  if (props.filter) nextTick(() => filterInput.value?.focus());
}
defineExpose<WlSelectionExpose>({ open, close: hide, focus: () => control.value?.focus() });
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!visible.value && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    open(event);
  } else {
    if (!visible.value && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) open(event);
    if (visible.value) navigate(event);
  }
}
useWlResultsAnnouncement({
  query: () => query.value,
  count: () => filtered.value.length,
  visible: () => visible.value,
  loading: () => props.loading
});
</script>

<template>
  <!-- Clicking empty wrapper space opens the same list as the native combobox keyboard handler. -->
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <div
    ref="root"
    v-bind="mergeWlAttrs(attrGroups.rootAttrs, section('root'))"
    class="wl-multiselect"
    :class="[`wl-multiselect--${size}`, { 'is-invalid': invalid, 'is-disabled': disabled, 'is-compact': density === 'compact' }]"
    data-wl="multiselect"
    :data-size="size"
    :data-density="density"
    :aria-busy="loading || undefined"
    @click="open"
  >
    <div v-bind="section('labelContainer')" class="wl-multiselect__label-container">
      <div v-if="display === 'chip' && selectedOptions.length" class="wl-multiselect__label">
        <span
          v-for="(option, index) in selectedOptions"
          :key="keyOf(option, index)"
          v-bind="mergeWlAttrs(section('chipItem'), section('pcChip.root'))"
          class="wl-multiselect__chip"
        >
          <slot name="chip" :option="option" :remove="() => remove(valueOf(option))">
            <span
              v-bind="section('pcChip.label')"
              class="wl-multiselect__chip-label"
            >{{ resolveOptionLabel(option, props.optionLabel) }}</span>
            <button
              v-bind="section('pcChip.removeIcon')"
              type="button"
              class="wl-multiselect__chip-remove"
              :disabled="disabled"
              :aria-label="formatWlLocaleText(locale.removeItem, { label: resolveOptionLabel(option, props.optionLabel) })"
              @click.stop="remove(valueOf(option))"
            >×</button>
          </slot>
        </span>
      </div>
      <span
        v-else
        v-bind="section('label')"
        class="wl-multiselect__label"
        :data-placeholder="!labels.length || undefined"
      ><slot name="value" :options="selectedOptions" :placeholder="placeholder">{{ label }}</slot></span>
      <input
        ref="control"
        v-bind="mergeWlAttrs(attrGroups.inputAttrs, section('hiddenInput'))"
        class="wl-multiselect__focus"
        type="text"
        readonly
        role="combobox"
        :aria-expanded="visible"
        aria-haspopup="listbox"
        :aria-invalid="invalid || undefined"
        :aria-controls="visible ? String(listAttrs.id) : undefined"
        :aria-activedescendant="visible ? activeDescendant : undefined"
        :disabled="disabled"
        :value="label"
        @keydown="onKeydown"
      />
    </div>
    <span v-bind="section('dropdown')" class="wl-multiselect__dropdown" aria-hidden="true">
      <WlIcon
        v-bind="section('dropdownIcon')"
        class="wl-multiselect__dropdown-icon"
        :name="loading ? 'refresh' : 'chevron-down'"
        :size="14"
      />
    </span>
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
        class="wl-overlay wl-multiselect-overlay"
        :style="style"
      >
        <div v-if="filter || showSelectAll || $slots.header" v-bind="section('header')" class="wl-multiselect__header">
          <slot name="header"></slot>
          <slot
            v-if="showSelectAll"
            name="selectall"
            :checked="allSelected"
            :indeterminate="partiallySelected"
            :toggle="toggleAll"
            :disabled="disabled || loading || !selectable.length"
          >
            <label v-bind="section('selectAll')" class="wl-multiselect__select-all">
              <input
                v-bind="section('selectAllInput')"
                type="checkbox"
                :checked="allSelected"
                :indeterminate="partiallySelected"
                :disabled="disabled || loading || !selectable.length"
                @change="toggleAll"
              />
              {{ locale.selectAll }}
            </label>
          </slot>
          <WlIcon
            v-if="filter"
            v-bind="section('filterIcon')"
            name="search"
            :size="14"
          />
          <input
            v-if="filter"
            ref="filterInput"
            v-bind="section('pcFilter.root')"
            v-model="query"
            class="wl-input wl-input--sm wl-multiselect__filter"
            type="search"
            :aria-label="locale.filter"
            role="combobox"
            :aria-expanded="visible"
            :aria-controls="visible ? String(listAttrs.id) : undefined"
            :aria-activedescendant="visible ? activeDescendant : undefined"
            @keydown="navigate"
          />
        </div>
        <div v-bind="section('listContainer')" class="wl-select__list-container">
          <div
            ref="list"
            v-bind="listAttrs"
            class="wl-select__list"
            role="listbox"
            aria-multiselectable="true"
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
                v-bind="section('option', {
                  focused: active === index, selected: model.some((value) => Object.is(value, valueOf(option)))
                })"
                :id="optionId(index)"
                :key="keyOf(option, index)"
                class="wl-select__option"
                role="option"
                :data-active="active === index"
                :aria-selected="model.some((value) => Object.is(value, valueOf(option)))"
                :aria-disabled="isDisabled(option) || undefined"
                tabindex="-1"
                @pointerdown.prevent
                @click="choose(index)"
              >
                <slot
                  name="option"
                  :option="option"
                  :index="index"
                  :selected="model.some((value) => Object.is(value, valueOf(option)))"
                  :active="active === index"
                >
                  <span v-bind="section('optionLabel')">{{ resolveOptionLabel(option, props.optionLabel) }}</span>
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
