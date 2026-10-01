<script setup lang="ts">
import { ref } from "vue";
import { WlSelect } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>('team');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSelect v-model="value" :options="[{ label: 'Команда', value: 'team' }, { label: 'Личное', value: 'personal' }]" option-label="label" option-value="value" aria-label="Область" v-bind="preview" />
  </div>
</template>
