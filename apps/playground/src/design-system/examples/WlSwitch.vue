<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlSwitch } from "gavia-ui";
import { ref } from "vue";
const value = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSwitch v-model="value" :aria-label="t('examples.email_notifications_0131')" v-bind="preview">
      {{ t("examples.email_notifications_0131") }}
    </WlSwitch>
  </div>
</template>
