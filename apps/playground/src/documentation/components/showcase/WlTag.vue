<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { nextTick, ref } from "vue";
import { WlTag, WlButton, type WlTagVariant } from "../../../../../../packages/ui-kit/src";
const labels = { gray: t("examples.default_0604"), blue: t("examples.release_0605"), green: t("examples.done_0047"), amber: t("examples.in_progress_0066"), red: t("examples.overdue_0606") } satisfies Record<WlTagVariant, string>;
const tags = ref([t("examples.design_0079"), t("examples.development_0080"), t("examples.review_0129")]);
const controls = ref<HTMLElement | null>(null);
async function remove(tag: string): Promise<void> { tags.value = tags.value.filter(value => value !== tag); await nextTick(); controls.value?.querySelector<HTMLButtonElement>("button")?.focus(); }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlTag v-for="(label, variant) in labels" :key="variant" :variant="variant">{{ label }}</WlTag></div>
    <div ref="controls" class="wl-inline" data-space="sm"><WlTag v-for="tag in tags" :key="tag" variant="blue" removable :remove-label="t('examples.remove_tag_0607') + tag" @remove="remove(tag)">{{ tag }}</WlTag><WlButton size="sm" variant="ghost" @click="tags = [t('examples.design_0079'), t('examples.development_0080'), t('examples.review_0129')]">{{ t("examples.restore_tags_0608") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ t("examples.selected_tags_0609") }} {{ tags.join(', ') || t("examples.none_0306") }}.</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_remove_event_identifies_the_tag_to_remove_the_application_0610") }}</p>
  </div>
</template>
