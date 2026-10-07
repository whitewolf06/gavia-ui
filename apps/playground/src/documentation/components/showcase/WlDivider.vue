<script setup lang="ts">
import { ref } from "vue";
import { WlDivider, WlButton } from "../../../../../../packages/ui-kit/src";
const selected = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <p class="wl-text-body">Простая линия разделяет независимые части содержимого.</p><WlDivider />
    <div><WlButton variant="primary" @click="selected = true">Войти по почте</WlButton></div>
    <WlDivider>или</WlDivider>
    <p class="wl-text-body">Продолжить другим способом.</p>
    <WlDivider><span class="wl-text-small wl-text-muted">Следующий раздел</span></WlDivider>
    <p v-if="selected" class="wl-text-small" role="status">Выбран вход по почте в локальном примере.</p>
    <p class="wl-text-small wl-text-muted">Подпись в default-слоте — часть разделителя, а заголовки разделов задаются отдельно.</p>
  </div>
</template>
