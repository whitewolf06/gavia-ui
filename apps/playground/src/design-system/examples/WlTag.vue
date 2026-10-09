<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlTag, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTag v-if="visible" removable :remove-label="t('examples.remove_design_tag_0136')" v-bind="preview" @remove="visible = false">{{ t("examples.design_0079") }}</WlTag><WlButton v-else size="sm" @click="visible = true">{{ t("examples.restore_tag_0137") }}</WlButton>
  </div>
</template>
