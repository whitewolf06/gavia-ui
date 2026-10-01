<script setup lang="ts">
import { ref } from "vue";
import { WlMultiSelect } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(['design', 'code']);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMultiSelect v-model="value" :options="[{ label: 'Дизайн', value: 'design' }, { label: 'Разработка', value: 'code' }, { label: 'Исследования', value: 'research' }]" option-label="label" option-value="value" display="chip" aria-label="Направления" v-bind="preview" />
  </div>
</template>
