<script setup lang="ts">
import { ref } from "vue";
import { WlSkeleton, WlButton, WlAvatar } from "../../../../../../packages/ui-kit/src";
const loading = ref(true);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlButton size="sm" @click="loading = !loading">{{ loading ? 'Показать готовую карточку' : 'Повторить загрузку карточки' }}</WlButton></div>
    <article class="wl-surface wl-stack" data-space="lg" :aria-busy="loading" aria-label="Карточка участника">
      <div v-if="loading" class="wl-stack" data-space="md"><div class="wl-inline" data-space="md"><WlSkeleton shape="circle" width="40px" height="40px" /><div class="showcase-skeleton-lines wl-stack" data-space="sm"><WlSkeleton height="14px" width="70%" /><WlSkeleton height="11px" width="45%" /></div></div><WlSkeleton height="12px" /><WlSkeleton height="12px" width="80%" /><WlSkeleton height="48px" border-radius="8px" /></div>
      <div v-else class="wl-stack" data-space="md"><div class="wl-inline" data-space="md"><WlAvatar label="ДГ" :size="36" /><h3 class="wl-text-subheading">Дмитрий</h3></div><p class="wl-text-body">Материалы готовы к проверке. Формы rectangle и circle задавали геометрию загрузки.</p></div>
    </article>
    <p class="wl-text-small" role="status">{{ loading ? 'Загружаем карточку участника…' : 'Карточка участника загружена.' }}</p>
  </div>
</template>
<style scoped>
.showcase-skeleton-lines { flex: 1; min-width: 0; }
</style>
