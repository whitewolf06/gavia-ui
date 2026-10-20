<script setup lang="ts" generic="Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>">
/** WlSidebar public component contract.
 * @since 0.2.0
 * @slot brand-mark - Custom brand mark.
 * @slot brand - Custom brand name.
 * @slot item - Main group item; scope { item, group, active, expanded, select }.
 * @slot footer-item - Footer item; scope { item, active, expanded, select }.
 * @slot footer - Additional footer; scope { expanded }.
 */
import { computed, type PropType, ref, type Ref, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlSidebarExpose, WlSidebarGroup, WlSidebarItem } from "../navigation-types";
import type { WlPt } from "../pt-types";
import type { WlDensity } from "../types";
import { mergeWlAttrs, useWlLocale, useWlLocaleText, useWlPt } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import WlNavItem from "./WlNavItem.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /**
     * WlSidebarGroup[]: sections with WlSidebarItem[] and an optional separator.
     * @default []
     */
    groups?: readonly (WlSidebarGroup<Item> & Group)[];
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Modifier contract for pinned state; built-in modifiers are unsupported. */
    pinnedModifiers?: WlNoModelModifiers;
    /** Modifier contract for the mobile-open model; built-in modifiers are unsupported. */
    mobileOpenModifiers?: WlNoModelModifiers;
    /**
     * WlSidebarItem[] for the pinned bottom region.
     * @default []
     */
    footerItems?: readonly Item[];
    /**
     * Product name.
     * @default ""
     */
    brand?: string;
    /**
     * Short text brand mark.
     * @default ""
     */
    brandMark?: string;
    /**
     * Accessible name when an external label is not referenced.
     * @default "Основная навигация"
     */
    ariaLabel?: string;
    /**
     * Allow the sidebar to collapse to its compact state.
     * @default true
     */
    collapsible?: boolean;
    /**
     * Temporarily expand an unpinned sidebar on pointer hover.
     * @default true
     */
    expandOnHover?: boolean;
    /**
     * Show the sidebar pin/unpin action.
     * @default true
     */
    showPin?: boolean;
    /**
     * Accessible text for pinning the sidebar open.
     * @default "Закрепить панель"
     */
    pinLabel?: string;
    /**
     * Accessible text for releasing the sidebar's pinned state.
     * @default "Открепить панель"
     */
    unpinLabel?: string;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"sidebar">;
  }>(),
  {
    groups: () => [],
    footerItems: () => [],
    brand: "",
    brandMark: "",
    ariaLabel: "Основная навигация",
    collapsible: true,
    expandOnHover: true,
    showPin: true,
    pinLabel: "Закрепить панель",
    unpinLabel: "Открепить панель",
    density: "default"
  }
);
const emit = defineEmits<{
  /** Item selected. The application handles navigation. */
  select: [item: Item, group?: Group];
}>();
// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
/** Key of the active sidebar item.
 * Paired with update:modelValue.
 */
const activeKey: Ref<Item["key"] | undefined> = defineModel<NoInfer<Item["key"]>, never>({ type: String as PropType<Item["key"]>, default: undefined as never });
/** Whether the sidebar remains expanded.
 * Paired with update:pinned.
 * @default false
 */
const pinned = defineModel<boolean, never>("pinned", { default: false });
/** Whether the mobile sidebar is open.
 * Paired with update:mobileOpen.
 * @default false
 */
const mobileOpen = defineModel<boolean, never>("mobileOpen", { default: false });
defineSlots<{
  /** Custom brand name. */
  brand?(props: {}): unknown;
  /** Custom brand mark. */
  "brand-mark"?(props: {}): unknown;
  /** Main group item; scope { item, group, active, expanded, select }. */
  item?(props: { key: Item["key"]; item: Item; group: Group; active: boolean; expanded: boolean; select: () => void }): unknown;
  /** Footer item; scope { item, active, expanded, select }. */
  "footer-item"?(props: { key: Item["key"]; item: Item; active: boolean; expanded: boolean; select: () => void }): unknown;
  /** Additional footer; scope { expanded }. */
  footer?(props: { expanded: boolean }): unknown;
}>();
const localeText = useWlLocaleText();
const locale = useWlLocale();

const hovered = ref(false);
const asideRef = ref<HTMLElement | null>(null);
const attrs = useAttrs();
const section = useWlPt("sidebar", computed(() => props.pt));

const expanded = computed(
  () => !props.collapsible || pinned.value || hovered.value || mobileOpen.value
);

function select(item: Item, group?: Group): void {
  if (item.disabled) return;
  activeKey.value = item.key;
  emit("select", item, group);
  if (mobileOpen.value) mobileOpen.value = false;
}

function togglePinned(): void {
  pinned.value = !pinned.value;
}

