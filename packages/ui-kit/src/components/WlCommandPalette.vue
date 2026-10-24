<script
  setup
  lang="ts"
  generic="Item extends WlCommandPaletteItem = WlCommandPaletteItem,
    Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>"
>
/** WlCommandPalette public component contract.
 * @since 0.2.0
 * @slot group - Group heading; scope { group }.
 * @slot item - Complete item markup; scope { item, group, active }.
 * @slot item-icon - Item icon; scope { item, group }.
 * @slot empty - Empty state; scope { query }.
 * @slot footer - Panel footer.
 */
import {
  computed,
  nextTick,
  ref,
  useAttrs,
  watch
} from "vue";
import type { WlNoModelModifiers, WlTextModelModifiers } from "../model-types";
import type { WlCommandPaletteExpose, WlCommandPaletteGroup, WlCommandPaletteItem } from "../navigation-types";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlHotkey } from "../composables/useWlHotkey";
import { useWlResultsAnnouncement } from "../composables/useWlResultsAnnouncement";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
import WlLink from "./WlLink.vue";
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * WlCommandPaletteGroup[] with quick links and search results. group.filter selects local or external filtering.
     * @default []
     */
    groups?: readonly (WlCommandPaletteGroup<Item> & Group)[];
    /** Modifier contract for visibility; built-in modifiers are unsupported. */
    visibleModifiers?: WlNoModelModifiers;
    /** Modifiers accepted by the query model; trim normalizes surrounding whitespace. */
    queryModifiers?: WlTextModelModifiers;
    /**
     * Input hint; uses locale.searchPlaceholder when omitted or undefined (English: Search or navigate…).
     * @default undefined
     */
    placeholder?: string;
    /**
     * Empty state; uses locale.noResults when omitted or undefined (English: Nothing found).
     * @default undefined
     */
    emptyText?: string;
    /**
     * Loading text; uses locale.searching when omitted or undefined (English: Searching…).
     * @default undefined
     */
    loadingText?: string;
    /**
     * Accessible name; uses locale.commandPalette when omitted or undefined (English: Command palette).
     * @default undefined
     */
    ariaLabel?: string;
    /**
     * Filter items locally.
     * @default true
     */
    filter?: boolean;
    /**
     * Open with Ctrl/Cmd+K.
     * @default false
     */
    shortcut?: boolean;
    /**
     * Close the surface after an enabled item is selected.
     * @default true
     */
    closeOnSelect?: boolean;
    /**
     * Indicate pending work supplied by the application.
     * @default false
     */
    loading?: boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Window animation; defaults to WlConfig.motion (true). */
    motion?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"commandpalette">;
  }>(),
  {
    groups: () => [],
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

const emit = defineEmits<{
  /** Search query changed. */
  search: [query: string];
  /** Item selected. The application handles navigation or the action. */
  select: [item: Item, group: Group];
  /** Emitted when the surface opens. */
  open: [];
  /** Emitted when the surface closes. */
  close: [];
}>();

/** Whether the surface is open.
 * Paired with update:visible.
 * @default false
 */
const visible = defineModel<boolean, never>("visible", { default: false });

/** Search text; supports the trim model modifier.
 * Paired with update:query.
 * @default ""
 */
const query = defineModel<string, "trim">("query", { default: "" });

defineSlots<{
  /** Group heading; scope { group }. */
  group?(props: { group: Group }): unknown;
  /** Complete item markup; scope { item, group, active }. */
  item?(props: { item: Item; group: Group; active: boolean }): unknown;
  /** Item icon; scope { item, group }. */
  "item-icon"?(props: { item: Item; group: Group }): unknown;
  /** Empty state; scope { query }. */
  empty?(props: { query: string }): unknown;
  /** Panel footer. */
  footer?(props: {}): unknown;
}>();

const locale = useWlLocale();
const placeholder = computed(() => props.placeholder ?? locale.value.searchPlaceholder);
const emptyText = computed(() => props.emptyText ?? locale.value.noResults);
const loadingText = computed(() => props.loadingText ?? locale.value.searching);
const ariaLabel = computed(() => props.ariaLabel ?? locale.value.commandPalette);

const attrs = useAttrs();
const section = useWlPt("commandpalette", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));

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
  if (!active) return;
  const element = panelRef.value?.ownerDocument.getElementById(optionId(active.item));
  if (element instanceof HTMLElement) element.click();
  else select(active.item, active.group);
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

