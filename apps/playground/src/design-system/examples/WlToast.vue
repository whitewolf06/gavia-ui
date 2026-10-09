<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, useWlToast } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const toast = useWlToast();
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- WlToast монтируется один раз в App.vue; см. подключение ниже. -->
    <div class="wl-inline" data-space="sm"><WlButton @click="toast.ok(t('examples.material_saved_0143'))">{{ t("examples.success_0144") }}</WlButton><WlButton @click="toast.err(t('examples.could_not_save_0145'), t('examples.try_again_0146'))">{{ t("examples.error_0147") }}</WlButton></div>
  </div>
</template>
