<script setup lang="ts">
import type { ChangelogInline } from "./changelog";

defineProps<{ content: ChangelogInline[] }>();
</script>

<template>
  <template v-for="(part, index) in content" :key="index">
    <code v-if="part.kind === 'code'" class="project-inline-code wl-text-code">{{ part.value }}</code>
    <a v-else-if="part.kind === 'link'" class="project-link" :href="part.href">{{ part.label }}</a>
    <template v-else>{{ part.value }}</template>
  </template>
</template>
