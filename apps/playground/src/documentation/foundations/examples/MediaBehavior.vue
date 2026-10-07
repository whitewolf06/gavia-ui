<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from "vue";
import { WlButton, WlInput, wlBreakpoints } from "../../../../../../packages/ui-kit/src";
const wide = ref<boolean | null>(null);
const filtersOpen = ref(false);
const search = ref("");
const filter = ref<HTMLElement | null>(null);
const toggle = ref<HTMLElement | null>(null);
let media: MediaQueryList | undefined;
let mounted = false;
let revision = 0;
const mode = computed(() => wide.value === null ? "Ширина определится после монтирования" : wide.value ? "Широкий режим: фильтр виден сразу" : "Узкий режим: фильтр раскрывается кнопкой");
function updateMode(): void {
  const nextWide = media?.matches ?? null;
  const active = document.activeElement;
  // Keep the filter visible if narrowing would otherwise remove its focused field.
  if (nextWide === false && active && filter.value?.contains(active)) filtersOpen.value = true;
  const moveFocus = nextWide === true && active && toggle.value?.contains(active);
  wide.value = nextWide;
  const current = ++revision;
  if (moveFocus) void nextTick(() => {
    if (mounted && current === revision && wide.value === true) filter.value?.querySelector<HTMLInputElement>("input")?.focus();
  });
}
onMounted(() => {
  mounted = true;
  // Browser APIs are read only after mounting; importing and SSR stay safe.
  media = window.matchMedia('(min-width: ' + wlBreakpoints.md + 'px)');
  updateMode();
  media.addEventListener("change", updateMode);
});
onBeforeUnmount(() => { mounted = false; revision++; media?.removeEventListener("change", updateMode); });
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <p class="wl-text-small" role="status">{{ mode }}</p>
    <div v-if="wide === false" ref="toggle"><WlButton aria-controls="responsive-behavior-filter" :aria-expanded="filtersOpen" @click="filtersOpen = !filtersOpen">{{ filtersOpen ? 'Скрыть фильтр' : 'Показать фильтр' }}</WlButton></div>
    <div v-if="wide || filtersOpen" ref="filter" id="responsive-behavior-filter" class="media-behavior-filter wl-surface wl-stack" data-space="sm">
      <label for="responsive-behavior-search" class="wl-text-label">Поиск в примере</label>
      <WlInput id="responsive-behavior-search" v-model="search" placeholder="Например, карточка" />
      <p class="wl-text-small wl-text-muted">Введённый текст сохраняется при перестройке: модель находится за пределами условной разметки.</p>
    </div>
    <p class="wl-text-small wl-text-muted">Текущее значение: {{ search || 'пусто' }}. CSS отвечает за размещение, matchMedia — только за изменение поведения фильтра.</p>
  </section>
</template>

<style scoped>
.media-behavior-filter { min-width: 0; }
@media (min-width: 900px) { .media-behavior-filter { max-width: 480px; } }
</style>
