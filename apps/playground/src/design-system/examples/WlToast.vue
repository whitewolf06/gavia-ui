<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { useWlToast, WlButton } from "gavia-ui";
const toast = useWlToast();
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- Mount WlToast once in the application root. -->
    <div class="wl-inline" data-space="sm">
      <WlButton @click="toast.show(t('examples.material_saved_0143'), { tone: 'success' })">
        {{ t("examples.success_0144") }}
      </WlButton>
      <WlButton @click="toast.show(t('examples.could_not_save_0145'), { tone: 'danger', detail: t('examples.try_again_0146') })">
        {{ t("examples.error_0147") }}
      </WlButton>
    </div>
  </div>
</template>
