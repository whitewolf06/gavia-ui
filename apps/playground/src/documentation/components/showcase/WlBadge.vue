<script setup lang="ts">
import { ref } from "vue";
import { WlBadge, WlButton, type WlBadgeVariant } from "../../../../../../packages/ui-kit/src";
const values = { gray: "12", accent: "3", success: "OK", warn: "5", danger: "9" } satisfies Record<WlBadgeVariant, string>;
const unread = ref(3);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><span v-for="(value, variant) in values" :key="variant" class="wl-inline" data-space="xs"><WlBadge :value="value" :variant="variant" /><span class="wl-text-small">{{ variant }}</span></span></div>
    <div class="wl-inline" data-space="md"><span v-for="(value, variant) in values" :key="variant" class="wl-inline" data-space="xs"><WlBadge dot :variant="variant" aria-hidden="true" /><span class="wl-text-small">Статус {{ variant }}</span></span></div>
    <div class="wl-inline" data-space="sm"><span class="wl-text-body">Непрочитанных: <WlBadge :value="unread" /></span><WlButton size="sm" :disabled="unread === 0" @click="unread = 0">Отметить прочитанными</WlButton><WlButton size="sm" variant="ghost" @click="unread = 3">Вернуть счётчик</WlButton></div>
  </div>
</template>
