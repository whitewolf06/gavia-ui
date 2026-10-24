<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlTag } from "gavia-ui";
import { ref } from "vue";
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTag
      v-if="visible"
      removable
      color="blue"
      tone="info"
      icon="check"
      size="sm"
      :remove-label="t('examples.remove_design_tag_0136')"
      v-bind="preview"
      @remove="visible = false"
    >{{ t("examples.design_0079") }}</WlTag>
    <WlButton v-else size="sm" @click="visible = true">{{ t("examples.restore_tag_0137") }}</WlButton>
  </div>
</template>
