<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSegmented, type WlSegmentedOption } from "../../../../../../packages/ui-kit/src";
const period = ref<string | null>("week");
const view = ref<string | null>("list");
const periods: WlSegmentedOption[] = [{ label: t("examples.day_0020"), value: "day" }, { label: t("examples.week_0021"), value: "week" }, { label: t("examples.month_0346"), value: "month" }, { label: t("examples.year_0537"), value: "year", disabled: true }];
const views: WlSegmentedOption[] = [{ label: t("examples.list_0111"), value: "list", icon: "list" }, { label: t("examples.grid_0112"), value: "grid", icon: "grid" }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlSegmented v-model="period" :options="periods" :aria-label="t('examples.planning_period_0538')" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" />
    <WlSegmented v-model="view" :options="views" :aria-label="t('examples.materials_view_0539')" />
    <WlSegmented model-value="list" :options="views" disabled :aria-label="t('examples.unavailable_materials_view_0540')" />
    <p class="wl-text-small" role="status">{{ t("examples.period_0350") }} {{ periods.find(item => item.value === period)?.label }}{{ t("examples.view_0541") }} {{ views.find(item => item.value === view)?.label }}.</p>
  </div>
</template>
