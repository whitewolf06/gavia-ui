<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlAlert, WlButton, WlSegmented } from "../../../../../../packages/ui-kit/src";
const definitions = {
  info: { label: t("examples.information_1009"), title: t("examples.material_in_progress_1010"), text: t("examples.add_a_description_before_submitting_for_review_1011") },
  ok: { label: t("examples.success_0144"), title: t("examples.material_ready_1012"), text: t("examples.all_required_fields_are_filled_1013") },
  warn: { label: t("examples.warning_1014"), title: t("examples.needs_review_0520"), text: t("examples.check_the_date_before_saving_1015") },
  err: { label: t("examples.error_0147"), title: t("examples.could_not_save_0145"), text: t("examples.your_entries_remain_in_the_form_save_again_1016") }
} as const;
type StatusName = keyof typeof definitions;
const selected = ref<string | null>("info");
const saved = ref(0);
const options = Object.entries(definitions).map(([value, definition]) => ({ value, label: definition.label }));
const status = computed<StatusName>(() => typeof selected.value === "string" && selected.value in definitions ? selected.value as StatusName : "info");
const current = computed(() => definitions[status.value]);
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <WlSegmented v-model="selected" :options="options" :aria-label="t('examples.material_status_1017')" />
    <WlAlert :variant="status" :title="current.title">{{ current.text }}</WlAlert>
    <div><WlButton variant="primary" @click="saved++">{{ t("examples.save_example_1018") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ t("examples.materials_saved_1019") }} {{ saved }} {{ t("examples.state_1020") }} {{ current.label }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_state_name_text_and_number_are_understandable_without_colo_1021") }}</p>
  </section>
</template>
