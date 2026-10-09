<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, type WlButtonVariant } from "../../../../../packages/ui-kit/src";
// The public union makes a missing or unsupported variant a type error.
const labels = {
  primary: t("examples.create_0290"),
  secondary: t("examples.draft_0291"),
  ghost: t("examples.cancel_0038"),
  soft: t("examples.share_0292"),
  danger: t("examples.delete_0037"),
  "danger-quiet": t("examples.delete_quietly_0293"),
  "soft-danger": t("examples.archive_0113"),
  link: t("examples.learn_more_0294")
} satisfies Record<WlButtonVariant, string>;
const variants = Object.keys(labels) as WlButtonVariant[];
const lastAction = ref("");
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="button-variant-grid">
      <div v-for="variant in variants" :key="variant" class="wl-stack" data-space="sm">
        <div><WlButton :variant="variant" @click="lastAction = labels[variant]">{{ labels[variant] }}</WlButton></div>
        <code class="wl-text-small">{{ variant }}</code>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ lastAction ? t("examples.last_action_0277") + lastAction : t("examples.choose_any_variant_all_eight_buttons_perform_a_local_action_0295") }}</p>
  </div>
</template>

<style scoped>
.button-variant-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: var(--wl-space-lg); align-items: start; }
</style>
