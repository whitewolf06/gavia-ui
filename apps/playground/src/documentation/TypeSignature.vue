<script setup lang="ts">
import { computed } from "vue";
import { documentationTypeParts } from "./type-signature";

const props = defineProps<{ value: string }>();
const parts = computed(() => documentationTypeParts(props.value));
</script>

<template>
  <code class="docs-type-signature"><template v-for="(part, index) in parts" :key="index">{{ part }}<wbr
    v-if="part === '<' || part === '|' || part === ','"
  /></template></code>
</template>

<style scoped>
.docs-type-signature {
  font-family: var(--wl-mono);
  white-space: normal;
  overflow-wrap: normal;
  word-break: normal;
}
</style>
