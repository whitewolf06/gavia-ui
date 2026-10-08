<script setup lang="ts">
import { ref } from "vue";
import { WlButton, useWlConfirm } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const confirm = useWlConfirm();
const removed = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- WlConfirmDialog монтируется один раз в App.vue. -->
    <WlButton variant="danger" @click="confirm.confirmDanger({ header: 'Удалить материал?', message: 'Удаление нельзя отменить.', acceptLabel: 'Удалить', rejectLabel: 'Отмена', accept: () => removed = true })">Удалить материал</WlButton><p class="wl-text-small" role="status">{{ removed ? 'Материал удалён.' : 'Материал не удалён.' }}</p>
  </div>
</template>
