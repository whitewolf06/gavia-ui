<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlRadioGroup } from "gavia-ui";
import { computed, ref } from "vue";
const selected = ref<string>();
const options = computed(() => [
  { value: "basic", label: t("documentation.strings.generatedWlRadioGroupBasic") },
  { value: "team", label: t("documentation.strings.generatedWlRadioGroupTeam") },
  { value: "enterprise", label: t("documentation.strings.generatedWlRadioGroupEnterprise"), disabled: true }
]);
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlRadioGroup">
    <WlRadioGroup
      v-model="selected"
      v-bind="preview"
      :options="options"
      option-value="value"
      option-disabled="disabled"
      :legend="t('documentation.strings.generatedWlRadioGroupLabel')"
      orientation="horizontal"
      :invalid="!selected"
    />
    <p v-if="!selected" role="alert">{{ t("documentation.strings.generatedWlRadioGroupValidation") }}</p>
    <div class="wl-inline" data-space="sm">
      <WlButton size="sm" @click="selected = undefined">{{ t("documentation.strings.reviewNewClear") }}</WlButton>
      <WlButton size="sm" @click="selected = 'basic'">{{ t("documentation.strings.reviewNewReset") }}</WlButton>
    </div>
    <output :aria-label="t('documentation.strings.generatedWlRadioGroupLabel')">{{ selected ?? "—" }}</output>
    <p class="wl-text-small">{{ t("documentation.strings.generatedWlRadioGroupA11yKeyboard") }}</p>
  </div>
</template>