useWlHotkey("mod+k", () => {
  visible.value = !visible.value;
}, {
  enabled: () => props.shortcut && !props.disabled
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  open: () => {
    if (!props.disabled) visible.value = true;
  },
  close
} satisfies WlCommandPaletteExpose);
useWlResultsAnnouncement({
  query: () => query.value,
  count: () => visibleItems.value.length,
  visible: () => visible.value,
  loading: () => props.loading
});
</script>

<template>
  <Teleport to="body">
    <Transition
      name="wl-command-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <!-- Only a pointer on the backdrop dismisses here; the overlay lifecycle owns Escape. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="visible"
        v-bind="mergeWlAttrs(section('root'), attrs)"
        class="wl-command-palette"
        :class="[
          `wl-command-palette--${size}`,
          density === 'compact' && 'is-compact',
          loading && 'is-loading'
        ]"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        data-wl="command-palette"
        :data-size="size"
        :data-density="density"
        @mousedown.self="close"
      >
        <!-- Keyboard events from the native search input select the active listbox option. -->
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        <div
          ref="panelRef"
          v-bind="section('panel')"
          class="wl-command-palette__panel"
          @keydown="onKeydown"
        >
          <div class="wl-command-palette__search">
            <WlIcon name="search" :size="18" class="wl-command-palette__search-icon" />
            <input
              ref="inputRef"
              v-bind="section('input')"
              v-model="query"
              class="wl-command-palette__input"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              :aria-label="ariaLabel"
              :aria-controls="listboxId"
              :aria-activedescendant="activeDescendant()"
              :aria-expanded="visible"
              :placeholder="placeholder"
              :disabled="disabled"
              autocomplete="off"
            />
            <span class="wl-command-palette__key" aria-hidden="true">Esc</span>
          </div>

          <div
            :id="listboxId"
            v-bind="section('list')"
            class="wl-command-palette__list"
            role="listbox"
          >
            <template v-if="hasResults">
              <section
                v-for="{ group, items } in visibleGroups"
                :key="group.id"
                v-bind="section('group', { group })"
                class="wl-command-palette__group"
                role="group"
                :aria-label="group.label"
              >
                <div v-bind="section('groupLabel', { group })" class="wl-command-palette__group-label">
                  <slot name="group" :group="group">{{ group.label }}</slot>
                </div>
                <component
                  :is="item.href !== undefined || item.to !== undefined ? WlLink : 'button'"
                  v-for="item in items"
                  :id="optionId(item)"
                  :key="item.id"
                  v-bind="section('item', { active: isActive(item), disabled: !!item.disabled, item, group })"
                  :href="item.disabled ? undefined : item.href"
                  :to="item.to"
                  :target="item.href !== undefined || item.to !== undefined ? item.target : undefined"
                  :type="item.href !== undefined || item.to !== undefined ? undefined : 'button'"
                  :disabled="item.disabled"
                  class="wl-command-palette__item"
                  :class="{ 'is-active': isActive(item), 'is-disabled': item.disabled }"
                  role="option"
                  tabindex="-1"
                  :aria-selected="isActive(item)"
                  :aria-disabled="item.disabled || undefined"
                  @mouseenter="!item.disabled && (activeIndex = selectableItems.findIndex((entry) => entry.item === item))"
                  @focus="!item.disabled && (activeIndex = selectableItems.findIndex((entry) => entry.item === item))"
                  @click="select(item, group)"
                >
                  <slot
                    name="item"
                    :item="item"
                    :group="group"
                    :active="isActive(item)"
                  >
                    <span
                      v-bind="section('itemIcon', { active: isActive(item), disabled: !!item.disabled, item, group })"
                      class="wl-command-palette__item-icon"
                    >
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

            <div
              v-else-if="loading"
              v-bind="section('status', { loading: true })"
              class="wl-command-palette__status"
              role="status"
            >
              <span class="wl-command-palette__spinner" aria-hidden="true"></span>
              <span>{{ loadingText }}</span>
            </div>
            <div v-else v-bind="section('status', { loading: false })" class="wl-command-palette__status">
              <slot name="empty" :query="query">{{ emptyText }}</slot>
            </div>
          </div>

          <div v-if="$slots.footer" v-bind="section('footer')" class="wl-command-palette__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
