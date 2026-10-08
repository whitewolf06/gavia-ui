<script setup lang="ts">
import { nextTick, ref } from "vue";
import { WlAlert, WlButton } from "../../../../../../packages/ui-kit/src";
const error = ref(true);
const attempts = ref(0);
const errorRegion = ref<HTMLElement | null>(null);
async function showError(visible: boolean, retry = false): Promise<void> {
  if (retry) attempts.value++;
  error.value = visible;
  await nextTick();
  errorRegion.value?.querySelector<HTMLButtonElement>("button")?.focus();
}
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlAlert variant="info" title="Совет">Настройки сохраняются в вашем приложении.</WlAlert>
    <WlAlert variant="ok" title="Сохранено">Все изменения записаны в локальном примере.</WlAlert>
    <WlAlert variant="warn" title="Мало места">Освободите место перед следующим вложением.<template #action><WlButton size="sm" @click="attempts++">Проверить место</WlButton></template></WlAlert>
    <div ref="errorRegion"><WlAlert v-if="error" variant="err" title="Не удалось сохранить" closable close-label="Скрыть сообщение об ошибке" @close="showError(false)">Черновик сохранён, повторите попытку.<template #action><WlButton size="sm" @click="showError(false, true)">Повторить сохранение</WlButton></template></WlAlert>
    <div v-else><WlButton size="sm" variant="soft" @click="showError(true)">Показать ошибку снова</WlButton></div></div>
    <p class="wl-text-small" role="status">Проверок в примере: {{ attempts }}. Ошибка: {{ error ? 'видна' : 'скрыта' }}.</p>
  </div>
</template>
