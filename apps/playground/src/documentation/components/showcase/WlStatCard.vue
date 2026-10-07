<script setup lang="ts">
import { ref } from "vue";
import { WlStatCard, WlButton } from "../../../../../../packages/ui-kit/src";
const completed = ref(7);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="showcase-stats">
      <WlStatCard icon="check" label="Задач готово" :value="String(completed)" description="из 10 задач в локальном примере" :progress="completed * 10" tone="success" />
      <WlStatCard icon="eye" label="Фокус команды" value="План выпуска" description="2 из 5 разделов готовы" :progress="40" />
      <WlStatCard icon="clock" label="Время проверки" description="за текущую сессию"><strong>1 ч 20 мин</strong><template #footer><span class="wl-text-small wl-text-muted">Default-слот заменяет value; footer добавляет контекст.</span></template></WlStatCard>
    </div>
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="completed === 10" @click="completed++">Завершить задачу в примере</WlButton><WlButton size="sm" variant="ghost" @click="completed = 7">Вернуть исходную метрику</WlButton></div>
  </div>
</template>
<style scoped>
.showcase-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--wl-space-lg); }
</style>
