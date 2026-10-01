<script setup lang="ts">
import { ref } from "vue";
import { WlField, WlInput } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlField label="Название материала" id="state-field-name" required hint="До 80 символов." v-bind="preview" v-slot="field"><WlInput :id="field.id" v-model="value" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="80" required /></WlField>
  </div>
</template>
