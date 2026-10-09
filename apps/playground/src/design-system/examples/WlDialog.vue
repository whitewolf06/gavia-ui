<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlDialog, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">{{ t("examples.open_dialog_0044") }}</WlButton><WlDialog v-model:visible="visible" :header="t('examples.material_details_0045')" width="480px" v-bind="preview"><p class="wl-text-body">{{ t("examples.escape_closes_the_dialog_and_restores_focus_0046") }}</p><template #footer><WlButton @click="visible = false">{{ t("examples.done_0047") }}</WlButton></template></WlDialog>
  </div>
</template>
