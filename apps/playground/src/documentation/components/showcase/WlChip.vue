<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlChip, WlButton } from "../../../../../../packages/ui-kit/src";
const design = ref(true);
const development = ref(false);
const review = ref(false);
const selected = computed(() => [[design.value, t("examples.design_0079")], [development.value, t("examples.development_0080")], [review.value, t("examples.review_0129")]].filter(([active]) => active).map(([, label]) => label).join(", "));
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlChip v-model:active="design" :count="7">{{ t("examples.design_0079") }}</WlChip><WlChip v-model:active="development" :count="23">{{ t("examples.development_0080") }}</WlChip><WlChip v-model:active="review" :count="0">{{ t("examples.review_0129") }}</WlChip><WlChip disabled>{{ t("examples.archive_0113") }}</WlChip></div>
    <div><WlButton size="sm" variant="ghost" @click="design = false; development = false; review = false">{{ t("examples.clear_all_filters_0366") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ t("examples.filters_0367") }} {{ selected || t("examples.none_selected_0368") }}.</p>
  </div>
</template>
