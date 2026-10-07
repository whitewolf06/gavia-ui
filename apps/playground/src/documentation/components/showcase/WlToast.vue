<script setup lang="ts">
import { ref } from "vue";
import { WlButton, useWlToast } from "../../../../../../packages/ui-kit/src";
// Install WlToastService and mount one WlToast in the application root.
const toast = useWlToast();
const shown = ref(0);
function show(kind: "ok" | "info" | "warn" | "err"): void {
  const messages = { ok: "Материал сохранён", info: "Доступна новая версия", warn: "Проверьте свободное место", err: "Не удалось сохранить" };
  toast[kind](messages[kind], kind === "err" ? "Черновик сохранён. Повторите попытку." : "Уведомление локального примера.");
  shown.value++;
}
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton variant="soft" @click="show('ok')">Показать успех</WlButton><WlButton @click="show('info')">Показать информацию</WlButton><WlButton @click="show('warn')">Показать предупреждение</WlButton><WlButton variant="danger-quiet" @click="show('err')">Показать ошибку</WlButton></div>
    <p class="wl-text-small" role="status">Показано уведомлений: {{ shown }}.</p>
    <p class="wl-text-small wl-text-muted">Один контейнер приложения принимает все сообщения. Важные ошибки дополнительно показывайте рядом с проблемным полем или действием.</p>
  </div>
</template>