function onFocusOut(event: FocusEvent): void {
  if (event.currentTarget instanceof HTMLElement
    && !event.currentTarget.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) {
    hovered.value = false;
  }
}

const { requestClose: closeMobile } = useOverlayLifecycle({
  visible: mobileOpen,
  container: asideRef,
  modal: () => mobileOpen.value,
  backdrop: () => asideRef.value?.parentElement?.querySelector<HTMLElement>(".wl-sidebar__backdrop") ?? null,
  lockScroll: true
});

defineExpose({
  openMobile: () => {
    mobileOpen.value = true;
  },
  closeMobile,
  togglePinned
} satisfies WlSidebarExpose);
</script>

<template>
  <!-- Focus entry/exit mirrors hover expansion while native navigation controls own focus. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    v-bind="mergeWlAttrs(section('root'), attrs)"
    class="wl-sidebar-shell"
    :class="[
      expanded && 'is-expanded',
      pinned && 'is-pinned',
      mobileOpen && 'is-mobile-open',
      density === 'compact' && 'is-compact'
    ]"
    data-wl="sidebar"
    :data-density="density"
    :data-expanded="expanded"
    :data-pinned="pinned"
    @mouseenter="expandOnHover && (hovered = true)"
    @mouseleave="hovered = false"
    @focusin="expandOnHover && (hovered = true)"
    @focusout="onFocusOut"
  >
    <aside
      ref="asideRef"
      v-bind="section('aside')"
      class="wl-sidebar"
      :role="mobileOpen ? 'dialog' : undefined"
      :aria-modal="mobileOpen || undefined"
      :aria-label="localeText('ariaLabel', ariaLabel, 'mainNavigation')"
      tabindex="-1"
    >
      <div v-bind="section('inner')" class="wl-sidebar__inner">
        <div v-if="brand || brandMark || $slots.brand || $slots['brand-mark']" v-bind="section('brand')" class="wl-sidebar__brand">
          <slot name="brand-mark">
            <span v-if="brandMark" v-bind="section('brandMark')" class="wl-sidebar__brand-mark">{{ brandMark }}</span>
          </slot>
          <span v-show="expanded" class="wl-sidebar__brand-name">
            <slot name="brand">{{ brand }}</slot>
          </span>
        </div>

        <nav v-bind="section('nav')" class="wl-sidebar__nav">
          <section
            v-for="group in groups"
            :key="group.id"
            v-bind="section('group', { group })"
            class="wl-sidebar__group"
          >
            <div v-if="group.separator" v-bind="section('divider', { group })" class="wl-sidebar__divider"></div>
            <div
              v-if="group.label"
              v-show="expanded"
              v-bind="section('groupLabel', { group })"
              class="wl-sidebar__group-label"
            >
              {{ group.label }}
            </div>
            <slot
              v-for="item in group.items"
              :key="item.key"
              name="item"
              :item="item"
              :group="group"
              :active="activeKey === item.key"
              :expanded="expanded"
              :select="() => select(item, group)"
            >
              <WlNavItem
                v-bind="section('item', { active: activeKey === item.key, disabled: !!item.disabled, expanded, item, group })"
                :label="item.label"
                :icon="item.icon"
                :badge="item.badge"
                :href="item.href"
                :to="item.to"
                :disabled="item.disabled"
                :active="activeKey === item.key"
                :collapsed="!expanded"
                @click="select(item, group)"
              />
            </slot>
          </section>
        </nav>

        <div v-bind="section('footer')" class="wl-sidebar__footer">
          <slot
            v-for="item in footerItems"
            :key="item.key"
            name="footer-item"
            :item="item"
            :active="activeKey === item.key"
            :expanded="expanded"
            :select="() => select(item)"
          >
            <WlNavItem
              v-bind="section('footerItem', { active: activeKey === item.key, disabled: !!item.disabled, expanded, item })"
              :label="item.label"
              :icon="item.icon"
              :badge="item.badge"
              :href="item.href"
              :to="item.to"
              :disabled="item.disabled"
              :active="activeKey === item.key"
              :collapsed="!expanded"
              @click="select(item)"
            />
          </slot>

          <slot name="footer" :expanded="expanded"></slot>

          <WlNavItem
            v-if="collapsible && showPin"
            v-bind="section('pinButton', { active: pinned, expanded })"
            :label="pinned ? localeText('unpinLabel', unpinLabel, 'unpinSidebar') : localeText('pinLabel', pinLabel, 'pinSidebar')"
            icon="panel"
            :collapsed="!expanded"
            @click="togglePinned"
          />
        </div>
      </div>
    </aside>

    <button
      v-if="mobileOpen"
      v-bind="section('backdrop')"
      type="button"
      class="wl-sidebar__backdrop"
      :aria-label="locale.closeNavigation"
      @click="closeMobile"
    ></button>
  </div>
</template>
