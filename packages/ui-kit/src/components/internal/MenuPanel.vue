<script setup lang="ts" generic="Item extends WlMenuItemBase = WlMenuItem">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import type { WlMenuCheckEvent, WlMenuItem, WlMenuItemBase } from "../../navigation-types";
import type { WlPt } from "../../pt-types";
import { useWlTypeahead } from "../../composables/useWlTypeahead";
import { useWlMotion, useWlPt } from "../../config";
import { useAnchoredOverlay } from "../../utils/anchoredOverlay";
import { type MenuDismissReason, type MenuEntry, menuItemDisabled, type MenuPanelExpose } from "../../utils/menu";
import { ownsOverlayTarget } from "../../utils/overlayStack";
import { markOverlayLeaving, restoreOverlayEntering } from "../../utils/overlayTransition";
import { useWlRovingFocus } from "../../utils/rovingFocus";
import WlIcon from "../WlIcon.vue";
import WlLink from "../WlLink.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  items: readonly MenuEntry<Item>[];
  id: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  submenu?: boolean;
  motion?: boolean;
  pt?: WlPt<"menu">;
}>(), { submenu: false, motion: undefined });
const emit = defineEmits<{
  check: [event: WlMenuCheckEvent<Item>];
  dismiss: [reason: MenuDismissReason];
  closeParent: [];
}>();
const list = ref<HTMLElement | null>(null);
const section = useWlPt("menu", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const child = ref<MenuPanelExpose | null>(null);
const openIndex = ref(-1);
let focusChild = false;
let timer: ReturnType<typeof setTimeout> | undefined;
function cancelTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}
const { visible, anchor, panel, style, show, hide } = useAnchoredOverlay({
  placement: "right", align: "start", offset: 4
});
// Recursive component refs may be assigned after an anchored layer's first nextTick.
watch([child, visible], ([instance, shown]) => {
  if (instance && shown && focusChild) instance.focusFirst();
}, { flush: "post" });
const children = computed(() => props.items[openIndex.value]?.items ?? []);
const radioPositions = computed(() => {
  const groups = new Map<string | undefined, MenuEntry<Item>[]>();
  for (const item of props.items) {
    if (item.type !== "radio") continue;
    const group = groups.get(item.group) ?? [];
    group.push(item);
    groups.set(item.group, group);
  }
  const positions = new Map<MenuEntry<Item>, { position: number; size: number }>();
  for (const group of groups.values()) group.forEach((item, index) => positions.set(item, { position: index + 1, size: group.length }));
  return positions;
});
const childId = computed(() => `${props.id}-submenu-${openIndex.value}`);
const childLayer = { visible: () => visible.value, panel: () => panel.value, anchor: () => anchor.value };
function itemElement(index: number): HTMLElement | undefined {
  return list.value?.querySelector<HTMLElement>(`[data-wl-menu-index="${index}"]`) ?? undefined;
}
function focusItem(index: number): void {
  if (index >= 0) itemElement(index)?.focus();
  else list.value?.focus();
}
const { active, tabIndex, onKeydown: navigate } = useWlRovingFocus({
  count: () => props.items.length, isDisabled: (index) => menuItemDisabled(props.items[index]), focus: focusItem
});
const typeahead = useWlTypeahead({
  count: () => props.items.length, label: (index) => props.items[index]?.label ?? "", active: () => active.value,
  isDisabled: (index) => menuItemDisabled(props.items[index]),
  onMatch: (index) => {
    active.value = index;
    focusItem(index);
  }
});
function focusFirst(): void {
  active.value = props.items.findIndex((item) => !menuItemDisabled(item));
  focusItem(active.value);
}
function focusLast(): void {
  active.value = -1;
  for (let index = props.items.length - 1; index >= 0; index--) {
    if (!menuItemDisabled(props.items[index])) {
      active.value = index;
      break;
    }
  }
  focusItem(active.value);
}
function closeChildren(restoreFocus = false): boolean {
  cancelTimer();
  const wasOpen = visible.value;
  const trigger = anchor.value;
  hide();
  if (wasOpen && restoreFocus) nextTick(() => trigger?.focus());
  return wasOpen;
}
function hasChildren(item: MenuEntry<Item>): boolean {
  return !!item.items?.length;
}
function openChild(index: number, focus: boolean): void {
  const item = props.items[index];
  if (!item || menuItemDisabled(item) || !hasChildren(item)) return;
  cancelTimer();
  focusChild = focus;
  if (visible.value && openIndex.value === index) {
    if (focus) child.value?.focusFirst();
    return;
  }
  hide();
  openIndex.value = index;
  anchor.value = itemElement(index) ?? null;
  show();
}
function onItemFocus(index: number): void {
  active.value = index;
  cancelTimer();
  if (visible.value && openIndex.value !== index) closeChildren();
}
function hover(index: number): void {
  cancelTimer();
  const item = props.items[index];
  // Pointer previews never move keyboard focus or close its active descendant.
  if (document.activeElement instanceof Node && ownsOverlayTarget(childLayer, document.activeElement)) return;
  timer = setTimeout(() => {
    timer = undefined;
    if (item && !menuItemDisabled(item) && hasChildren(item)) openChild(index, false);
    else closeChildren();
  }, 150);
}
function leave(event: MouseEvent | FocusEvent): void {
  cancelTimer();
  if (!visible.value || (event.relatedTarget instanceof Node && ownsOverlayTarget(childLayer, event.relatedTarget))) return;
  timer = setTimeout(() => {
    timer = undefined;
    if (!(document.activeElement instanceof Node && ownsOverlayTarget(childLayer, document.activeElement))) closeChildren();
  }, 150);
}
function activate(item: MenuEntry<Item>, index: number, event: MouseEvent): void {
  if (menuItemDisabled(item)) {
    event.preventDefault();
    return;
  }
  if (hasChildren(item)) {
    event.preventDefault();
    openChild(index, true);
    return;
  }
  if (item.type === "checkbox" || item.type === "radio") {
    event.preventDefault();
    const checked = item.type === "radio" || item.checked !== true;
    if (checked !== item.checked) {
      item.onCheckedChange?.(checked, item);
      emit("check", { item, checked });
    }
  } else if (item.href === undefined && item.to === undefined) event.preventDefault();
  item.command?.(item);
  emit("dismiss", "select");
}
function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) return;
  if (event.key === "Tab") {
    emit("dismiss", "tab");
    return;
  }
  if (event.key === "Escape" && visible.value) {
    event.preventDefault();
    event.stopPropagation();
    closeChildren(true);
  } else if ((event.key === "ArrowLeft" || event.key === "Escape") && props.submenu) {
    event.preventDefault();
    event.stopPropagation();
    emit("closeParent");
  } else if (event.key === "ArrowRight") {
    const item = props.items[active.value];
    if (item && hasChildren(item)) {
      event.preventDefault();
      openChild(active.value, true);
    }
  } else if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLElement) {
    const target = event.target.closest<HTMLElement>("[data-wl-menu-index]");
    if (!target) return;
    if ((event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) && target.matches("a[href]")) return;
    event.preventDefault();
    target.click();
  } else {
    navigate(event);
    typeahead.onKeydown(event);
  }
}
onBeforeUnmount(cancelTimer);
defineExpose({ focusFirst, focusLast, focusActive: () => focusItem(active.value), closeChildren } satisfies MenuPanelExpose);
</script>

