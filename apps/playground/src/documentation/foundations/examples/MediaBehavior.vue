<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
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
const mode = computed(() => wide.value === null ? t("examples.the_width_is_determined_after_mounting_0959") : wide.value ? t("examples.wide_mode_the_filter_is_immediately_visible_0960") : t("examples.narrow_mode_a_button_opens_the_filter_0961"));
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
    <div v-if="wide === false" ref="toggle"><WlButton aria-controls="responsive-behavior-filter" :aria-expanded="filtersOpen" @click="filtersOpen = !filtersOpen">{{ filtersOpen ? t("examples.hide_filter_0962") : t("examples.show_filter_0963") }}</WlButton></div>
    <div v-if="wide || filtersOpen" ref="filter" id="responsive-behavior-filter" class="media-behavior-filter wl-surface wl-stack" data-space="sm">
      <label for="responsive-behavior-search" class="wl-text-label">{{ t("examples.search_in_the_example_0964") }}</label>
      <WlInput id="responsive-behavior-search" v-model="search" :placeholder="t('examples.for_example_card_0965')" />
      <p class="wl-text-small wl-text-muted">{{ t("examples.typed_text_survives_the_layout_change_its_model_is_outside_the_0966") }}</p>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.current_value_0967") }} {{ search || t("examples.empty_0968") }}{{ t("examples.css_handles_placement_matchmedia_changes_only_the_filter_s_beh_0969") }}</p>
  </section>
</template>

<style scoped>
.media-behavior-filter { min-width: 0; }
@media (min-width: 900px) { .media-behavior-filter { max-width: 480px; } }
</style>
