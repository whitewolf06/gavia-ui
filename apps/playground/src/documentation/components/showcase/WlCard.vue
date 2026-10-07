<script setup lang="ts">
import { ref } from "vue";
import { WlCard, WlButton, WlTag } from "../../../../../../packages/ui-kit/src";
const opened = ref("");
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="showcase-cards">
      <WlCard aria-labelledby="showcase-card-sprint"><template #title><h3 id="showcase-card-sprint" class="wl-text-subheading">Спринт 24</h3></template><template #subtitle>Командная работа · 8 задач</template><p class="wl-text-body">Три задачи на ревью, демонстрация в пятницу.</p><template #footer><WlButton size="sm" variant="soft" @click="opened = 'Спринт 24'">Открыть доску</WlButton><span class="wl-text-small wl-text-muted">Обновлено сегодня</span></template></WlCard>
      <WlCard hoverable aria-labelledby="showcase-card-note"><template #header><div class="showcase-card-banner"><WlTag variant="blue">Материал команды</WlTag></div></template><template #title><h3 id="showcase-card-note" class="wl-text-subheading">Заметка о продукте</h3></template><template #subtitle>План следующего выпуска</template><p class="wl-text-body">Hoverable усиливает оформление; действие остаётся отдельной доступной кнопкой.</p><template #footer><WlButton size="sm" @click="opened = 'Заметка о продукте'">Читать заметку</WlButton><WlTag variant="green">Новая</WlTag></template></WlCard>
    </div>
    <p class="wl-text-small" role="status">{{ opened ? 'Открыто: ' + opened : 'Выберите действие карточки.' }}</p>
  </div>
</template>
<style scoped>
.showcase-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--wl-space-lg); }
.showcase-card-banner { padding: var(--wl-space-lg); background: var(--wl-accent-soft); }
</style>