<template>
  <ul
    v-bind="section('list')"
    :id="id"
    ref="list"
    class="wl-menu__list"
    role="menu"
    tabindex="-1"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @keydown="onKeydown"
    @mouseleave="leave"
    @focusout="leave"
  >
    <!-- Pointer opening and bubbled focus track the native menu link rendered inside this row. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <li
      v-for="(item, index) in items"
      :key="item.key ?? index"
      v-bind="section('item')"
      class="wl-menu__item"
      :role="item.separator ? 'separator' : 'none'"
      @mouseenter="hover(index)"
      @focusin="onItemFocus(index)"
    >
      <div v-if="item.header !== undefined" v-bind="section('submenuLabel')" class="wl-menu__head">{{ item.header }}</div>
      <div v-else-if="item.separator" v-bind="section('separator')" class="wl-menu__sep"></div>
      <div v-else v-bind="section('itemContent')" class="wl-menu__item-content">
        <WlLink
          v-bind="section('itemLink')"
          :id="`${id}-item-${index}`"
          :href="hasChildren(item) ? undefined : item.href"
          :to="hasChildren(item) ? undefined : item.to"
          :target="item.target"
          :disabled="item.disabled"
          class="wl-menu__link"
          :class="{ 'is-danger': item.danger, 'is-disabled': item.disabled }"
          :role="item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem'"
          :aria-checked="item.type === 'checkbox' ? item.checked ?? false : item.type === 'radio' ? item.checked === true : undefined"
          :aria-posinset="radioPositions.get(item)?.position"
          :aria-setsize="radioPositions.get(item)?.size"
          :aria-disabled="item.disabled || undefined"
          :aria-haspopup="hasChildren(item) ? 'menu' : undefined"
          :aria-expanded="hasChildren(item) ? visible && openIndex === index : undefined"
          :aria-controls="hasChildren(item) && visible && openIndex === index ? childId : undefined"
          :tabindex="tabIndex(index)"
          :data-wl-menu-index="index"
          @click="activate(item, index, $event)"
        >
          <WlIcon
            v-if="item.type === 'checkbox' || item.type === 'radio'"
            v-bind="section('checkIcon')"
            class="wl-menu__check"
            :class="{ 'wl-menu__check--hidden': item.type === 'radio' ? item.checked !== true : !item.checked }"
            :name="item.type === 'checkbox' && item.checked === 'mixed' ? 'minus' : 'check'"
            :size="16"
          />
          <WlIcon
            v-else-if="item.icon"
            :name="item.icon"
            :size="16"
            class="wl-menu__icon"
          />
          <span class="wl-menu__label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="wl-menu__meta">{{ item.shortcut }}</span>
          <WlIcon
            v-if="hasChildren(item)"
            v-bind="section('submenuIcon')"
            name="chevron-right"
            :size="14"
            class="wl-menu__submenu-icon"
          />
        </WlLink>
      </div>
    </li>
  </ul>
  <Teleport to="body">
    <Transition
      name="wl-pop-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <!-- Focus entry/exit mirrors hover to retain the submenu while either region is active. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="visible"
        ref="panel"
        v-bind="section('root')"
        class="wl-menu wl-menu--submenu"
        :style="style"
        data-wl="menu-submenu"
        @mouseenter="cancelTimer"
        @mouseleave="leave"
        @focusin="cancelTimer"
        @focusout="leave"
      >
        <MenuPanel
          :id="childId"
          ref="child"
          :key="openIndex"
          :items="children"
          :aria-labelledby="`${id}-item-${openIndex}`"
          submenu
          :motion="motion"
          :pt="pt"
          @check="emit('check', $event)"
          @dismiss="emit('dismiss', $event)"
          @close-parent="closeChildren(true)"
        />
      </div>
    </Transition>
  </Teleport>
</template>
