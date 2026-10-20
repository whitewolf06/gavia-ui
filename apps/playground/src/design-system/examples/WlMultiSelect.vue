<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlMultiSelect } from "gavia-ui";
import { computed, ref } from "vue";
const value = ref(["design", "code"]);
const options = computed(() => [{
  label: t("examples.areas_0082"),
  items: [
    { label: t("examples.design_0079"), value: "design", disabled: false },
    { label: t("examples.development_0080"), value: "code", disabled: false },
    { label: t("examples.research_0081"), value: "research", disabled: true }
  ]
}]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMultiSelect
      v-model="value"
      :options="options"
      option-group-label="label"
      option-group-children="items"
      option-label="label"
      option-value="value"
      option-disabled="disabled"
      show-select-all
      filter
      display="chip"
      :aria-label="t('examples.areas_0082')"
      v-bind="preview"
    />
  </div>
</template>
