<script setup lang="ts" generic="Item extends WlCommandPaletteItem = WlCommandPaletteItem, Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>">
import { useWlId } from "../utils/useWlId";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch
} from "vue";
import { useWlMotion, useWlLocaleText } from "../config";
import type { WlDensity, WlSizeSm } from "../types";
import type { WlCommandPaletteGroup, WlCommandPaletteItem, WlCommandPaletteExpose } from "../navigation-types";
import type { WlNoModelModifiers, WlTextModelModifiers } from "../model-types";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";
const localeText = useWlLocaleText();

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    groups?: readonly (WlCommandPaletteGroup<Item> & Group)[];
    visibleModifiers?: WlNoModelModifiers;
    queryModifiers?: WlTextModelModifiers;
    placeholder?: string;
    emptyText?: string;
    loadingText?: string;
    ariaLabel?: string;
    filter?: boolean;
    shortcut?: boolean;
    closeOnSelect?: boolean;
    loading?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    motion?: boolean;
  }>(),
  {
    groups: () => [],
    placeholder: "Поиск или переход…",
    emptyText: "Ничего не найдено",
    loadingText: "Поиск…",
    ariaLabel: "Командная палитра",
    filter: true,
    shortcut: false,
    closeOnSelect: true,
    loading: false,
    disabled: false,
    size: "md",
    density: "default",
    motion: undefined
  }
);

const attrs = useAttrs();
const motion = useWlMotion(computed(() => props.motion));

const emit = defineEmits<{
  search: [query: string];
  select: [item: Item, group: Group];
  open: [];
  close: [];
}>();

defineSlots<{
  group?(props: { group: Group }): unknown;
  item?(props: { item: Item; group: Group; active: boolean }): unknown;
  "item-icon"?(props: { item: Item; group: Group }): unknown;
  empty?(props: { query: string }): unknown;
  footer?(props: {}): unknown;
}>();

const visible = defineModel<boolean, never>("visible", { default: false });
const query = defineModel<string, "trim">("query", { default: "" });
const inputRef = ref<HTMLInputElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const listboxId = `wl-command-palette-list-${useWlId()}`;

interface VisibleGroup {
  group: Group;
  items: Item[];
}

interface VisibleItem {
  item: Item;
  group: Group;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function matches(
  item: Item,
  normalizedQuery: string,
  shouldFilter: boolean
): boolean {
  if (!normalizedQuery || !shouldFilter) return true;
  return normalize(
    [item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(" ")
  ).includes(normalizedQuery);
}

const normalizedQuery = computed(() => normalize(query.value));

const visibleGroups = computed<VisibleGroup[]>(() =>
  props.groups.flatMap((group) => {
    if (!normalizedQuery.value && group.showWhenEmpty === false) return [];
    const shouldFilter = group.filter ?? props.filter;
    const items = group.items.filter((item) =>
      matches(item, normalizedQuery.value, shouldFilter)
    );
    return items.length ? [{ group, items }] : [];
  })
);

const visibleItems = computed<VisibleItem[]>(() =>
  visibleGroups.value.flatMap(({ group, items }) => items.map((item) => ({ item, group })))
);

const selectableItems = computed(() => visibleItems.value.filter(({ item }) => !item.disabled));
const hasResults = computed(() => visibleItems.value.length > 0);

function activeDescendant(): string | undefined {
  const active = selectableItems.value[activeIndex.value];
  return active ? optionId(active.item) : undefined;
}

watch(() => query.value, (value) => {
  activeIndex.value = 0;
  emit("search", value);
});

const { requestClose: close } = useOverlayLifecycle({
  visible,
  container: panelRef,
  enabled: () => !props.disabled,
  initialFocus: () => inputRef.value,
  lockScroll: true,
  onBeforeOpen: () => {
    activeIndex.value = 0;
  },
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && visible.value) close();
  }
);

watch(selectableItems, (items) => {
  if (!items.length) {
    activeIndex.value = 0;
  } else if (activeIndex.value >= items.length) {
    activeIndex.value = items.length - 1;
  }
});

function select(item: Item, group: Group): void {
  if (item.disabled) return;
  emit("select", item, group);
  if (props.closeOnSelect) close();
}

function isActive(item: Item): boolean {
  return selectableItems.value[activeIndex.value]?.item === item;
}

function optionId(item: Item): string {
  const index = visibleItems.value.findIndex((entry) => entry.item === item);
  return `${listboxId}-option-${Math.max(0, index)}`;
}

async function moveActive(direction: 1 | -1): Promise<void> {
  const count = selectableItems.value.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + direction + count) % count;
  await nextTick();
  const activeItem = panelRef.value?.querySelector<HTMLElement>(
    '.wl-command-palette__item[aria-selected="true"]'
  );
  if (typeof activeItem?.scrollIntoView === "function") {
    activeItem.scrollIntoView({ block: "nearest" });
  }
}

