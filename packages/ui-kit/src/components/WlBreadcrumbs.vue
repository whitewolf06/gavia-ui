<script setup lang="ts">
/** WlBreadcrumbs public component contract.
 * @since 0.1.0
 * @slot item - Custom item content.
 * @slot separator - Custom separator content.
 */
import { computed, nextTick, ref } from "vue";
import type { WlPt } from "../pt-types";
import type { WlBreadcrumbItem } from "../types";
import { useWlLocale, useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import WlLink from "./WlLink.vue";
const props = withDefaults(
  defineProps<{
    /**
     * WlBreadcrumbItem[]: { label, to?, href?, icon? }.
     * @default []
     */
    items?: readonly WlBreadcrumbItem[];
    /**
     * Text displayed between breadcrumb items.
     * @default "/"
     */
    separator?: string;
    /** Maximum visible breadcrumb items before collapsing the middle items. */
    maxItems?: number;
    /** Accessible name for the collapsed-items trigger. */
    collapseLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"breadcrumbs">;
  }>(),
  {
    items: () => [], separator: "/"
  }
);

defineSlots<{
  /** Custom breadcrumb item; receives the item, index and navigation state. */
  item?(props: { item: WlBreadcrumbItem; index: number; current: boolean }): unknown;
  /** Custom breadcrumb separator content. */
  separator?(props: { item: WlBreadcrumbItem; index: number }): unknown;
}>();
const locale = useWlLocale();
const root = ref<HTMLElement | null>(null);
const expanded = ref(false);
const keys = new WeakMap<WlBreadcrumbItem, symbol>();
const collapseKey = Symbol("collapsed-breadcrumbs");
function keyOf(item: WlBreadcrumbItem): string | number | symbol {
  if (item.key !== undefined) return item.key;
  let key = keys.get(item);
  if (!key) {
    key = Symbol("breadcrumb");
    keys.set(item, key);
  }
  return key;
}

interface BreadcrumbModelItem {
  label: string;
  href?: string;
  to?: unknown;
  icon?: WlBreadcrumbItem["icon"];
  current?: boolean;
  source: WlBreadcrumbItem;
  index: number;
  key: string | number | symbol;
  collapse?: boolean;
}

const allItems = computed<BreadcrumbModelItem[]>(() =>
  props.items.map((item, index) => ({
    label: item.label,
    href: index === props.items.length - 1 ? undefined : item.href,
    to: index === props.items.length - 1 ? undefined : item.to,
    icon: item.icon,
    current: index === props.items.length - 1,
    source: item, index, key: keyOf(item)
  }))
);
const model = computed(() => {
  const max = props.maxItems !== undefined && Number.isFinite(props.maxItems) ? Math.max(3, Math.floor(props.maxItems)) : Infinity;
  if (expanded.value || allItems.value.length <= max) return allItems.value;
  return [allItems.value[0]!, { ...allItems.value[1]!, collapse: true, key: collapseKey }, ...allItems.value.slice(-(max - 2))];
});
async function showAll(): Promise<void> {
  expanded.value = true;
  await nextTick();
  const first = root.value?.querySelector<HTMLElement>('[data-breadcrumb-index="1"]');
  (first?.querySelector<HTMLElement>("a[href], button") ?? first)?.focus();
}
const section = useWlPt("breadcrumbs", computed(() => props.pt));
</script>

<template>
  <nav
    ref="root"
    v-bind="section('root')"
    class="wl-breadcrumbs"
    :aria-label="locale.breadcrumbs"
    data-wl="breadcrumbs"
  >
    <ol v-bind="section('list')" class="wl-breadcrumbs__list">
      <li
        v-for="(item, index) in model"
        :key="item.key"
        v-bind="section('item')"
        class="wl-breadcrumbs__item"
        :data-breadcrumb-index="item.index"
        tabindex="-1"
      >
        <button
          v-if="item.collapse"
          v-bind="section('collapseButton')"
          type="button"
          class="wl-breadcrumbs__collapse"
          :aria-label="collapseLabel ?? locale.showBreadcrumbs"
          :aria-expanded="false"
          @click="showAll"
        >…</button>
        <span v-else-if="item.current" class="wl-breadcrumbs__link is-current" aria-current="page">
          <slot
            name="item"
            :item="item.source"
            :index="item.index"
            :current="true"
          >
            <WlIcon
              v-if="item.icon"
              :name="item.icon"
              :size="14"
              class="wl-breadcrumbs__icon"
            />
            <span class="wl-breadcrumbs__label">{{ item.label }}</span>
          </slot>
        </span>
        <WlLink
          v-else
          :href="item.href"
          :to="item.to"
          class="wl-breadcrumbs__link"
        >
          <slot
            name="item"
            :item="item.source"
            :index="item.index"
            :current="false"
          >
            <WlIcon
              v-if="item.icon"
              :name="item.icon"
              :size="14"
              class="wl-breadcrumbs__icon"
            />
            <span class="wl-breadcrumbs__label">{{ item.label }}</span>
          </slot>
        </WlLink>
        <span
          v-if="index < model.length - 1"
          v-bind="section('separator')"
          class="wl-breadcrumbs__sep"
          aria-hidden="true"
        ><slot name="separator" :item="item.source" :index="item.index">{{ separator }}</slot></span>
      </li>
    </ol>
  </nav>
</template>
