<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlSelect } from "gavia-ui";
import { computed, ref } from "vue";
const value = ref<string | null>("team");
const options = computed(() => [{
  label: t("examples.scope_0116"),
  items: [
    { label: t("examples.team_0086"), value: "team", disabled: false },
    { label: t("examples.personal_0115"), value: "personal", disabled: false },
    { label: t("examples.research_0081"), value: "research", disabled: true }
  ]
}]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSelect
      v-model="value"
      :options="options"
      option-group-label="label"
      option-group-children="items"
      option-label="label"
      option-value="value"
      option-disabled="disabled"
      filter
      clearable
      :aria-label="t('examples.scope_0116')"
      v-bind="preview"
    />
  </div>
</template>
