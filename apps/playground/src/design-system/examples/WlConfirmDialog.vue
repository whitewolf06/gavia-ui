<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { useWlConfirm, WlButton } from "gavia-ui";
import { ref } from "vue";
const confirm = useWlConfirm();
const removed = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- Mount WlConfirmDialog once in App.vue. -->
    <WlButton
      variant="primary"
      tone="danger"
      @click="confirm.confirm({
        tone: 'danger', header: t('examples.delete_material_0035'),
        message: t('examples.deletion_cannot_be_undone_0036'),
        acceptLabel: t('examples.delete_0037'), rejectLabel: t('examples.cancel_0038'),
        accept: () => removed = true
      })"
    >{{ t("examples.delete_material_0039") }}</WlButton>
    <p class="wl-text-small" role="status">
      {{ removed ? t("examples.material_deleted_0040") : t("examples.material_was_not_deleted_0041") }}
    </p>
  </div>
</template>
