<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, WlCheckbox, WlField } from "gavia-ui";
import { computed, ref } from "vue";
const notifications = ref([{ id: "mail", label: t("examples.email_0656"), enabled: true }, { id: "push", label: t("examples.push_notifications_0210"), enabled: false }]);
const selectedCount = computed(() => notifications.value.filter((item) => item.enabled).length);
const allSelected = computed({
  get: () => selectedCount.value === notifications.value.length,
  set: (checked: boolean) => {
    notifications.value.forEach((item) => {
      item.enabled = checked;
    });
  }
});
const mixed = computed(() => selectedCount.value > 0 && !allSelected.value);
const consent = ref(false);
const permissions = ref<number[]>([1]);
const summary = computed(() =>
  t("examples.notifications_selected_0665") + " " + selectedCount.value + " " + t("examples.of_0201") + " "
  + notifications.value.length + t("examples.agreement_0666") + " "
  + (consent.value ? t("examples.confirmed_0667") : t("examples.not_confirmed_0668")) + "."
);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlCheckbox">
    <fieldset class="wl-stack" data-space="sm">
      <legend>{{ t("documentation.strings.generatedWlCheckboxGroupLabel") }}</legend>
      <WlCheckbox v-model="permissions" :value="1" size="sm">{{ t("documentation.strings.generatedWlCheckboxGroupRead") }}</WlCheckbox>
      <WlCheckbox v-model="permissions" :value="2" size="sm">{{ t("documentation.strings.generatedWlCheckboxGroupShare") }}</WlCheckbox>
      <output :aria-label="t('documentation.strings.generatedWlCheckboxGroupLabel')">{{ permissions.join(", ") }}</output>
    </fieldset>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.linked_selection_and_indeterminate_0657") }}</h3>
      <WlCheckbox v-model="allSelected" :indeterminate="mixed">{{ t("examples.all_available_notifications_0658") }}</WlCheckbox>
      <div class="wl-stack" data-space="sm">
        <WlCheckbox v-for="item in notifications" :key="item.id" v-model="item.enabled">{{ item.label }}</WlCheckbox>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_application_computes_the_intermediate_state_when_some_chil_0659") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.label_error_and_disabled_0660") }}</h3>
      <WlField
        id="docs-checkbox-consent"
        v-slot="{ id, ariaDescribedby, invalid }"
        :error="consent ? undefined : t('examples.confirm_your_agreement_0661')"
      ><WlCheckbox
        :id="id"
        v-model="consent"
        :invalid="invalid"
        :aria-describedby="ariaDescribedby"
        required
      >{{ t("examples.i_agree_to_the_terms_0662") }}</WlCheckbox></WlField>
      <WlCheckbox :model-value="true" disabled>{{ t("examples.system_notifications_are_required_0663") }}</WlCheckbox>
      <WlButton size="sm" @click="allSelected = false; consent = false">{{ t("examples.clear_available_checkboxes_0664") }}</WlButton>
      <p class="wl-text-small" role="status">{{ summary }}</p>
    </section>
  </div>
</template>
