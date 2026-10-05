<script setup lang="ts">
import { ref } from "vue";
import { WlTimePicker, WlField } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>("09:30");
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlField label="Время встречи" id="example-time" hint="С 08:00 до 18:00; пустое поле возвращает null." v-slot="field">
      <WlTimePicker v-model="value" :id="field.id" :aria-describedby="field.ariaDescribedby"
        min-time="08:00" max-time="18:00" v-bind="preview" />
    </WlField>
    <p class="wl-text-small" role="status">Выбрано: {{ value ?? 'время не задано' }}</p>
  </div>
</template>