function selectActive(): void {
  const active = selectableItems.value[activeIndex.value];
  if (active) select(active.item, active.group);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveActive(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveActive(-1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    selectActive();
  }
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (!props.shortcut || props.disabled) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    visible.value = !visible.value;
  }
}

onMounted(() => document.addEventListener("keydown", onGlobalKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onGlobalKeydown));

defineExpose({
  focus: () => inputRef.value?.focus(),
  open: () => {
    if (!props.disabled) visible.value = true;
  },
  close
} satisfies WlCommandPaletteExpose);
</script>

<template>
  <Teleport to="body">
    <Transition name="wl-command-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div
      v-if="visible"
      v-bind="attrs"
      class="wl-command-palette"
      :class="[
        `wl-command-palette--${size}`,
        density === 'compact' && 'is-compact',
        loading && 'is-loading'
      ]"
      role="dialog"
      aria-modal="true"
      :aria-label="localeText('ariaLabel', ariaLabel, 'commandPalette')"
      data-wl="command-palette"
      :data-size="size"
      :data-density="density"
      @mousedown.self="close"
    >
      <div ref="panelRef" class="wl-command-palette__panel" @keydown="onKeydown">
        <div class="wl-command-palette__search">
          <WlIcon name="search" :size="18" class="wl-command-palette__search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            class="wl-command-palette__input"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            :aria-label="localeText('ariaLabel', ariaLabel, 'commandPalette')"
            :aria-controls="listboxId"
            :aria-activedescendant="activeDescendant()"
            :aria-expanded="visible"
            :placeholder="localeText('placeholder', placeholder, 'searchPlaceholder')"
            :disabled="disabled"
            autocomplete="off"
          />
          <span class="wl-command-palette__key" aria-hidden="true">Esc</span>
        </div>

        <div :id="listboxId" class="wl-command-palette__list" role="listbox">
          <template v-if="hasResults">
            <section
              v-for="{ group, items } in visibleGroups"
              :key="group.id"
              class="wl-command-palette__group"
              role="group"
              :aria-label="group.label"
            >
              <div class="wl-command-palette__group-label">
                <slot name="group" :group="group">{{ group.label }}</slot>
              </div>
              <component
                :is="item.href ? 'a' : 'button'"
                v-for="item in items"
                :key="item.id"
                :href="item.disabled ? undefined : item.href"
                :target="item.href ? item.target : undefined"
                :type="item.href ? undefined : 'button'"
                class="wl-command-palette__item"
                :class="{ 'is-active': isActive(item), 'is-disabled': item.disabled }"
                :id="optionId(item)"
                role="option"
                :aria-selected="isActive(item)"
                :aria-disabled="item.disabled || undefined"
                @mouseenter="!item.disabled && (activeIndex = selectableItems.findIndex((entry) => entry.item === item))"
                @click="select(item, group)"
              >
                <slot name="item" :item="item" :group="group" :active="isActive(item)">
                  <span class="wl-command-palette__item-icon">
                    <slot name="item-icon" :item="item" :group="group">
                      <WlIcon v-if="item.icon" :name="item.icon" :size="17" />
                    </slot>
                  </span>
                  <span class="wl-command-palette__item-content">
                    <span class="wl-command-palette__item-label">{{ item.label }}</span>
                    <span v-if="item.description" class="wl-command-palette__item-description">
                      {{ item.description }}
                    </span>
                  </span>
                  <span v-if="item.shortcut" class="wl-command-palette__key">{{ item.shortcut }}</span>
                </slot>
              </component>
            </section>
          </template>

          <div v-else-if="loading" class="wl-command-palette__status" role="status">
            <span class="wl-command-palette__spinner" aria-hidden="true" />
            <span>{{ localeText('loadingText', loadingText, 'searching') }}</span>
          </div>
          <div v-else class="wl-command-palette__status">
            <slot name="empty" :query="query">{{ localeText('emptyText', emptyText, 'noResults') }}</slot>
          </div>
        </div>

        <div v-if="$slots.footer" class="wl-command-palette__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
