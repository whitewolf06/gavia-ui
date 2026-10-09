<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlAlert, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAlert v-if="visible" :title="t('examples.changes_saved_0005')" closable v-bind="preview" @close="visible = false">{{ t("examples.you_can_continue_working_0006") }}<template #action><WlButton size="sm" variant="ghost" @click="visible = false">{{ t("examples.got_it_0007") }}</WlButton></template></WlAlert><WlButton v-else @click="visible = true">{{ t("examples.show_notification_0008") }}</WlButton>
  </div>
</template>
