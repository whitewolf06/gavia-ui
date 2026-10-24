<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlCheckboxGroup } from "gavia-ui";
import { computed, ref } from "vue";
const selected = ref(["read"]);
const options = computed(() => [
  { value: "read", label: t("documentation.strings.generatedWlCheckboxGroupRead") },
  { value: "write", label: t("documentation.strings.generatedWlCheckboxGroupWrite"), disabled: true },
  { value: "share", label: t("documentation.strings.generatedWlCheckboxGroupShare") }
]);
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlCheckboxGroup">
    <WlCheckboxGroup
      v-model="selected"
      v-bind="preview"
      :options="options"
      option-value="value"
      option-disabled="disabled"
      :legend="t('documentation.strings.generatedWlCheckboxGroupLabel')"
      orientation="horizontal"
      :invalid="selected.length === 0"
    />
    <p v-if="selected.length === 0" role="alert">{{ t("documentation.strings.generatedWlCheckboxGroupValidation") }}</p>
    <div class="wl-inline" data-space="sm">
      <WlButton size="sm" @click="selected = []">{{ t("documentation.strings.reviewNewClear") }}</WlButton>
      <WlButton size="sm" @click="selected = ['read']">{{ t("documentation.strings.reviewNewReset") }}</WlButton>
    </div>
    <output :aria-label="t('documentation.strings.generatedWlCheckboxGroupLabel')">{{ selected.join(", ") }}</output>
    <p class="wl-text-small">{{ t("documentation.strings.generatedWlCheckboxGroupA11yKeyboard") }}</p>
  </div>
</template>
