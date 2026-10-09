<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, nextTick, ref } from "vue";
import { WlPageHeader, WlSteps, WlField, WlInput, WlRadio, WlButton, WlAlert } from "../../../../../packages/ui-kit/src";
const step = ref(0);
const title = ref("");
const access = ref<string>("team");
const checked = ref(false);
const complete = ref(false);
const error = computed(() => checked.value && !title.value.trim() ? t("examples.enter_a_project_title_0239") : "");
const heading = ref<HTMLHeadingElement | null>(null);
async function move(target: number): Promise<void> {
  if (target > step.value && step.value === 0) {
    checked.value = true;
    if (error.value) { await nextTick(); document.getElementById("recipe-project-title")?.focus(); return; }
  }
  step.value = target; await nextTick(); heading.value?.focus();
}
async function submit(): Promise<void> {
  if (step.value < 2) await move(step.value + 1);
  else complete.value = true;
}
</script>

<template>
  <form class="wl-stack" data-space="lg" novalidate :aria-label="t('examples.create_a_project_0240')" @submit.prevent="submit">
    <WlPageHeader :title="t('examples.new_project_0241')" :description="t('examples.three_steps_data_access_review_0242')" :heading-level="2" size="md" />
    <WlSteps :items="[{ label: t('examples.data_0127') }, { label: t('examples.access_0128') }, { label: t('examples.review_0129') }]" :current="step" />
    <WlAlert v-if="complete" variant="ok" :title="t('examples.project_created_0243')">{{ title }} · {{ access === 'team' ? t("examples.for_the_entire_team_0244") : t("examples.private_0245") }}</WlAlert>
    <template v-else>
      <h3 ref="heading" tabindex="-1" class="wl-text-subheading">{{ t("examples.step_0246") }} {{ step + 1 }}: {{ [t("examples.project_data_0247"), t("examples.project_access_0248"), t("examples.review_data_0249")][step] }}</h3>
      <WlField v-if="step === 0" :label="t('examples.project_title_0250')" id="recipe-project-title" required :error="error" v-slot="field"><WlInput :id="field.id" v-model="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="80" /></WlField>
      <fieldset v-if="step === 1" class="ds-wizard-access wl-stack" data-space="md"><legend class="wl-text-label">{{ t("examples.who_can_see_the_project_0251") }}</legend><WlRadio v-model="access" name="recipe-project-access" value="team">{{ t("examples.entire_team_0109") }}</WlRadio><WlRadio v-model="access" name="recipe-project-access" value="private">{{ t("examples.only_me_0110") }}</WlRadio></fieldset>
      <dl v-if="step === 2" class="wl-stack wl-text-body" data-space="sm"><dt class="wl-text-label">{{ t("examples.title_0072") }}</dt><dd>{{ title }}</dd><dt class="wl-text-label">{{ t("examples.access_0128") }}</dt><dd>{{ access === 'team' ? t("examples.entire_team_0109") : t("examples.only_me_0110") }}</dd></dl>
      <div class="wl-inline" data-space="sm"><WlButton v-if="step > 0" variant="ghost" @click="move(step - 1)">{{ t("examples.back_0252") }}</WlButton><WlButton variant="primary" type="submit">{{ step < 2 ? t("examples.continue_0253") : t("examples.create_project_0254") }}</WlButton></div>
    </template>
    <WlButton v-if="complete" @click="complete = false; step = 0; checked = false; title = ''">{{ t("examples.create_another_project_0255") }}</WlButton>
  </form>
</template>

<style scoped>
.ds-wizard-access { padding: 0; margin: 0; border: 0; }
.ds-wizard-access legend { margin-bottom: var(--wl-space-md); }
dd { margin: 0; overflow-wrap: anywhere; }
</style>
