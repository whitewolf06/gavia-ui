<script setup lang="ts" generic="Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>">
import { computed, ref, useAttrs, type PropType, type Ref } from "vue";
import type { WlDensity } from "../types";
import type { WlSidebarGroup, WlSidebarItem, WlSidebarExpose } from "../navigation-types";
import type { WlNoModelModifiers } from "../model-types";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import WlNavItem from "./WlNavItem.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    groups?: readonly (WlSidebarGroup<Item> & Group)[];
    modelModifiers?: WlNoModelModifiers;
    pinnedModifiers?: WlNoModelModifiers;
    mobileOpenModifiers?: WlNoModelModifiers;
    footerItems?: readonly Item[];
    brand?: string;
    brandMark?: string;
    ariaLabel?: string;
    collapsible?: boolean;
    expandOnHover?: boolean;
    showPin?: boolean;
    pinLabel?: string;
    unpinLabel?: string;
    density?: WlDensity;
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
  select: [item: Item, group?: Group];
}>();

defineSlots<{
  brand?(props: {}): unknown;
  "brand-mark"?(props: {}): unknown;
  item?(props: { key: Item["key"]; item: Item; group: Group; active: boolean; expanded: boolean; select: () => void }): unknown;
  "footer-item"?(props: { key: Item["key"]; item: Item; active: boolean; expanded: boolean; select: () => void }): unknown;
  footer?(props: { expanded: boolean }): unknown;
}>();

// The empty default stabilizes generated emits; never bridges Vue 3.4/3.5 default typing.
const activeKey: Ref<Item["key"] | undefined> = defineModel<NoInfer<Item["key"]>, never>({ type: String as PropType<Item["key"]>, default: undefined as never });
const pinned = defineModel<boolean, never>("pinned", { default: false });
const mobileOpen = defineModel<boolean, never>("mobileOpen", { default: false });
const hovered = ref(false);
const asideRef = ref<HTMLElement | null>(null);
const attrs = useAttrs();

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

const { requestClose: closeMobile } = useOverlayLifecycle({
  visible: mobileOpen,
  container: asideRef,
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
  <div
    v-bind="attrs"
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
  >
    <aside ref="asideRef" class="wl-sidebar" :aria-label="ariaLabel" tabindex="-1">
      <div class="wl-sidebar__inner">
        <div v-if="brand || brandMark || $slots.brand || $slots['brand-mark']" class="wl-sidebar__brand">
          <slot name="brand-mark">
            <span v-if="brandMark" class="wl-sidebar__brand-mark">{{ brandMark }}</span>
          </slot>
          <span v-show="expanded" class="wl-sidebar__brand-name">
            <slot name="brand">{{ brand }}</slot>
          </span>
        </div>

        <nav class="wl-sidebar__nav">
          <section v-for="group in groups" :key="group.id" class="wl-sidebar__group">
            <div v-if="group.separator" class="wl-sidebar__divider" />
            <div v-if="group.label" v-show="expanded" class="wl-sidebar__group-label">
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
                :label="item.label"
                :icon="item.icon"
                :badge="item.badge"
                :href="item.href"
                :disabled="item.disabled"
                :active="activeKey === item.key"
                :collapsed="!expanded"
                @click="select(item, group)"
              />
            </slot>
          </section>
        </nav>

        <div class="wl-sidebar__footer">
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
              :label="item.label"
              :icon="item.icon"
              :badge="item.badge"
              :href="item.href"
              :disabled="item.disabled"
              :active="activeKey === item.key"
              :collapsed="!expanded"
              @click="select(item)"
            />
          </slot>

          <slot name="footer" :expanded="expanded" />

          <WlNavItem
            v-if="collapsible && showPin"
            :label="pinned ? unpinLabel : pinLabel"
            icon="panel"
            :collapsed="!expanded"
            @click="togglePinned"
          />
        </div>
      </div>
    </aside>

    <button
      v-if="mobileOpen"
      type="button"
      class="wl-sidebar__backdrop"
      aria-label="Закрыть навигацию"
      @click="closeMobile"
    />
  </div>
</template>
