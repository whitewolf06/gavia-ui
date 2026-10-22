<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlIcon, WlPill, type WlTone } from "gavia-ui";
const labels = { neutral: t("examples.draft_0291"), accent: t("examples.release_0605"), info: t("examples.in_progress_0066"), success: t("examples.done_0047"), warning: t("examples.needs_review_0520"), danger: t("examples.error_0147") } satisfies Record<WlTone, string>;
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlPill
      v-for="(label, variant) in labels"
      :key="variant"
      :label="label"
      :tone="variant"
    /></div>
    <div class="wl-inline" data-space="sm">
      <span class="wl-text-body">{{ t("examples.default_slot_content_0521") }}</span>
      <WlPill tone="success"><WlIcon name="check" :size="12" />{{ t("examples.reviewed_by_the_team_0522") }}</WlPill>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.a_status_displays_a_state_and_performs_no_action_its_label_is_0523") }}</p>
  </div>
</template>
