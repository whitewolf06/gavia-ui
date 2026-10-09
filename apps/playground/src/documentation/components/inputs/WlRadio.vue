<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlRadio } from "../../../../../../packages/ui-kit/src";
const visibility = ref<string>("team");
const format = ref<string | null>(null);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlRadio">
    <fieldset class="docs-radio-group wl-stack" data-space="md">
      <legend class="wl-text-title">{{ t("examples.one_value_for_the_entire_group_0807") }}</legend>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="personal">{{ t("examples.only_me_0808") }}</WlRadio>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="team">{{ t("examples.team_0809") }}</WlRadio>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="public" disabled>{{ t("examples.everyone_temporarily_unavailable_0810") }}</WlRadio>
      <p class="wl-text-small wl-text-muted">{{ t("examples.a_shared_name_groups_native_radio_inputs_arrow_keys_change_the_0811") }}</p>
    </fieldset>
    <fieldset class="docs-radio-group wl-stack" data-space="md" :aria-describedby="format == null ? 'docs-radio-error' : undefined">
      <legend class="wl-text-title">{{ t("examples.required_selection_and_invalid_0812") }}</legend>
      <WlRadio v-model="format" name="docs-input-format" value="pdf" :invalid="format == null" :aria-describedby="format == null ? 'docs-radio-error' : undefined" required>{{ t("examples.pdf_document_0813") }}</WlRadio>
      <WlRadio v-model="format" name="docs-input-format" value="text" :invalid="format == null" :aria-describedby="format == null ? 'docs-radio-error' : undefined" required>{{ t("examples.text_file_0814") }}</WlRadio>
      <p v-if="format == null" id="docs-radio-error" class="wl-text-small" role="alert">{{ t("examples.choose_an_export_format_0815") }}</p>
    </fieldset>
    <WlButton size="sm" @click="visibility = 'team'; format = null">{{ t("examples.reset_groups_0816") }}</WlButton>
    <p class="wl-text-small" role="status">{{ t("examples.access_0817") }} {{ visibility }}{{ t("examples.format_0818") }} {{ format ?? t("examples.not_selected_0637") }}.</p>
  </div>
</template>

<style scoped>
.docs-radio-group { min-width: 0; margin: 0; padding: 0; border: 0; }
.docs-radio-group legend { margin-bottom: var(--wl-space-md); }
</style>