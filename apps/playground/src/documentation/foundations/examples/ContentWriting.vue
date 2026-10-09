<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlInput } from "../../../../../../packages/ui-kit/src";
const name = ref("");
const error = ref("");
const message = ref("");
function save(): void {
  error.value = name.value.trim() ? "" : t("examples.enter_a_material_title_to_continue_0917");
  message.value = error.value ? "" : t("examples.saved_locally_0918") + name.value.trim();
}
function cancel(): void {
  name.value = ""; error.value = ""; message.value = t("examples.changes_cancelled_0919");
}
</script>

<template>
  <div class="wl-stack" data-space="xl">
    <section class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">{{ t("examples.before_saving_0920") }}</h3>
      <ol class="content-writing-list wl-text-body"><li>{{ t("examples.enter_a_clear_title_0921") }}</li><li>{{ t("examples.check_it_in_the_material_list_context_0922") }}</li><li>{{ t("examples.save_or_discard_changes_0923") }}</li></ol>
    </section>
    <form class="wl-stack" data-space="lg" novalidate @submit.prevent="save">
      <WlField id="content-material-name" :label="t('examples.material_title_0056')" :hint="t('examples.name_the_material_s_subject_for_example_launch_plan_0924')" :error="error" required v-slot="field">
        <WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" required :placeholder="t('examples.launch_plan_0906')" />
      </WlField>
      <div class="wl-inline" data-space="sm"><WlButton variant="primary" type="submit">{{ t("examples.save_material_0925") }}</WlButton><WlButton @click="cancel">{{ t("examples.discard_changes_0222") }}</WlButton></div>
      <p class="wl-text-small wl-text-muted" role="status">{{ message }}</p>
    </form>
    <section class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">{{ t("examples.how_to_name_a_material_0926") }}</h3>
      <ul class="content-writing-list wl-text-body"><li>{{ t("examples.a_short_subject_instead_of_an_internal_identifier_0927") }}</li><li>{{ t("examples.clear_titles_instead_of_document_1_and_miscellaneous_0928") }}</li></ul>
    </section>
  </div>
</template>

<style scoped>
.content-writing-list { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); }
</style>
