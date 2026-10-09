<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCheckbox } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCheckbox v-model="value" v-bind="preview">{{ t("examples.receive_updates_0027") }}</WlCheckbox>
  </div>
</template>
