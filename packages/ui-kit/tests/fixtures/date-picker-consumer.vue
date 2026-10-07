<script setup lang="ts">
import { ref } from "vue";
import { WlDatePicker, type WlDateRange } from "../../src";
const single = ref<string | null>(null);
const range = ref<WlDateRange | null>(null);
</script>
<template>
  <WlDatePicker v-model="single" />
  <WlDatePicker v-model="single" selection-mode="single" />
  <WlDatePicker v-model="range" selection-mode="range" />
</template>
