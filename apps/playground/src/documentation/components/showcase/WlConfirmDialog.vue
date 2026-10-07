<script setup lang="ts">
import { ref } from "vue";
import { WlButton, useWlConfirm } from "../../../../../../packages/ui-kit/src";
// Install WlConfirmationService and mount one WlConfirmDialog in the root.
const confirm = useWlConfirm();
const removed = ref(false);
const result = ref("Ожидается действие.");
function share(): void { confirm.confirm({ header: "Поделиться планом?", message: "В этом примере изменится только локальный статус.", acceptLabel: "Поделиться", rejectLabel: "Не сейчас", accept: () => result.value = "План отмечен как общий.", reject: () => result.value = "Публикация отменена." }); }
function remove(): void { confirm.confirmDanger({ header: "Удалить черновик?", message: "Перед удалением сохраните нужные данные.", acceptLabel: "Удалить черновик", rejectLabel: "Оставить", accept: () => { removed.value = true; result.value = "Черновик удалён в локальном примере."; }, reject: () => result.value = "Черновик оставлен." }); }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton @click="share">Поделиться планом</WlButton><WlButton variant="danger" :disabled="removed" @click="remove">Удалить с подтверждением</WlButton><WlButton v-if="removed" variant="ghost" @click="removed = false; result = 'Черновик восстановлен для повторной проверки.'">Повторить пример</WlButton></div>
    <p class="wl-text-small" role="status">{{ result }}</p>
    <p class="wl-text-small wl-text-muted">Обычный confirm и опасный confirmDanger используют один контейнер. Обработчики accept/reject принадлежат приложению.</p>
  </div>
</template>
