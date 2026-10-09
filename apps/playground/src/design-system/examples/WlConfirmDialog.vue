<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, useWlConfirm } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const confirm = useWlConfirm();
const removed = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- WlConfirmDialog монтируется один раз в App.vue. -->
    <WlButton variant="danger" @click="confirm.confirmDanger({ header: t('examples.delete_material_0035'), message: t('examples.deletion_cannot_be_undone_0036'), acceptLabel: t('examples.delete_0037'), rejectLabel: t('examples.cancel_0038'), accept: () => removed = true })">{{ t("examples.delete_material_0039") }}</WlButton><p class="wl-text-small" role="status">{{ removed ? t("examples.material_deleted_0040") : t("examples.material_was_not_deleted_0041") }}</p>
  </div>
</template>
