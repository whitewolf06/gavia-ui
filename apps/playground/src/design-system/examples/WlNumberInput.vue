<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlNumberInput } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(3);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlNumberInput v-model="value" :min="1" :max="10" :aria-label="t('examples.quantity_0084')" v-bind="preview" />
  </div>
</template>
