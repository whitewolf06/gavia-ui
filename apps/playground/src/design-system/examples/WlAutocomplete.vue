<script setup lang="ts">
import { ref } from "vue";
import { WlAutocomplete } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<unknown>('Анна');
const suggestions = ref(['Анна', 'Андрей', 'Мария']);
function complete(event: { query: string }): void {
  suggestions.value = ['Анна', 'Андрей', 'Мария'].filter((name) => name.toLowerCase().includes(event.query.toLowerCase()));
}
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAutocomplete v-model="value" :suggestions="suggestions" dropdown aria-label="Участник" v-bind="preview" @complete="complete" />
  </div>
</template>
