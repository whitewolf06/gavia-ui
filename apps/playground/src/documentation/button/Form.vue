<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlCheckbox, WlInput } from "../../../../../packages/ui-kit/src";
const name = ref("");
const block = ref(true);
const submitted = ref(0);
const drafts = ref(0);
const message = ref(t("examples.the_form_has_not_been_submitted_yet_0256"));
function submit(): void {
  submitted.value++;
  message.value = t("examples.created_project_0257") + name.value.trim() + "».";
}
function reset(): void {
  name.value = "";
  message.value = t("examples.form_cleared_0258");
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="block">{{ t("examples.full_width_submit_button_0259") }}</WlCheckbox>
    <form class="button-form-example wl-stack" data-space="md" :aria-label="t('examples.create_a_project_0240')" @submit.prevent="submit" @reset.prevent="reset">
      <div class="wl-stack" data-space="xs">
        <label for="button-form-name" class="wl-text-label">{{ t("examples.project_title_0250") }}</label>
        <WlInput id="button-form-name" v-model="name" name="projectName" required minlength="3" pattern=".*\S.*" aria-describedby="button-form-hint" />
        <p id="button-form-hint" class="wl-text-small wl-text-muted">{{ t("examples.at_least_three_characters_native_validation_runs_before_submit_0260") }}</p>
      </div>
      <div data-button-form-submit>
        <WlButton type="submit" variant="primary" :block="block">{{ t("examples.create_project_0254") }}</WlButton>
      </div>
      <div class="wl-inline" data-space="sm">
        <WlButton @click="drafts++">{{ t("examples.check_draft_0261") }}</WlButton>
        <WlButton type="reset" variant="ghost">{{ t("examples.reset_form_0262") }}</WlButton>
      </div>
    </form>
    <p class="wl-text-small" role="status">{{ message }} {{ t("examples.submissions_0263") }} {{ submitted }}{{ t("examples.draft_checks_0264") }} {{ drafts }}.</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.a_regular_wlbutton_uses_type_button_and_does_not_submit_the_fo_0265") }}</p>
  </div>
</template>

<style scoped>
.button-form-example { width: 100%; max-width: 28rem; }
</style>
