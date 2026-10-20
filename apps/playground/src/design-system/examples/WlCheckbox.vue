<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlCheckbox } from "gavia-ui";
import { ref } from "vue";
const value = ref(true);
const permissions = ref<number[]>([1]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCheckbox v-model="value" v-bind="preview">{{ t("examples.receive_updates_0027") }}</WlCheckbox>
    <fieldset class="wl-stack" data-space="sm">
      <legend>{{ t("documentation.strings.generatedWlCheckboxGroupLabel") }}</legend>
      <WlCheckbox v-model="permissions" :value="1" size="sm">{{ t("documentation.strings.generatedWlCheckboxGroupRead") }}</WlCheckbox>
      <WlCheckbox v-model="permissions" :value="2" size="sm">{{ t("documentation.strings.generatedWlCheckboxGroupShare") }}</WlCheckbox>
      <output :aria-label="t('documentation.strings.generatedWlCheckboxGroupLabel')">{{ permissions.join(", ") }}</output>
    </fieldset>
  </div>
</template>
