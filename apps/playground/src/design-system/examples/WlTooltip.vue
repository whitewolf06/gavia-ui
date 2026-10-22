<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlTooltip } from "gavia-ui";
import { ref } from "vue";
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlTooltip">
    <div class="wl-inline" data-space="md">
      <WlTooltip v-model:visible="visible" v-bind="preview">
        <WlButton size="sm">{{ t("documentation.strings.generatedWlTooltipLabel") }}</WlButton>
        <template #content><strong>{{ t("documentation.strings.generatedWlTooltipContent") }}</strong></template>
      </WlTooltip>
      <WlTooltip :content="t('documentation.strings.generatedWlTooltipDisabledContent')">
        <WlButton size="sm" disabled>{{ t("documentation.strings.generatedWlTooltipDisabled") }}</WlButton>
      </WlTooltip>
      <WlButton size="sm" @click="visible = !visible">{{ t("documentation.strings.generatedWlTooltipToggle") }}</WlButton>
    </div>
    <p class="wl-text-small">{{ t("documentation.strings.generatedWlTooltipA11yKeyboard") }}</p>
  </div>
</template>
