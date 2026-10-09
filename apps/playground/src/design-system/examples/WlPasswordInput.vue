<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPasswordInput } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('Example123!');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPasswordInput v-model="value" :aria-label="t('examples.password_0090')" autocomplete="new-password" v-bind="preview" />
  </div>
</template>
