<script setup lang="ts">
import { ref } from "vue";
import { WlButton, type WlButtonVariant } from "../../../../../packages/ui-kit/src";
// The public union makes a missing or unsupported variant a type error.
const labels = {
  primary: "Создать",
  secondary: "Черновик",
  ghost: "Отмена",
  soft: "Поделиться",
  danger: "Удалить",
  "danger-quiet": "Удалить тихо",
  "soft-danger": "Архив",
  link: "Подробнее"
} satisfies Record<WlButtonVariant, string>;
const variants = Object.keys(labels) as WlButtonVariant[];
const lastAction = ref("");
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="button-variant-grid">
      <div v-for="variant in variants" :key="variant" class="wl-stack" data-space="sm">
        <div><WlButton :variant="variant" @click="lastAction = labels[variant]">{{ labels[variant] }}</WlButton></div>
        <code class="wl-text-small">{{ variant }}</code>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ lastAction ? 'Последнее действие: ' + lastAction : 'Выберите любой вариант: все восемь кнопок выполняют локальное действие.' }}</p>
  </div>
</template>

<style scoped>
.button-variant-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: var(--wl-space-lg); align-items: start; }
</style>
