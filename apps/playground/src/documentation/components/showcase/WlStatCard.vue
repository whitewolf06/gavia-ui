<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlStatCard, WlButton } from "../../../../../../packages/ui-kit/src";
const completed = ref(7);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="showcase-stats">
      <WlStatCard icon="check" :label="t('examples.tasks_completed_0570')" :value="String(completed)" :description="t('examples.of_10_tasks_in_the_local_example_0571')" :progress="completed * 10" tone="success" />
      <WlStatCard icon="eye" :label="t('examples.team_focus_0572')" :value="t('examples.release_plan_0371')" :description="t('examples.2_of_5_sections_ready_0573')" :progress="40" />
      <WlStatCard icon="clock" :label="t('examples.review_time_0574')" :description="t('examples.during_this_session_0575')"><strong>{{ t("examples.1_h_20_min_0576") }}</strong><template #footer><span class="wl-text-small wl-text-muted">{{ t("examples.the_default_slot_replaces_value_add_an_explanation_in_the_foot_0577") }}</span></template></WlStatCard>
    </div>
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="completed === 10" @click="completed++">{{ t("examples.complete_a_task_in_this_example_0578") }}</WlButton><WlButton size="sm" variant="ghost" @click="completed = 7">{{ t("examples.restore_initial_metric_0579") }}</WlButton></div>
  </div>
</template>
<style scoped>
.showcase-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--wl-space-lg); }
</style>
