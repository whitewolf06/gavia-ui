<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlTextarea } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(t("examples.material_description_the_next_line_is_preserved_0138"));
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTextarea v-model="value" :aria-label="t('examples.material_description_0139')" :rows="3" auto-resize v-bind="preview" />
  </div>
</template>
