<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Paginator from "primevue/paginator";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    page?: number;
    pageCount: number;
    siblings?: number;
    compact?: boolean;
    disabled?: boolean;
    pt?: Record<string, unknown>;
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

type PagerItem = number | "gap";

/** Classic pinned-first/last window with ellipsis gaps. */
const pageItems = computed<PagerItem[]>(() => {
  const count = Math.max(props.pageCount, 1);
  const current = Math.min(Math.max(props.page, 1), count);
  const window = 2 * props.siblings + 5;
  if (count <= window) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const s = props.siblings;
  const leftEdge = 3 + 2 * s; // last page of the left-pinned window
  if (current <= leftEdge) {
    return [...range(1, leftEdge), "gap", count];
  }
  const rightEdge = count - (2 + 2 * s); // first page of the right-pinned window
  if (current >= rightEdge) {
    return [1, "gap", ...range(rightEdge, count)];
  }
  return [1, "gap", ...range(current - s, current + s), "gap", count];
});

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 1), Math.max(props.pageCount, 1));
}

function onFirst(value: number): void {
  // Paginator rows = 1, so `first` is the 0-based page offset.
  const next = clamp(value + 1);
  if (next !== props.page) emit("update:page", next);
}

/* Compact variant: editable draft committed on Enter / blur. */
const draft = ref(String(props.page));
watch(
  () => props.page,
  (value) => {
    draft.value = String(value);
  }
);

function commit(changePage: (page: number) => void): void {
  const parsed = Number.parseInt(draft.value, 10);
  const next = clamp(Number.isNaN(parsed) ? props.page : parsed);
  draft.value = String(next);
  if (next !== props.page) changePage(next - 1);
}
</script>

<template>
  <Paginator
    :first="page - 1"
    :rows="1"
    :total-records="Math.max(pageCount, 1)"
    :always-show="true"
    :pt="pt"
    class="wl-pagination"
    :class="{ 'wl-pagination--compact': compact }"
    data-wl="pagination"
    @update:first="onFirst"
  >
    <template #container="{ changePageCallback }">
      <div v-if="!compact" class="wl-pager">
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page <= 1"
          aria-label="Первая страница"
          @click="changePageCallback(0)"
        >
          <WlIcon name="chevron-left" :size="14" />
          <WlIcon name="chevron-left" :size="14" class="wl-pager__nav-overlap" />
        </button>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page <= 1"
          aria-label="Предыдущая страница"
          @click="changePageCallback(page - 2)"
        >
          <WlIcon name="chevron-left" :size="14" />
        </button>
        <template v-for="(item, index) in pageItems" :key="index">
          <span v-if="item === 'gap'" class="wl-pager__gap">…</span>
          <button
            v-else
            type="button"
            class="wl-pager__btn"
            :class="{ 'is-active': item === page }"
            :disabled="disabled"
            :aria-current="item === page ? 'page' : undefined"
            @click="changePageCallback(item - 1)"
          >
            {{ item }}
          </button>
        </template>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page >= pageCount"
          aria-label="Следующая страница"
          @click="changePageCallback(page)"
        >
          <WlIcon name="chevron-right" :size="14" />
        </button>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page >= pageCount"
          aria-label="Последняя страница"
          @click="changePageCallback(pageCount - 1)"
        >
          <WlIcon name="chevron-right" :size="14" />
          <WlIcon name="chevron-right" :size="14" class="wl-pager__nav-overlap" />
        </button>
      </div>

      <div v-else class="wl-pager wl-pager--compact">
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page <= 1"
          aria-label="Предыдущая страница"
          @click="changePageCallback(page - 2)"
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
        <span class="wl-pager__total">из {{ pageCount }}</span>
        <button
          type="button"
          class="wl-pager__btn wl-pager__nav"
          :disabled="disabled || page >= pageCount"
          aria-label="Следующая страница"
          @click="changePageCallback(page)"
        >
          <WlIcon name="chevron-right" :size="14" />
        </button>
      </div>
    </template>
  </Paginator>
</template>
