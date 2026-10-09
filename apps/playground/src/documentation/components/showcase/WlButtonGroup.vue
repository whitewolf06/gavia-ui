<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButtonGroup, WlButton, WlIconButton } from "../../../../../../packages/ui-kit/src";
const period = ref(t("examples.day_0020"));
const page = ref(1);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlButtonGroup :aria-label="t('examples.report_period_0345')"><WlButton v-for="label in [t('examples.day_0020'), t('examples.week_0021'), t('examples.month_0346')]" :key="label" size="sm" :variant="period === label ? 'primary' : 'secondary'" :aria-pressed="period === label" @click="period = label">{{ label }}</WlButton></WlButtonGroup></div>
    <div><WlButtonGroup :aria-label="t('examples.report_pages_0347')"><WlIconButton icon="chevron-left" variant="secondary" :aria-label="t('examples.previous_report_page_0348')" :disabled="page === 1" @click="page--" /><WlIconButton icon="chevron-right" variant="secondary" :aria-label="t('examples.next_report_page_0349')" :disabled="page === 5" @click="page++" /></WlButtonGroup></div>
    <p class="wl-text-small" role="status">{{ t("examples.period_0350") }} {{ period }}{{ t("examples.page_0351") }} {{ page }} {{ t("examples.of_5_0352") }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_group_joins_buttons_with_a_shared_border_and_sets_role_gro_0353") }}</p>
  </div>
</template>
