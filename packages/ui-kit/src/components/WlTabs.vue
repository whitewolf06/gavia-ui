<script setup lang="ts" generic="Item extends WlTabItem = WlTabItem">
/** WlTabs public component contract.
 * @since 0.1.0
 * @slot panel - Panel content; scope: { item }.
 */
import { type ComponentPublicInstance, computed, type PropType, ref, shallowRef, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt, WlPtCallbackOptions } from "../pt-types";
import type { WlTabItem } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";
import { warnWlPtAlias } from "../utils/pt-aliases";
import { useWlRovingFocus } from "../utils/rovingFocus";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
import WlLink from "./WlLink.vue";

const props = withDefaults(
  defineProps<{
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * WlTabItem[]: { key, label, icon?, count? }.
     * @default []
     */
    items?: readonly Item[];
    /**
     * Layout direction and applicable arrow-key navigation direction.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    /**
     * Defer a tab panel's first render until it becomes active.
     * @default true
     */
    lazy?: boolean;
    /**
     * Keep a previously visited tab panel mounted while it is inactive.
     * @default false
     */
    keepAlive?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"tablist">;
  }>(),
  {
    items: () => [],
    orientation: "horizontal",
    lazy: true,
    keepAlive: false
  }
);

/** Key of the active tab; an empty string retains the initial unselected model.
 * Paired with update:modelValue.
 * @default ""
 */
const model = defineModel<NoInfer<Item["key"]> | "", never>({ type: String as PropType<Item["key"] | "">, default: "" });

defineSlots<{
  /** Panel content; scope: { item }. */
  panel?(props: { item: Item }): unknown; }>();

const selectedKey = computed(() => props.items.find((item) => item.key === model.value && !item.disabled)?.key
  ?? props.items.find((item) => !item.disabled)?.key ?? "");
const visited = shallowRef(new Set<Item["key"]>());
watch(selectedKey, (key) => {
  if (key && !visited.value.has(key)) visited.value = new Set([...visited.value, key]);
}, { immediate: true });
function renderPanel(item: Item): boolean {
  return !props.lazy || selectedKey.value === item.key || (props.keepAlive && visited.value.has(item.key));
}
function isLink(item: Item): boolean {
  return item.href !== undefined || item.to !== undefined;
}
function onUpdate(item: Item, event?: MouseEvent): void {
  if (event && (event.defaultPrevented || (isLink(item)
    && (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)))) return;
  if (!item.disabled) model.value = item.key;
}

const section = useWlPt("tablist", computed(() => props.pt));
function localPanelPt(legacy: "tabpanels" | "tabpanel", canonical: "panels" | "panel") {
  return computed(() => {
    const oldRoot = props.pt?.[legacy]?.root;
    const newRoot = props.pt?.[canonical]?.root;
    if (oldRoot === undefined && newRoot === undefined) return undefined;
    warnWlPtAlias(props.pt, legacy, canonical);
    return { root: (options: WlPtCallbackOptions) => mergeWlAttrs(
      typeof oldRoot === "function" ? oldRoot(options) : oldRoot ?? {},
      typeof newRoot === "function" ? newRoot(options) : newRoot ?? {}
    ) };
  });
}
const panelsSection = useWlPt("tabpanels", localPanelPt("tabpanels", "panels"));
const panelSection = useWlPt("tabpanel", localPanelPt("tabpanel", "panel"));
const buttons = ref<({ focus: () => void } | undefined)[]>([]);
function setTabRef(value: Element | ComponentPublicInstance | null, index: number): void {
  const element = value && "$el" in value ? value.$el : value;
  if (element instanceof HTMLElement) buttons.value[index] = element;
  else if (value && "focus" in value && typeof value.focus === "function") {
    const focus = value.focus;
    buttons.value[index] = { focus: () => focus() };
  } else buttons.value[index] = undefined;
}
const uid = `wl-tabs-${useWlId()}`;
const tabId = (index: number): string => `${uid}-tab-${index}`;
const panelId = (index: number): string => `${uid}-panel-${index}`;
const { active, tabIndex, onKeydown: navigate } = useWlRovingFocus({
  count: () => props.items.length,
  isDisabled: (index) => !props.items[index] || !!props.items[index]?.disabled,
  orientation: () => props.orientation,
  focus: (index) => buttons.value[index]?.focus()
});
watch(selectedKey, (key) => {
  active.value = props.items.findIndex((item) => item.key === key);
}, { immediate: true });
function onKeydown(event: KeyboardEvent, index: number): void {
  const arrows = props.orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
  if (![...arrows, "Home", "End"].includes(event.key)) return;
  active.value = index;
  navigate(event);
  if (event.defaultPrevented && props.items[active.value]) onUpdate(props.items[active.value]!);
}
</script>

<template>
  <div
    class="wl-tabs"
    :class="{ 'wl-tabs--vertical': orientation === 'vertical' }"
    data-wl="tabs"
    :data-orientation="orientation"
  >
    <div v-bind="section('content')" class="wl-tabs__content">
      <div
        v-bind="section('tabList')"
        class="wl-tabs__list"
        role="tablist"
        :aria-orientation="orientation"
      >
        <component
          :is="isLink(item) ? WlLink : 'button'"
          v-for="(item, index) in items"
          :id="tabId(index)"
          :key="item.key"
          :ref="(element: Element | ComponentPublicInstance | null) => setTabRef(element, index)"
          :type="isLink(item) ? undefined : 'button'"
          :href="isLink(item) ? item.href : undefined"
          :to="isLink(item) ? item.to : undefined"
          role="tab"
          :aria-selected="selectedKey === item.key"
          :aria-controls="panelId(index)"
          :tabindex="tabIndex(index)"
          :disabled="item.disabled"
          class="wl-tab"
          :class="{ 'is-active': selectedKey === item.key, 'is-disabled': item.disabled }"
          @click="onUpdate(item, $event)"
          @focus="active = index"
          @keydown="onKeydown($event, index)"
        >
          <WlIcon v-if="item.icon" :name="item.icon" :size="16" />
          <span class="wl-tab__label">{{ item.label }}</span>
          <span v-if="item.count !== undefined" class="wl-tab__count">{{ item.count }}</span>
        </component>
        <span v-bind="section('activeBar')" class="wl-tabs__active-bar" aria-hidden="true"></span>
      </div>
    </div>
    <div v-bind="panelsSection('root', { active: Boolean(selectedKey) })" class="wl-tabs__panels">
      <template v-for="(item, index) in items" :key="item.key">
        <div
          v-bind="panelSection('root', { active: selectedKey === item.key, selected: selectedKey === item.key, disabled: !!item.disabled })"
          :id="panelId(index)"
          class="wl-tabs__panel"
          role="tabpanel"
          :hidden="selectedKey !== item.key"
          :aria-labelledby="tabId(index)"
          tabindex="0"
        >
          <slot v-if="renderPanel(item)" name="panel" :item="item"></slot>
        </div>
      </template>
    </div>
  </div>
</template>
