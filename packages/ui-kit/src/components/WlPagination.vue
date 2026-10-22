<script setup lang="ts">
/** WlPagination public component contract.
 * @since 0.1.0
 */
import { computed, ref, watch } from "vue";
import type { WlPt } from "../pt-types";
import { useWlLocale, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { formatWlNumber } from "../utils/format";
import WlIcon from "./WlIcon.vue";
const props = withDefaults(
  defineProps<{
    /**
     * Current page number, starting at 1.
     * @default 1
     */
    page?: number;
    /** Total pages. */
    pageCount?: number;
    /** Number of rows displayed on a page. */
    pageSize?: number;
    /** Available page-size choices. */
    pageSizes?: readonly number[];
    /** Total number of data rows used to calculate pagination. */
    total?: number;
    /**
     * Number of pages shown around the current page.
     * @default 1
     */
    siblings?: number;
    /**
     * Compact view with an input.
     * @default false
     */
    compact?: boolean;
    /**
     * Disables navigation.
     * @default false
     */
    disabled?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"pagination">;
  }>(),
  {
    page: 1,
    siblings: 1,
    compact: false,
    disabled: false
  }
);

const emit = defineEmits<{
  /** New page number, starting at 1. */
  (e: "update:page", value: number): void;
  /** Requests a new page size selected by the user. */
  (e: "update:pageSize", value: number): void;
}>();

const locale = useWlLocale();

const section = useWlPt("pagination", computed(() => props.pt));

type PagerItem = number | "gap";
const total = computed(() => Math.max(0, Math.floor(Number.isFinite(props.total) ? props.total! : 0)));
const size = computed(() => Number.isFinite(props.pageSize) && props.pageSize! > 0 ? Math.max(1, Math.floor(props.pageSize!)) : undefined);
const sizes = computed(() => [...new Set((props.pageSizes ?? []).filter((value) => Number.isInteger(value) && value > 0))].slice(0, 20));
const count = computed(() => Number.isFinite(props.pageCount)
  ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(props.pageCount!)))
  : size.value ? Math.max(1, Math.ceil(total.value / size.value)) : 1);
const currentPage = computed(() => clamp(props.page));
const rangeText = computed(() => {
  if (props.total === undefined || size.value === undefined) return undefined;
  const from = total.value === 0 ? 0 : Math.min((currentPage.value - 1) * size.value + 1, total.value);
  const to = Math.min(currentPage.value * size.value, total.value);
  return formatWlLocaleText(locale.value.pageRange, {
    from: formatWlNumber(locale.value.localeCode, from),
    to: formatWlNumber(locale.value.localeCode, to),
    total: formatWlNumber(locale.value.localeCode, total.value)
  });
});
function changeSize(event: Event): void {
  if (props.disabled) return;
  const value = Number((event.target as HTMLSelectElement).value);
  if (!sizes.value.includes(value) || value === props.pageSize) return;
  emit("update:pageSize", value);
  if (props.page !== 1) emit("update:page", 1);
}
// Keep the rendered navigation bounded even when a consumer supplies an excessive window.
const siblingCount = computed(() => Number.isFinite(props.siblings)
  ? Math.min(100, Math.max(0, Math.floor(props.siblings)))
  : 1);

/** Classic pinned-first/last window with ellipsis gaps. */
const pageItems = computed<PagerItem[]>(() => {
  const total = count.value;
  const current = currentPage.value;
  const window = 2 * siblingCount.value + 5;
  if (total <= window) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const s = siblingCount.value;
  const leftEdge = 3 + 2 * s;
  // last page of the left-pinned window
  if (current <= leftEdge) {
    return [...range(1, leftEdge), "gap", total];
  }
  const rightEdge = total - (2 + 2 * s);
  // first page of the right-pinned window
  if (current >= rightEdge) {
    return [1, "gap", ...range(rightEdge, total)];
  }
  return [1, "gap", ...range(current - s, current + s), "gap", total];
});

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function clamp(value: number): number {
  return Math.min(Math.max(Number.isFinite(value) ? Math.trunc(value) : 1, 1), count.value);
}

