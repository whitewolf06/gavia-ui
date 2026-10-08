<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed, ref, watch } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    page?: number;
    pageCount: number;
    siblings?: number;
    compact?: boolean;
    disabled?: boolean;
    pt?: WlPt<"paginator">;
  }>(),
  {
    page: 1,
    siblings: 1,
    compact: false,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: "update:page", value: number): void;
}>();
const section = useWlPt("paginator", computed(() => props.pt));

type PagerItem = number | "gap";
const count = computed(() => Number.isFinite(props.pageCount)
  ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(props.pageCount))) : 1);
const currentPage = computed(() => clamp(props.page));
// Keep the rendered navigation bounded even when a consumer supplies an excessive window.
const siblingCount = computed(() => Number.isFinite(props.siblings)
  ? Math.min(100, Math.max(0, Math.floor(props.siblings))) : 1);

/** Classic pinned-first/last window with ellipsis gaps. */
const pageItems = computed<PagerItem[]>(() => {
  const total = count.value;
  const current = currentPage.value;
  const window = 2 * siblingCount.value + 5;
  if (total <= window) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const s = siblingCount.value;
  const leftEdge = 3 + 2 * s; // last page of the left-pinned window
  if (current <= leftEdge) {
    return [...range(1, leftEdge), "gap", total];
  }
  const rightEdge = total - (2 + 2 * s); // first page of the right-pinned window
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

function onFirst(value: number): void {
  if (props.disabled || !Number.isFinite(value)) return;
  // Paginator rows = 1, so `first` is the 0-based page offset.
  const next = clamp(value + 1);
  if (next !== props.page) emit("update:page", next);
}
const changePageCallback = onFirst;

/* Compact variant: editable draft committed on Enter / blur. */
const draft = ref(String(currentPage.value));
watch(
  currentPage,
  (value) => {
    draft.value = String(value);
  }
);

function commit(changePage: (page: number) => void): void {
  if (props.disabled) { draft.value = String(currentPage.value); return; }
  const parsed = Number.parseInt(draft.value, 10);
  const next = clamp(Number.isNaN(parsed) ? currentPage.value : parsed);
  draft.value = String(next);
  if (next !== props.page) changePage(next - 1);
}
</script>

<template>
  <nav
    v-bind="section('root')"
    aria-label="Страницы"
    class="wl-pagination"
    :class="{ 'wl-pagination--compact': compact }"
    data-wl="pagination"
    @update:first="onFirst"
  >
      <div v-if="!compact" class="wl-pager">
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || currentPage <= 1"
          aria-label="Первая страница"
          @click="changePageCallback(0)"
        >
          <WlIcon name="chevron-left" :size="14" />
          <WlIcon name="chevron-left" :size="14" class="wl-pager__nav-overlap" />
        </button>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || currentPage <= 1"
          aria-label="Предыдущая страница"
          @click="changePageCallback(currentPage - 2)"
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
            @click="changePageCallback(item - 1)"
          >
            {{ item }}
          </button>
        </template>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || currentPage >= count"
          aria-label="Следующая страница"
          @click="changePageCallback(currentPage)"
        >
          <WlIcon name="chevron-right" :size="14" />
        </button>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || currentPage >= count"
          aria-label="Последняя страница"
          @click="changePageCallback(count - 1)"
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
          aria-label="Предыдущая страница"
          @click="changePageCallback(currentPage - 2)"
        >
          <WlIcon name="chevron-left" :size="14" />
        </button>
        <input
          v-model="draft"
          class="wl-pager__input"
          :disabled="disabled"
          inputmode="numeric"
          aria-label="Номер страницы"
          @keydown.enter="commit(changePageCallback)"
          @blur="commit(changePageCallback)"
        />
        <span class="wl-pager__total">из {{ count }}</span>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || currentPage >= count"
          aria-label="Следующая страница"
          @click="changePageCallback(currentPage)"
        >
          <WlIcon name="chevron-right" :size="14" />
        </button>
      </div>
  </nav>
</template>
