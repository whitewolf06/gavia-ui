<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlChip } from "gavia-ui";
import { ref } from "vue";
const active = ref(false);
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlChip
      v-if="visible"
      v-model:active="active"
      :count="5"
      removable
      size="sm"
      :remove-label="t('examples.remove_design_tag_0136')"
      v-bind="preview"
      @remove="visible = false"
    >{{ t("examples.design_0079") }}</WlChip>
    <WlButton v-else size="sm" @click="visible = true">{{ t("examples.restore_tag_0137") }}</WlButton>
  </div>
</template>