function goToPage(value: number): void {
  if (props.disabled || !Number.isFinite(value))
    return;
  // Navigation callbacks receive a zero-based page offset.
  const next = clamp(value + 1);
  if (next !== props.page)
    emit("update:page", next);
}

/* Compact variant: editable draft committed on Enter / blur. */
const draft = ref(String(currentPage.value));
watch(
  currentPage,
  (value) => {
    draft.value = String(value);
  }
);

function commit(changePage: (page: number) => void): void {
  if (props.disabled) {
    draft.value = String(currentPage.value);

    return;
  }
  const parsed = Number.parseInt(draft.value, 10);
  const next = clamp(Number.isNaN(parsed) ? currentPage.value : parsed);
  draft.value = String(next);
  if (next !== props.page)
    changePage(next - 1);
}
</script>

<template>
  <nav
    v-bind="section('root')"
    :aria-label="locale.pages"
    class="wl-pagination"
    :class="{ 'wl-pagination--compact': compact }"
    data-wl="pagination"
  >
    <label v-if="sizes.length" class="wl-pagination__size-label">
      {{ locale.rowsPerPage }}
      <select
        class="wl-pagination__size"
        :value="pageSize"
        :disabled="disabled"
        @change="changeSize"
      >
        <option v-for="value in sizes" :key="value" :value="value">{{ formatWlNumber(locale.localeCode, value) }}</option>
      </select>
    </label>
    <span v-if="rangeText" class="wl-pagination__range">{{ rangeText }}</span>
    <div v-if="!compact" class="wl-pager">
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage <= 1"
        :aria-label="locale.firstPage"
        @click="goToPage(0)"
      >
        <WlIcon name="chevron-left" :size="14" />
        <WlIcon name="chevron-left" :size="14" class="wl-pager__nav-overlap" />
      </button>
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage <= 1"
        :aria-label="locale.prevPage"
        @click="goToPage(currentPage - 2)"
      >
        <WlIcon name="chevron-left" :size="14" />
      </button>
      <template v-for="(item, index) in pageItems" :key="index">
        <span v-if="item === 'gap'" class="wl-pager__gap">…</span>
        <button
          v-else
          type="button"
          class="wl-pager__btn"
          :class="{ 'is-active': item === currentPage }"
          :disabled="disabled"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="goToPage(item - 1)"
        >
          {{ item }}
        </button>
      </template>
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage >= count"
        :aria-label="locale.nextPage"
        @click="goToPage(currentPage)"
      >
        <WlIcon name="chevron-right" :size="14" />
      </button>
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage >= count"
        :aria-label="locale.lastPage"
        @click="goToPage(count - 1)"
      >
        <WlIcon name="chevron-right" :size="14" />
        <WlIcon name="chevron-right" :size="14" class="wl-pager__nav-overlap" />
      </button>
    </div>

    <div v-else class="wl-pager wl-pager--compact">
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage <= 1"
        :aria-label="locale.prevPage"
        @click="goToPage(currentPage - 2)"
      >
        <WlIcon name="chevron-left" :size="14" />
      </button>
      <input
        v-model="draft"
        class="wl-pager__input"
        :disabled="disabled"
        inputmode="numeric"
        :aria-label="locale.pageNumber"
        @keydown.enter="commit(goToPage)"
        @blur="commit(goToPage)"
      />
      <span class="wl-pager__total">{{ locale.of }} {{ count }}</span>
      <button
        type="button"
        class="wl-pager__btn wl-pager__nav"
        :disabled="disabled || currentPage >= count"
        :aria-label="locale.nextPage"
        @click="goToPage(currentPage)"
      >
        <WlIcon name="chevron-right" :size="14" />
      </button>
    </div>
  </nav>
</template>
