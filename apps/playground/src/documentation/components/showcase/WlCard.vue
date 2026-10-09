<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCard, WlButton, WlTag } from "../../../../../../packages/ui-kit/src";
const opened = ref("");
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="showcase-cards">
      <WlCard aria-labelledby="showcase-card-sprint"><template #title><h3 id="showcase-card-sprint" class="wl-text-subheading">{{ t("examples.sprint_24_0354") }}</h3></template><template #subtitle>{{ t("examples.teamwork_8_tasks_0355") }}</template><p class="wl-text-body">{{ t("examples.three_tasks_in_review_demo_on_friday_0356") }}</p><template #footer><WlButton size="sm" variant="soft" @click="opened = t('examples.sprint_24_0354')">{{ t("examples.open_board_0357") }}</WlButton><span class="wl-text-small wl-text-muted">{{ t("examples.updated_today_0358") }}</span></template></WlCard>
      <WlCard hoverable aria-labelledby="showcase-card-note"><template #header><div class="showcase-card-banner"><WlTag variant="blue">{{ t("examples.team_material_0071") }}</WlTag></div></template><template #title><h3 id="showcase-card-note" class="wl-text-subheading">{{ t("examples.product_note_0359") }}</h3></template><template #subtitle>{{ t("examples.next_release_plan_0360") }}</template><p class="wl-text-body">{{ t("examples.hoverable_changes_the_hover_appearance_a_separate_button_perfo_0361") }}</p><template #footer><WlButton size="sm" @click="opened = t('examples.product_note_0359')">{{ t("examples.read_note_0362") }}</WlButton><WlTag variant="green">{{ t("examples.new_0363") }}</WlTag></template></WlCard>
    </div>
    <p class="wl-text-small" role="status">{{ opened ? t("examples.opened_0364") + opened : t("examples.choose_a_card_action_0365") }}</p>
  </div>
</template>
<style scoped>
.showcase-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--wl-space-lg); }
.showcase-card-banner { padding: var(--wl-space-lg); background: var(--wl-accent-soft); }
</style>
