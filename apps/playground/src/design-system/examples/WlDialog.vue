<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlDialog, WlInput } from "gavia-ui";
import { ref } from "vue";
const visible = ref(false);
const title = ref(t("examples.team_guide_0016"));
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">{{ t("examples.open_dialog_0044") }}</WlButton><WlDialog
      v-model:visible="visible"
      :header="t('examples.material_details_0045')"
      size="lg"
      fullscreen="mobile"
      initial-focus=".example-dialog-title"
      v-bind="preview"
    >
      <div class="wl-stack" data-space="md">
        <WlInput v-model="title" class="example-dialog-title" :aria-label="t('examples.material_0074')" />
        <p class="wl-text-body">{{ t("examples.escape_closes_the_dialog_and_restores_focus_0046") }}</p>
      </div>
      <template #footer><WlButton @click="visible = false">{{ t("examples.done_0047") }}</WlButton></template>
    </WlDialog>
  </div>
</template>
