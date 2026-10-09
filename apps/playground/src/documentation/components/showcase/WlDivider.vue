<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlDivider, WlButton } from "../../../../../../packages/ui-kit/src";
const selected = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <p class="wl-text-body">{{ t("examples.a_simple_line_separates_independent_sections_of_content_0410") }}</p><WlDivider />
    <div><WlButton variant="primary" @click="selected = true">{{ t("examples.sign_in_by_email_0411") }}</WlButton></div>
    <WlDivider>{{ t("examples.or_0412") }}</WlDivider>
    <p class="wl-text-body">{{ t("examples.continue_another_way_0413") }}</p>
    <WlDivider><span class="wl-text-small wl-text-muted">{{ t("examples.next_section_0414") }}</span></WlDivider>
    <p v-if="selected" class="wl-text-small" role="status">{{ t("examples.email_sign_in_selected_in_the_local_example_0415") }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_default_slot_label_belongs_to_the_divider_section_headings_0416") }}</p>
  </div>
</template>
