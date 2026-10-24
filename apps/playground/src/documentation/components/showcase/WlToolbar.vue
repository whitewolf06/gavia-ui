<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlToolbar } from "gavia-ui";
import { ref } from "vue";
const bold = ref(false);
const italic = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlToolbar">
    <WlToolbar v-bind="preview" :aria-label="t('documentation.strings.generatedWlToolbarLabel')">
      <WlButton size="sm" :aria-pressed="bold" @click="bold = !bold">{{ t("documentation.strings.generatedWlToolbarBold") }}</WlButton>
      <WlButton size="sm" disabled>{{ t("documentation.strings.generatedWlToolbarUnavailable") }}</WlButton>
      <WlButton
        size="sm"
        :aria-pressed="italic"
        @click="italic = !italic"
      >{{ t("documentation.strings.generatedWlToolbarItalic") }}</WlButton>
    </WlToolbar>
    <p :style="{ fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal' }">
      {{ t("documentation.strings.generatedWlToolbarSample") }}
    </p>
    <WlButton size="sm" @click="bold = false; italic = false">{{ t("documentation.strings.reviewNewReset") }}</WlButton>
    <p class="wl-text-small">{{ t("documentation.strings.generatedWlToolbarA11yKeyboard") }}</p>
  </div>
</template>
