<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlTooltipComponent } from "gavia-ui";
import { ref } from "vue";
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlTooltipComponent">
    <div class="wl-inline" data-space="md">
      <WlTooltipComponent v-model:visible="visible" v-bind="preview">
        <WlButton size="sm">{{ t("documentation.strings.generatedWlTooltipComponentLabel") }}</WlButton>
        <template #content><strong>{{ t("documentation.strings.generatedWlTooltipComponentContent") }}</strong></template>
      </WlTooltipComponent>
      <WlTooltipComponent :content="t('documentation.strings.generatedWlTooltipComponentDisabledContent')">
        <WlButton size="sm" disabled>{{ t("documentation.strings.generatedWlTooltipComponentDisabled") }}</WlButton>
      </WlTooltipComponent>
      <WlButton size="sm" @click="visible = !visible">{{ t("documentation.strings.generatedWlTooltipComponentToggle") }}</WlButton>
    </div>
    <p class="wl-text-small">{{ t("documentation.strings.generatedWlTooltipComponentA11yKeyboard") }}</p>
  </div>
</template>
